from aiotinydb import AIOTinyDB
from pydantic import BaseModel
from tinydb import Query, TinyDB

from urban_heat.tasks import DATA_DIR

SCENCES_JSON = DATA_DIR / "scenes.json"
aio_db = AIOTinyDB(SCENCES_JSON)
db = TinyDB(SCENCES_JSON)

Scenes = Query()


class Scene(BaseModel):
    entity_id: str
    display_id: str
    file_path: str
    saved: bool = False
    uploaded: bool = False
    failed: bool = False
    skipped: bool = False


def get_inventory() -> list[Scene]:
    return db.all()


def get_saved() -> list[Scene]:
    return db.search((Scenes.saved == True))


def get_uploaded() -> list[Scene]:
    return db.search((Scenes.uploaded == True))


def get_pending() -> list[Scene]:
    return db.search((Scenes.saved == False) & (Scenes.skipped == False))


def get_failed() -> list[Scene]:
    return db.search((Scenes.failed == True))


def get_skipped() -> list[Scene]:
    return db.search((Scenes.skipped == True))


def report_inventory():
    total_scenes = len(get_inventory())
    saved_scenes = len(get_saved())
    uploaded_scenes = len(get_uploaded())
    pending_scenes = len(get_pending())
    failed_scenes = len(get_failed())
    skipped_scenes = len(get_skipped())

    print(
        "INVENTORY",
        f" > Total: {total_scenes}",
        f" | Saved: {saved_scenes}",
        f" | Pending: {pending_scenes}",
        f" | Failed: {failed_scenes}",
        f" | Skipped: {skipped_scenes}",
    )


async def report_inventory_async():
    async with aio_db:
        total_scenes = len(aio_db.all())
        saved_scenes = len(aio_db.search((Scenes.saved == True)))
        uploaded_scenes = len(aio_db.search((Scenes.uploaded == True)))
        pending_scenes = len(aio_db.search((Scenes.saved == False) & (Scenes.skipped == False)))
        failed_scenes = len(aio_db.search((Scenes.failed == True)))
        skipped_scenes = len(aio_db.search((Scenes.skipped == True)))

        print(
            "INVENTORY",
            f" > Total: {total_scenes}",
            f" | Saved: {saved_scenes}",
            f" | Pending: {pending_scenes}",
            f" | Failed: {failed_scenes}",
            f" | Skipped: {skipped_scenes}",
        )
