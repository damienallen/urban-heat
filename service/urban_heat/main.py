from fastapi import FastAPI
from urban_heat.sources import urban_extents

app = FastAPI()


@app.get("/")
async def get_urban_extents():
    return urban_extents
