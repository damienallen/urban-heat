import os
from pathlib import Path

from tinydb import TinyDB

DATA_DIR = Path(__file__).parents[2] / "data"
APP_DIR = Path(__file__).parents[2] / "app"

DOWNLOADS_DIR = Path(os.environ.get("UH_DOWNLOADS_DIR", "/home/damien/cave/heat_maps/raw/"))


db = TinyDB(DATA_DIR / "downloads.json")
