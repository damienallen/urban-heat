from typing import Annotated, Literal, Union

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import AnyUrl, BaseModel

from beanie import Document, init_beanie


class Geometry(BaseModel):
    type: Literal["Polygon", "MultiPolygon"]
    coordinates: Union[
        list[list[Annotated[list[float], 2]]], list[list[list[Annotated[list[float], 2]]]]
    ]


class Properties(BaseModel):
    URAU_CODE: str
    URAU_CATG: str
    CNTR_CODE: str
    URAU_NAME: str
    CITY_CPTL: str | None
    FUA_CODE: str
    AREA_SQM: float
    NUTS3_2021: str
    FID: str


class Stats(BaseModel):
    histogram: dict[int, float]
    mean: float
    median: float
    min: float
    max: float
    st_dev: float


class AnnualData(BaseModel):
    year: int
    url: AnyUrl
    stats: Stats


class DataSource(BaseModel):
    key: str
    label: str
    data: list[AnnualData]


class Scene(BaseModel):
    entity_id: str
    filename: str


class UrbanExtent(Document):
    geometry: Geometry
    properties: Properties
    sources: list[DataSource] | None
    raw_scenes: list[Scene] | None

    @property
    def __geo_interface__(self):
        return {
            "type": "Feature",
            "properties": self.properties,
            "geometry": self.geometry,
            "id": self.properties.URAU_CODE,
        }


client = AsyncIOMotorClient("mongodb://mongo:27017")


async def get_extent_features():
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])

    features = await UrbanExtent.find_all().to_list()
    return [feature.__geo_interface__ for feature in features]
