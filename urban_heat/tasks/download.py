import asyncio
import os
from datetime import datetime
from pathlib import Path

import httpx
import typer
from aiofiles import open as aio_open
from aiotinydb import AIOTinyDB
from tqdm.asyncio import tqdm

from urban_heat.tasks import BAND, DATASET_NAME, DOWNLOADS_DIR, SERVICE_URL, get_auth_header_async
from urban_heat.tasks.utils.inventory import Scene, Scenes, aio_db, db, report_inventory_async

BATCH_SIZE = 200
MAX_CONCURRENT = 10
RETRY_TIMEOUT = 300


async def process_downloads(downloads: list[str], downloads_dir: Path):
    async with httpx.AsyncClient() as client:
        async with aio_db as adb:
            semaphore = asyncio.Semaphore(MAX_CONCURRENT)
            tasks = [
                asyncio.create_task(download_file(url, downloads_dir, client, adb, semaphore))
                for url in downloads
            ]
            await tqdm.gather(
                *tasks,
                desc="Downloading scenes",
            )


async def download_file(
    url: str,
    downloads_dir: Path,
    client: httpx.AsyncClient,
    adb: AIOTinyDB,
    semaphore: asyncio.Semaphore,
):
    filename = os.path.basename(url).split("?")[0]
    async with semaphore:
        try:
            r = await client.get(url, timeout=60)
        except httpx.ReadError:
            print(f"[READ ERROR] Download Failed: {filename}")
            adb.update({"failed": True}, (Scenes.display_id == filename[:-11]))
            return

        if not r.status_code == 200:
            print(f"[{r.status_code}] Download Failed: {filename}")
            adb.update({"failed": True}, (Scenes.display_id == filename[:-11]))
            return

        async with aio_open(downloads_dir / filename, "wb") as f:
            async for chunk in r.aiter_bytes():
                await f.write(chunk)

        adb.update({"saved": True, "failed": False}, (Scenes.display_id == filename[:-11]))


async def request_downloads(scenes: list[Scene]) -> list[str]:
    async with httpx.AsyncClient() as client:
        headers = await get_auth_header_async(client)
        r = await client.post(
            f"{SERVICE_URL}/download-options",
            json={
                "datasetName": DATASET_NAME,
                "entityIds": list(set([s.entity_id for s in scenes])),
            },
            headers=headers,
            timeout=60,
        )
        r.raise_for_status()

        if products_list := r.json()["data"]:
            requested_downloads = {}
            for product in products_list:
                display_id = product["displayId"]
                if product["available"]:
                    entity_id = "L2ST_" + display_id + BAND
                    requested_downloads[entity_id] = {
                        "entityId": "L2ST_" + display_id + BAND,
                        "productId": product["secondaryDownloads"][0]["id"],
                    }
                else:
                    db.update(
                        {"saved": False, "failed": False, "skipped": True},
                        (Scenes.display_id == display_id),
                    )

            label = datetime.now().strftime("%Y%m%d_%H%M%S")

            r = await client.post(
                f"{SERVICE_URL}/download-request",
                json={"downloads": [d for d in requested_downloads.values()], "label": label},
                headers=headers,
                timeout=60,
            )
            r.raise_for_status()

    return [d["url"] for d in r.json()["data"]["availableDownloads"]]


async def consume_queue(batch_size: int, downloads_dir: Path):
    print("Starting download queue...")
    await report_inventory_async()

    while True:
        try:
            async with aio_db as db:
                pending_inventory = db.search((Scenes.saved == False) & (Scenes.skipped == False))

            if len(pending_inventory) < 1:
                print("Finished processing download queue.")
                break

            scene_batch = [Scene(**s) for s in pending_inventory[:batch_size]]
            downloads = await request_downloads(scene_batch[:batch_size])
            await process_downloads(downloads, downloads_dir)
            await report_inventory_async()

        except httpx.ReadTimeout:
            print(f"Server timed out, likely an issue with USGS EROS. Waiting {RETRY_TIMEOUT}s...")
            await asyncio.sleep(RETRY_TIMEOUT)


def start(batch_size: int = BATCH_SIZE, downloads_dir: Path = DOWNLOADS_DIR):
    asyncio.run(consume_queue(batch_size, downloads_dir))


if __name__ == "__main__":
    typer.run(start)
