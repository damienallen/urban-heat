from fastapi import FastAPI
from urban_heat.sources import cities_dict

app = FastAPI()


@app.get("/")
async def read_root():
    return cities_dict
