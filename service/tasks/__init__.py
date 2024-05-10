import os
from pathlib import Path

DATA_DIR = Path(__file__).parents[2] / "data"
APP_DIR = Path(__file__).parents[2] / "app"

DOWNLOADS_YAML_PATH = DATA_DIR / "downloads.yaml"
DOWNLOADS_DIR = Path(os.environ.get("UH_DOWNLOADS_DIR", "/home/damien/cave/heat_maps/raw/"))
