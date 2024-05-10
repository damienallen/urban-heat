import os

import httpx
from pydantic import BaseModel
from tinydb import Query, TinyDB

from tasks import DATA_DIR, SERVICE_URL

db = TinyDB(DATA_DIR / "downloads.json")

Scenes = Query()


class Scene(BaseModel):
    entity_id: str
    file_path: str
    downloaded: bool = False
    skipped: bool = False
    failed: bool = False
    pending: bool = False


class DownloadInventory(BaseModel):
    scenes: list[Scene]


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
