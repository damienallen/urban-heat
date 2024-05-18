import asyncio
import json
from pathlib import Path

import typer
from tqdm import tqdm

from urban_heat.models import UrbanExtent, init_db


async def update_urban_extents(remove_existing: bool):
    await init_db()

    if remove_existing:
        print("Removing existing documents")
        await UrbanExtent.find_all().delete_many()

    print("Loading urban extents from file")
    urban_extents_path = Path(__file__).parents[2] / "app" / "public" / "urban_extents.geojson"
    with open(urban_extents_path) as f:
        urban_extents = json.load(f)

    for feature in tqdm(urban_extents["features"], desc="Adding features to DB"):
        if not await UrbanExtent.find_one(
            UrbanExtent.properties.URAU_CODE == feature["properties"]["URAU_CODE"]
        ).exists():
            f = UrbanExtent(
                geometry=feature["geometry"], properties=feature["properties"], sources=[]
            )
            await f.insert()


def main(remove_existing: bool = False):
    asyncio.run(update_urban_extents(remove_existing))


if __name__ == "__main__":
    typer.run(main)
