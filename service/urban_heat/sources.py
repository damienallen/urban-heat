import json
from pathlib import Path

data_dir = Path(__file__).parents[2] / "data"

cities_path = data_dir / "urban_audit_cities.geojson"
with open(cities_path) as f:
    cities_dict = json.load(f)
