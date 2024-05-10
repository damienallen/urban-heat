import asyncio
import os
from datetime import datetime
from pathlib import Path

import aiofiles
import httpx
import typer
from tqdm import tqdm

from urban_heat.tasks import BAND, DATASET_NAME, DOWNLOADS_DIR, SERVICE_URL
from urban_heat.tasks.inventory import get_auth_header, get_pending


def download_scenes(downloads_dir: Path = DOWNLOADS_DIR):
    headers = get_auth_header()

    print("Querying pending downloads...")
    pending_inventory = get_pending()

    print("Fetching pending download metadata...")
    r = httpx.post(
        f"{SERVICE_URL}/download-options",
        json={
            "datasetName": DATASET_NAME,
            "entityIds": list(set([s.entity_id for s in pending_inventory.scenes])),
        },
        headers=headers,
        timeout=60,
    )
    r.raise_for_status()

    products_list = r.json()["data"]
    if not products_list:
        print("All images already downloaded.")
        return

    requested_downloads = {}
    for product in products_list:
        if product["available"]:
            entity_id = "L2ST_" + product["displayId"] + BAND
            requested_downloads[entity_id] = {
                "entityId": "L2ST_" + product["displayId"] + BAND,
                "productId": product["secondaryDownloads"][0]["id"],
            }

    label = datetime.now().strftime("%Y%m%d_%H%M%S")

    r = httpx.post(
        f"{SERVICE_URL}/download-request",
        json={"downloads": [d for d in requested_downloads.values()], "label": label},
        headers=headers,
        timeout=60,
    )
    r.raise_for_status()

    downloads = [d["url"] for d in r.json()["data"]["availableDownloads"]]
    remaining_downloads = r.json()["data"]["remainingLimits"][0]["recentDownloadCount"]
    print(f"Found {len(downloads)} avilable downloads ({remaining_downloads} remaining in quota)")

    for url in tqdm(downloads, desc="Downloading scenes"):
        r = httpx.get(url, timeout=60)

        filename = os.path.basename(url).split("?")[0]
        if not r.status_code == 200:
            print(f"DOWNLOAD FAILED: {filename}")
            continue

        with open(downloads_dir / filename, "wb") as f:
            f.write(r.content)

    print("Done")


if __name__ == "__main__":
    typer.run(download_scenes)
