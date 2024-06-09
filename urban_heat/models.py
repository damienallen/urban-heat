from typing import Literal

from beanie import Document, init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import AnyUrl, BaseModel


class Geometry(BaseModel):
    type: Literal["Polygon", "MultiPolygon"]
    coordinates: list


class Properties(BaseModel):
    FID: str
    AREA_SQM: float
    FUA_CODE: str
    URAU_CODE: str
    URAU_CATG: str
    URAU_NAME: str
    CNTR_CODE: str
    NUTS3_2021: str
    CITY_CPTL: str | None


class Stats(BaseModel):
    histogram: dict[int, int]
    mean: float
    st_dev: float
    median: int
    min: int
    max: int


class AnnualData(BaseModel):
    year: int
    url: AnyUrl
    stats: Stats


class DataSource(BaseModel):
    key: str
    data: list[AnnualData]

    @property
    def available_data(self):
        return sorted(
            [d for d in self.data if len(d.stats.histogram.keys()) > 5],
            key=lambda d: d.year,
        )


class UrbanExtent(Document):
    geometry: Geometry
    properties: Properties
    sources: list[DataSource]

    @property
    def prepared_sources(self):
        return [{"key": s.key, "data": s.available_data} for s in self.sources]

    @property
    def __geo_interface__(self):
        return {
            "type": "Feature",
            "properties": self.properties,
            "geometry": self.geometry,
            "id": self.properties.URAU_CODE,
        }


async def init_db():
    client = AsyncIOMotorClient("mongodb://mongo:27017")
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])


async def get_urau_by_code(code: str):
    await init_db()

    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)
    return feature
