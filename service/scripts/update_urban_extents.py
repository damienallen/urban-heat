from urban_heat.models import UrbanExtent, client
from beanie import init_beanie

import asyncio
import json
from pathlib import Path
from tqdm import tqdm


async def update_urban_extents():
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])

    print("Loading urban extents from file")
    urban_extents_path = Path(__file__).parents[1] / "app" / "public" / "urban_extents.geojson"
    with open(urban_extents_path) as f:
        urban_extents = json.load(f)

    print("Removing existing documents")
    await UrbanExtent.find_all().delete_many()

    for feature in tqdm(urban_extents["features"], desc="Adding features to DB"):
        f = UrbanExtent(geometry=feature["geometry"], properties=feature["properties"])
        await f.insert()


if __name__ == "__main__":
    asyncio.run(update_urban_extents())
