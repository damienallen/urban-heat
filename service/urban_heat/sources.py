import json
from pathlib import Path

data_dir = Path(__file__).parents[2] / "data"

urban_extents_path = data_dir / "urban_audit_cities.geojson"
with open(urban_extents_path) as f:
    urban_extents = json.load(f)
