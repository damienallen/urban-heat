import os
from pathlib import Path

DATA_DIR = Path(__file__).parents[3] / "data"
APP_DIR = Path(__file__).parents[3] / "app"

DOWNLOADS_DIR = Path(os.environ.get("UH_DOWNLOADS_DIR", "/home/damien/cave/heat_maps/raw/"))

SERVICE_URL = "https://m2m.cr.usgs.gov/api/api/json/stable"
DATASET_NAME = "landsat_ot_c2_l2"
BAND = "_ST_B10_TIF"
