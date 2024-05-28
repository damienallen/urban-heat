import json
from pathlib import Path

import httpx
import typer
from tqdm import tqdm

from urban_heat.tasks import (
    DATASET_NAME,
    DOWNLOADS_DIR,
    SERVICE_URL,
    get_auth_header,
    get_extents_by_country,
)
from urban_heat.tasks.utils.inventory import Scene, Scenes, db, report_inventory

MAX_RESULTS = 100
MAX_CLOUD_COVER = 60


def search_scenes(query: dict, headers: dict, offset: int = 0):
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
        scenes += search_scenes(query, headers, offset + MAX_RESULTS)

    return scenes + r.json()["data"]["results"]


def prepare_scenes(usgs_scenes: list[dict], downloads_dir: Path):
    existing_count = 0
    for raw_scene in tqdm(usgs_scenes, desc="Scanning existing downloads"):
        scene = Scene(
            entity_id=raw_scene["entityId"],
            display_id=raw_scene["displayId"],
            file_path=str(downloads_dir / f"{raw_scene['displayId']}_ST_B10.TIF"),
            cloud_cover=int(raw_scene["cloudCover"]),
        )

        if Path(scene.file_path).exists():
            scene.saved = True
            scene.skipped = False
            scene.failed = False
            existing_count += 1
        elif raw_scene["cloudCover"] > MAX_CLOUD_COVER:
            scene.skipped = True
            scene.failed = False
        else:
            scene.saved = False

        db.upsert(scene.model_dump(), Scenes.entity_id == scene.entity_id)

    print(f"{existing_count} entities already existed and were skipped")


def add_country(
    country_code: str,
    downloads_dir: Path = DOWNLOADS_DIR,
    start_date: str = "2013-01-01",
    end_date: str = "2023-12-31",
):
    country_extents = get_extents_by_country(code=country_code)
    headers = get_auth_header()
    usgs_scenes = []

    for _, urau in tqdm(
        country_extents.iterrows(),
        desc=f"Querying scenes in {country_code}",
        total=country_extents.shape[0],
    ):
        usgs_scenes += search_scenes(
            {
                "spatialFilter": {
                    "filterType": "mbr",
                    "lowerLeft": {
                        "latitude": urau.geometry.bounds[1],
                        "longitude": urau.geometry.bounds[0],
                    },
                    "upperRight": {
                        "latitude": urau.geometry.bounds[3],
                        "longitude": urau.geometry.bounds[2],
                    },
                },
                "acquisitionFilter": {"start": start_date, "end": end_date},
            },
            headers,
        )

    unique_scenes = list(set([json.dumps(s) for s in usgs_scenes]))
    print(f"Found {len(unique_scenes)} unique scenes, {len(usgs_scenes)} total")

    prepare_scenes(usgs_scenes=[json.loads(s) for s in unique_scenes], downloads_dir=downloads_dir)
    report_inventory()


if __name__ == "__main__":
    typer.run(add_country)
