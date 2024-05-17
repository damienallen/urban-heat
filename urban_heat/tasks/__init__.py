import os
from pathlib import Path

import geopandas as gpd
import httpx

DATA_DIR = Path(__file__).parents[2] / "data"
APP_DIR = Path(__file__).parents[2] / "app"

DOWNLOADS_DIR = Path(os.environ.get("UH_DOWNLOADS_DIR", DATA_DIR / "raw"))
DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

CLIPPED_DIR = Path(os.environ.get("UH_CLIPPED_DIR", DATA_DIR / "clipped"))
CLIPPED_DIR.mkdir(parents=True, exist_ok=True)

SOURCES_DIR = Path(os.environ.get("UH_SOURCES_DIR", "/home/damien/cave/heat_maps/sources/"))
SOURCES_DIR.mkdir(parents=True, exist_ok=True)

urban_extents_path = APP_DIR / "public" / "urban_extents.geojson"
extents_gdf: gpd.GeoDataFrame = gpd.read_file(urban_extents_path)

SERVICE_URL = "https://m2m.cr.usgs.gov/api/api/json/stable"
DATASET_NAME = "landsat_ot_c2_l2"
BAND = "_ST_B10_TIF"
DST_CRS = "EPSG:4326"
NO_DATA = 0


def get_auth_header() -> dict[str, str]:
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


async def get_auth_header_async(client: httpx.AsyncClient) -> dict[str, str]:
    print("Logging into EROS M2M")
    r = await client.post(
        f"{SERVICE_URL}/login-token",
        json={
            "username": os.environ.get("EROS_USERNAME"),
            "token": os.environ.get("EROS_PASSWORD"),
        },
    )

    r.raise_for_status()
    api_key = r.json()["data"]
    return {"X-Auth-Token": api_key}


def get_extents_by_country(code: str) -> gpd.GeoDataFrame:
    country_extents = extents_gdf[extents_gdf["URAU_CODE"].str.contains(code)]
    if country_extents.empty:
        raise ValueError(f"Unable to find are with code '{code}'")
    return country_extents.reset_index()
