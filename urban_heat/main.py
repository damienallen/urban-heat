from collections import OrderedDict
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from urban_heat import API_TOKEN, APP_URL
from urban_heat.models import AnnualData, DataSource, UrbanExtent, init_db

origins = [
    APP_URL,
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
        "repo": "https://github.com/damienallen/urban-heat/tree/main",
        "endpoints": "https://api.urbanheat.app/docs",
    }


@app.get("/urau/source_counts", response_model=dict[str, dict[str, int]])
async def get_source_counts():
    await init_db()

    countries = {}
    for extent in await UrbanExtent.find_all().to_list():
        if extent.properties.CNTR_CODE not in countries:
            countries[extent.properties.CNTR_CODE] = {
                "complete": 0,
                "partial": 0,
                "missing": 0,
            }

        if extent.sources and (source_count := sum([len(s.data) for s in extent.sources])):
            if source_count == 11:
                countries[extent.properties.CNTR_CODE]["complete"] += 1
            else:
                countries[extent.properties.CNTR_CODE]["partial"] += 1
        else:
            countries[extent.properties.CNTR_CODE]["missing"] += 1

    return OrderedDict(sorted(countries.items()))


@app.get("/urau/{code}", response_model=UrbanExtent)
async def get_urau(code: str):
    await init_db()
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")

    return feature


@app.get("/urau/{code}/sources", response_model=list[DataSource])
async def get_urau_sources(code: str):
    await init_db()
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")

    return feature.prepared_sources


@app.patch("/urau/{code}/sources", dependencies=[Depends(check_for_token)])
async def update_urau_sources(sources: list[DataSource], code: str):
    await init_db()
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")

    feature.sources = sources
    await feature.save()
    return {"detail": "Record was updated"}


@app.post("/urau/{code}/source/add/{key}", dependencies=[Depends(check_for_token)])
async def add_urau_annual_data(annual_data: AnnualData, code: str, key: str):
    await init_db()
    feature = await UrbanExtent.find_one(UrbanExtent.properties.URAU_CODE == code)

    if not feature:
        raise HTTPException(status_code=404, detail="Record not found")

    if len(feature.sources) < 1:
        feature.sources = [DataSource(key=key, data=[annual_data])]
    else:
        source_ind = next(
            (ind for ind, source in enumerate(feature.sources) if getattr(source, "key") == key)
        )

        source_records = feature.sources[source_ind].data
        if not source_records or annual_data.year not in [r.year for r in source_records]:
            source_records.append(annual_data)
        else:
            year_ind = next(
                (
                    ind
                    for ind, record in enumerate(source_records)
                    if getattr(record, "year") == annual_data.year
                )
            )
            source_records[year_ind].stats = annual_data.stats
            source_records[year_ind].url = annual_data.url

    await feature.save()
    return {"detail": "Record was updated"}


@app.get("/codes", response_model=list[str])
async def get_urau_codes():
    await init_db()

    features = await UrbanExtent.find_all().to_list()
    return sorted([f.properties.URAU_CODE for f in features])
