import os
from pathlib import Path

import httpx

DATA_DIR = Path(__file__).parents[3] / "data"
APP_DIR = Path(__file__).parents[3] / "app"

DOWNLOADS_DIR = Path(os.environ.get("UH_DOWNLOADS_DIR", "/home/damien/cave/heat_maps/raw/"))

SERVICE_URL = "https://m2m.cr.usgs.gov/api/api/json/stable"
DATASET_NAME = "landsat_ot_c2_l2"
BAND = "_ST_B10_TIF"


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
