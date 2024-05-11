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
    failed: bool = False
    pending: bool = False
    skipped: bool = False


def get_inventory() -> list[Scene]:
    return [s for s in db.all()]


def get_saved() -> list[Scene]:
    return [s for s in db.search((Scenes.saved == True))]


def get_failed() -> list[Scene]:
    return [s for s in db.search((Scenes.failed == True))]


def get_pending() -> list[Scene]:
    return [s for s in db.search((Scenes.pending == True))]


def get_skipped() -> list[Scene]:
    return [s for s in db.search((Scenes.skipped == True))]


def report_inventory():
    total_scenes = len(get_inventory())
    saved_scenes = len(get_saved())
    failed_scenes = len(get_failed())
    pending_scenes = len(get_pending())
    skipped_scenes = len(get_skipped())

    print(
        "DOWNLOAD INVENTORY",
        f" | Total: {total_scenes}",
        f" | Saved: {saved_scenes}",
        f" | Failed: {failed_scenes}",
        f" | Pending: {pending_scenes}",
        f" | Skipped: {skipped_scenes}",
    )
