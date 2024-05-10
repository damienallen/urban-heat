from pathlib import Path

import geopandas as gpd
import httpx
import typer
from tqdm import tqdm

from urban_heat.tasks import APP_DIR, DATASET_NAME, DOWNLOADS_DIR, SERVICE_URL
from urban_heat.tasks.inventory import Scene, Scenes, db, get_auth_header

MAX_RESULTS = 100
MAX_CLOUD_COVER = 60

urban_extents_path = APP_DIR / "public" / "urban_extents.geojson"
extents: gpd.GeoDataFrame = gpd.read_file(urban_extents_path)


def search_scenes(query: dict, headers: dict, offset: int = 0):
    print(".", end="")
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
    existing_ids = [s.stem[:-7] for s in downloads_dir.glob("*.TIF")]

    for raw_scene in tqdm(usgs_scenes, desc="Scanning existing downloads"):
        entity_id = raw_scene["entityId"]
        display_id = raw_scene["displayId"]
        scene = Scene(
            entity_id=entity_id,
            display_id=display_id,
            file_path=str(downloads_dir / f"{display_id}.TIF"),
        )
        if display_id in existing_ids:
            scene.saved = True
        elif raw_scene["cloudCover"] > MAX_CLOUD_COVER:
            scene.skip = True
        else:
            scene.pending = True

        db.upsert(scene.model_dump(), Scenes.entity_id == display_id)

    scenes_pending_download = db.search(Scenes.pending == True)  # noqa: E712
    print(
        f"\nFound {len(usgs_scenes)} scenes, "
        f"{len(scenes_pending_download)} images will be downloaded."
    )


def add_country(
    country_code: str,
    downloads_dir: Path = DOWNLOADS_DIR,
    start_date: str = "2013-01-01",
    end_date: str = "2023-12-31",
):
    headers = get_auth_header()
    country_extents = extents[extents["URAU_CODE"].str.contains(country_code)]

    if country_extents.empty:
        raise ValueError(f"Unable to find are with code '{country_code}'")

    print(f"Finding scenes with {country_code=}")
    usgs_scenes = search_scenes(
        {
            "spatialFilter": {
                "filterType": "mbr",
                "lowerLeft": {
                    "latitude": country_extents.total_bounds[1],
                    "longitude": country_extents.total_bounds[0],
                },
                "upperRight": {
                    "latitude": country_extents.total_bounds[3],
                    "longitude": country_extents.total_bounds[2],
                },
            },
            "acquisitionFilter": {"start": start_date, "end": end_date},
        },
        headers,
    )

    print(f"\nFound scenes for {country_extents.shape[0]} urban extents")
    prepare_scenes(usgs_scenes=usgs_scenes, downloads_dir=downloads_dir)


if __name__ == "__main__":
    typer.run(add_country)
