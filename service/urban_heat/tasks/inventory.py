import os

import httpx
from pydantic import BaseModel
from tinydb import Query, TinyDB

from urban_heat.tasks import DATA_DIR, SERVICE_URL

db = TinyDB(DATA_DIR / "downloads.json")

Scenes = Query()


class Scene(BaseModel):
    entity_id: str
    display_id: str
    file_path: str
    saved: bool = False
    skip: bool = False
    failed: bool = False
    pending: bool = False


class DownloadInventory(BaseModel):
    scenes: list[Scene]


def get_inventory() -> DownloadInventory:
    return DownloadInventory(scenes=[s for s in db.all()])


def get_pending() -> DownloadInventory:
    return DownloadInventory(
        scenes=[
            s
            for s in db.search((Scenes.saved == False) & (Scenes.skip == False))  # noqa: E712
        ]
    )


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
