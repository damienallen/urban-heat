import os
from pathlib import Path

DOWNLOADS_DIR = Path(os.environ.get("UH_DOWNLOADS_DIR", "/home/damien/cave/heat_maps/raw/"))

data_dir = Path(__file__).parents[2] / "data"
app_dir = Path(__file__).parents[2] / "app"
