import os
from pathlib import Path
import geopandas as gpd
import httpx
from tqdm import tqdm

from pipelines import app_dir

SERVICE_URL = "https://m2m.cr.usgs.gov/api/api/json/stable"
MAX_RESULTS = 100

MAX_CLOUD_COVER = 80

urban_extents_path = app_dir / "public" / "urban_extents.geojson"
extents: gpd.GeoDataFrame = gpd.read_file(urban_extents_path)


def find_scenes(query: dict, headers: dict, offset: int = 0):
    """
    TODO: cloud cover
    """
    url = f"{SERVICE_URL }/scene-search"
    print(f"[POST] {url} | {offset=}")

    r = httpx.post(
        url,
        json={
            "datasetName": "landsat_ot_c2_l2",
            "maxResults": MAX_RESULTS,
            "startingNumber": offset,
            "sceneFilter": query,
        },
        headers=headers,
    )

    scenes = []
    if r.json()["data"]["totalHits"] > MAX_RESULTS and offset < r.json()["data"]["totalHits"]:
        scenes += find_scenes(query, headers, offset + MAX_RESULTS)

    return scenes + r.json()["data"]["results"]


def download_urau(
    code: str, data_dir: Path, start_date: str = "2013-01-01", end_date: str = "2023-12-31"
):
    # print("[AUTH] Logging into EROS M2M")
    # r = httpx.post(
    #     f"{SERVICE_URL}/login-token",
    #     json={
    #         "username": os.environ.get("EROS_USERNAME"),
    #         "token": os.environ.get("EROS_PASSWORD"),
    #     },
    # )

    # r.raise_for_status()
    # api_key = r.json()["data"]
    # headers = {"X-Auth-Token": api_key}

    # urau_extent = extents[extents["URAU_CODE"] == code]
    # if urau_extent.empty:
    #     raise ValueError(f"Unable to find are with code '{code}'")

    # scene_filter = {
    #     "spatialFilter": {
    #         "filterType": "mbr",
    #         "lowerLeft": {
    #             "latitude": urau_extent.geometry.bounds.miny.values[0],
    #             "longitude": urau_extent.geometry.bounds.minx.values[0],
    #         },
    #         "upperRight": {
    #             "latitude": urau_extent.geometry.bounds.maxy.values[0],
    #             "longitude": urau_extent.geometry.bounds.maxx.values[0],
    #         },
    #     },
    #     "acquisitionFilter": {"start": start_date, "end": end_date},
    # }

    # print(f"Finding scenes with {code=}")
    # urau_scenes = find_scenes(scene_filter, headers)

    existing_ids = [s for s in data_dir.glob("*.TIF")]
    # display_ids = [s["displayId"] for s in urau_scenes if s["cloudCover"] < MAX_CLOUD_COVER]
    # print(f"Found {len(urau_scenes)} scenes")

    print("Done")


if __name__ == "__main__":
    download_urau(code="NL037C", data_dir=Path("/home/damien/code/urban-heat/data/raw"))
