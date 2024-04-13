from typing import Annotated, Literal, Optional, Union

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

from beanie import Document, init_beanie


class Properties(BaseModel):
    URAU_CODE: str
    URAU_CATG: str
    CNTR_CODE: str
    URAU_NAME: str
    CITY_CPTL: Optional[str]
    FUA_CODE: str
    AREA_SQM: float
    NUTS3_2021: str
    FID: str


class Geometry(BaseModel):
    type: Literal["Polygon", "MultiPolygon"]
    coordinates: Union[
        list[list[Annotated[list[float], 2]]], list[list[list[Annotated[list[float], 2]]]]
    ]


class UrbanExtent(Document):
    geometry: Geometry
    properties: Properties

    @property
    def __geo_interface__(self):
        return {
            "type": "Feature",
            "properties": self.properties,
            "geometry": self.geometry,
            "id": self.properties.URAU_CODE,
        }


client = AsyncIOMotorClient("mongodb://mongo:27017")


async def get_urban_extents():
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])
    yield UrbanExtent.find_all()
