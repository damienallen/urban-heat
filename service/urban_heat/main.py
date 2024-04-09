from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from urban_heat.sources import urban_extents

app = FastAPI()

origins = [
    "https://urbanheat.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def get_urban_extents():
    return urban_extents
