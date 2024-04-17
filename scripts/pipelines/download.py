import os

import geopandas as gpd
import httpx
from tqdm import tqdm

from pipelines import app_dir

service_url = "https://m2m.cr.usgs.gov/api/api/json/stable"

r = httpx.post(
    f"{service_url}/login-token",
    json={
        "username": os.environ.get("EROS_USERNAME"),
        "token": os.environ.get("EROS_PASSWORD"),
    },
)

r.raise_for_status()
api_key = r.json()["data"]
headers = {"X-Auth-Token": api_key}

urban_extents_path = app_dir / "public" / "urban_extents.geojson"
extents: gpd.GeoDataFrame = gpd.read_file(urban_extents_path)

total_scenes = 0
scenes = []
for _, urau in tqdm(extents.iterrows(), desc="Searching scenes", total=extents.shape[0]):
    spatialFilter = {
        "filterType": "mbr",
        "lowerLeft": {"latitude": urau.geometry.bounds[3], "longitude": urau.geometry.bounds[0]},
        "upperRight": {"latitude": urau.geometry.bounds[1], "longitude": urau.geometry.bounds[2]},
    }

    # TODO: cloud cover
    payload = {
        "datasetName": "landsat_ot_c2_l2",
        "maxResults": 1,
        "startingNumber": 0,
        "sceneFilter": {
            "spatialFilter": spatialFilter,
            "acquisitionFilter": {"start": "2013-01-01", "end": "2023-12-31"},
        },
    }

    r = httpx.post(f"{service_url }/scene-search", json=payload, headers=headers)

    total_scenes += r.json()["data"]["totalHits"]

    # for scene in r.json()["data"]["results"]:
    #     scenes.append(scene["displayId"])


# scenes_set = set(scenes)
# duplicate_scenes = len(scenes) - len(scenes_set)
# percent_duplicate = duplicate_scenes / tot

# print(f"Found {len(scenes)} after discarding {duplicate_scenes} duplicates")
print(f"Found {total_scenes} scenes")
