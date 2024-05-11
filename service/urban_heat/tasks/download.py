import asyncio
import os
from datetime import datetime
from pathlib import Path

import httpx
import typer
from aiofiles import open as aio_open
from aiotinydb import AIOTinyDB
from tqdm.asyncio import tqdm

from urban_heat.tasks import BAND, DATASET_NAME, DOWNLOADS_DIR, SERVICE_URL, get_auth_header
from urban_heat.tasks.inventory import Scene, Scenes, aio_db, report_inventory_async

BATCH_SIZE = 50
MAX_CONCURRENT = 5


async def process_downloads(downloads: list[str], downloads_dir: Path):
    async with httpx.AsyncClient() as client:
        async with aio_db as db:
            semaphore = asyncio.Semaphore(MAX_CONCURRENT)
            tasks = [
                asyncio.create_task(download_file(url, downloads_dir, client, db, semaphore))
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
    db: AIOTinyDB,
    semaphore: asyncio.Semaphore,
):
    async with semaphore:
        r = await client.get(url, timeout=60)
        filename = os.path.basename(url).split("?")[0]

        if not r.status_code == 200:
            print(f"DOWNLOAD FAILED: {filename}")
            db.update({"failed": True}, (Scenes.display_id == filename[:-11]))
            return

        async with aio_open(downloads_dir / filename, "wb") as f:
            async for chunk in r.aiter_bytes():
                await f.write(chunk)

        db.update({"saved": True, "failed": False}, (Scenes.display_id == filename[:-11]))


async def request_downloads(scenes: list[Scene], headers: dict[str, str]) -> list[str]:
    async with httpx.AsyncClient() as client:
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
                if product["available"]:
                    entity_id = "L2ST_" + product["displayId"] + BAND
                    requested_downloads[entity_id] = {
                        "entityId": "L2ST_" + product["displayId"] + BAND,
                        "productId": product["secondaryDownloads"][0]["id"],
                    }

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
    headers = get_auth_header()

    while True:
        async with aio_db as db:
            pending_inventory = db.search((Scenes.saved == False) & (Scenes.skipped == False))

        if len(pending_inventory) < 1:
            print("Finished processing download queue.")
            break

        scene_batch = [Scene(**s) for s in pending_inventory[:batch_size]]
        print(f"Downloading batch of {len(scene_batch)} scenes")

        downloads = await request_downloads(scene_batch[:batch_size], headers)
        await process_downloads(downloads, downloads_dir)
        await report_inventory_async()


def start(batch_size: int = BATCH_SIZE, downloads_dir: Path = DOWNLOADS_DIR):
    asyncio.run(consume_queue(batch_size, downloads_dir))


if __name__ == "__main__":
    typer.run(start)
