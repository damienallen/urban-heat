import json
from pathlib import Path

urban_extents_path = Path(__file__).parents[1] / "urban_extents.geojson"
with open(urban_extents_path) as f:
    urban_extents = json.load(f)
