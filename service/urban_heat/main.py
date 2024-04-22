from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from urban_heat.models import UrbanExtent, client, get_extent_features

origins = [
    "https://urbanheat.app",
    "https://dev.urbanheat.app",
    "http://localhost:5173",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def hello():
    return {
        "welcome": "Welcome to the urban-heat API, see repository for more information.",
        "url": "https://github.com/damienallen/urban-heat/tree/main/service",
    }


@app.get("/extents")
async def get_urban_extents():
    return {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}},
        "features": await get_extent_features(),
    }


@app.get("/urau/{code}")
async def get_urau(code: str):
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])

    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)
    return feature
