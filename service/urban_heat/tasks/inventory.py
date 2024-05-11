from pydantic import BaseModel
from tinydb import Query, TinyDB

from urban_heat.tasks import DATA_DIR

db = TinyDB(DATA_DIR / "scenes.json")

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
