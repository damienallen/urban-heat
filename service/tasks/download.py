import asyncio
import os
from datetime import datetime
from pathlib import Path

import aiofiles
import geopandas as gpd
import httpx
import typer
import yaml
from pydantic import BaseModel
from tqdm import tqdm

from tasks import APP_DIR, DOWNLOADS_DIR, DOWNLOADS_YAML_PATH

SERVICE_URL = "https://m2m.cr.usgs.gov/api/api/json/stable"
DATASET_NAME = "landsat_ot_c2_l2"
BAND = "_ST_B10_TIF"

MAX_RESULTS = 100
MAX_CLOUD_COVER = 60

urban_extents_path = APP_DIR / "public" / "urban_extents.geojson"
extents: gpd.GeoDataFrame = gpd.read_file(urban_extents_path)


class Scene(BaseModel):
    entity_id: str
    file_path: str
    downloaded: bool = False
    skipped: bool = False


class DownloadInventory(BaseModel):
    scenes: dict[str, list[Scene]]


def get_download_inventory() -> DownloadInventory:
    if not DOWNLOADS_YAML_PATH.exists():
        return DownloadInventory(scenes={})

    with open(DOWNLOADS_YAML_PATH, "r") as f:
        return DownloadInventory(**yaml.safe_load(f))


def update_download_inventory(code: str, scenes: list[Scene]):
    inventory = get_download_inventory()
    with open(DOWNLOADS_YAML_PATH, "w+") as f:
        inventory.scenes[code] = scenes
        yaml.safe_dump(inventory.model_dump(), f)


def fetch_auth_token() -> dict[str, str]:
    print("Logging into EROS M2M")
    r = httpx.post(
        f"{SERVICE_URL}/login-token",
        json={
            "username": os.environ.get("EROS_USERNAME"),
            "token": os.environ.get("EROS_PASSWORD"),
        },
    )

    r.raise_for_status()
    api_key = r.json()["data"]
    return {"X-Auth-Token": api_key}


def find_scenes(query: dict, headers: dict, offset: int = 0):
    r = httpx.post(
        f"{SERVICE_URL}/scene-search",
        json={
            "datasetName": DATASET_NAME,
            "maxResults": MAX_RESULTS,
            "startingNumber": offset,
            "sceneFilter": query,
        },
        headers=headers,
    )

    r.raise_for_status()

    scenes = []
    if r.json()["data"]["totalHits"] > MAX_RESULTS and offset < r.json()["data"]["totalHits"]:
        scenes += find_scenes(query, headers, offset + MAX_RESULTS)

    return scenes + r.json()["data"]["results"]


def filter_scenes(code: str, usgs_scenes: list[dict], download_dir: Path) -> list[Scene]:
    existing_ids = [s.stem[:-7] for s in download_dir.glob("*.TIF")]

    scenes: list[Scene] = []
    for raw_scene in usgs_scenes:
        display_id = raw_scene["displayId"]
        scene = Scene(entity_id=code, file_path=str(download_dir / f"{display_id}.TIF"))
        if display_id in existing_ids:
            scene.downloaded = True
            print(f"Skipping {display_id}, already downloaded")
        elif raw_scene["cloudCover"] > MAX_CLOUD_COVER:
            scene.skipped = True
        scenes.append(scene)

    update_download_inventory(code, scenes)
    scenes_pending_download = [s for s in scenes if s.downloaded is False and s.skipped is False]
    print(
        f"\nFound {len(usgs_scenes)} scenes, "
        f"{len(scenes_pending_download)} images will be downloaded."
    )

    return scenes_pending_download


def download_scenes(scenes: list[Scene], download_dir: Path, headers: dict[str, str]):
    r = httpx.post(
        f"{SERVICE_URL}/download-options",
        json={"datasetName": DATASET_NAME, "entityIds": list(set([s.entity_id for s in scenes]))},
        headers=headers,
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

        with open(download_dir / filename, "wb") as f:
            f.write(r.content)

    print("Done")


def fetch_urau(
    code: str,
    download_dir: Path = DOWNLOADS_DIR,
    start_date: str = "2013-01-01",
    end_date: str = "2023-12-31",
):
    headers = fetch_auth_token()
    urau_extent = extents[extents["URAU_CODE"] == code]
    if urau_extent.empty:
        raise ValueError(f"Unable to find are with code '{code}'")

    print(f"Finding scenes with {code=}")
    usgs_scenes = find_scenes(
        {
            "spatialFilter": {
                "filterType": "mbr",
                "lowerLeft": {
                    "latitude": urau_extent.geometry.bounds.miny.values[0],
                    "longitude": urau_extent.geometry.bounds.minx.values[0],
                },
                "upperRight": {
                    "latitude": urau_extent.geometry.bounds.maxy.values[0],
                    "longitude": urau_extent.geometry.bounds.maxx.values[0],
                },
            },
            "acquisitionFilter": {"start": start_date, "end": end_date},
        },
        headers,
    )

    scenes_pending_download = filter_scenes(
        code=code, usgs_scenes=usgs_scenes, download_dir=download_dir
    )
    download_scenes(scenes=scenes_pending_download, download_dir=download_dir, headers=headers)


if __name__ == "__main__":
    typer.run(fetch_urau)
