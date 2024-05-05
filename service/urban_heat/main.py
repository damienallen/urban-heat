from typing import Annotated
from beanie import init_beanie
from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import APIKeyHeader
from urban_heat.models import UrbanExtent, client, get_extent_features
from urban_heat import API_TOKEN

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

header_token = APIKeyHeader(name="X-API-Token")


async def check_for_token(x_token: Annotated[str, Header()]):
    if not x_token == API_TOKEN:
        raise HTTPException(status_code=403, detail=f"Invalid token: {x_token}")


@app.get("/")
async def hello():
    return {
        "welcome": "Welcome to the urban-heat API, see repository for more information.",
        "url": "https://github.com/damienallen/urban-heat/tree/main/service",
    }


@app.get("/extents")
async def get_urban_extents(response_model=list[UrbanExtent]):
    return {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}},
        "features": await get_extent_features(),
    }


@app.get("/urau/{code}", response_model=UrbanExtent)
async def get_urau(code: str):
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")
    return feature


@app.patch("/urau/{code}/sources", dependencies=[Depends(check_for_token)])
async def get_urau(code: str):
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"message": "Record was updated"}


@app.patch("/urau/{code}/scenes", dependencies=[Depends(check_for_token)])
async def get_urau(code: str):
    await init_beanie(database=client.db_name, document_models=[UrbanExtent])
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"message": "Record was updated"}
