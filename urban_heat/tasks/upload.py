import os
from pathlib import Path

import httpx
import typer
from boto3.session import Session
from pydantic import BaseModel, ConfigDict
from tqdm import tqdm
from tqdm.contrib.concurrent import process_map

from urban_heat import API_URL, get_auth_headers
from urban_heat.tasks import SOURCES_DIR

S3_KEY = os.environ.get("UH_S3_KEY")
S3_SECRET = os.environ.get("UH_S3_SECRET")

S3_REGION = os.environ.get("UH_S3_REGION")
S3_BUCKET = os.environ.get("UH_S3_BUCKET")
S3_ENDPOINT = os.environ.get("UH_S3_ENDPOINT")
S3_CDN_ENDPOINT = os.environ.get(
    "UH_S3_CDN_ENDPOINT", "https://urban-heat-data.ams3.cdn.digitaloceanspaces.com"
)

# Initiate S3 session
session = Session()
client = session.client(
    "s3",
    region_name=S3_REGION,
    endpoint_url=f"https://{S3_ENDPOINT}",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET,
)


class UploadConfig(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    file_path: Path
    sources_dir: Path


def upload_annual_data(image_path: Path):
    relative_path = f"{image_path.parts[-3]}/{image_path.parts[-1]}"
    client.upload_file(
        str(image_path),
        S3_BUCKET,
        relative_path,
        ExtraArgs={"ACL": "public-read"},
    )

    r = httpx.post(
        f"{API_URL}/urau/{image_path.parts[-3]}/source/add/{image_path.parts[-2]}",
        json={
            "year": int(image_path.stem.split("_")[-1]),
            "url": f"{S3_CDN_ENDPOINT}/{relative_path}",
            "stats": {
                "histogram": {"1": 0, "2": 0, "3": 0},
                "mean": 0,
                "median": 0,
                "min": 0,
                "max": 0,
                "st_dev": 0,
            },
        },
        headers=get_auth_headers(),
    )
    r.raise_for_status()


def upload_sources(sources_dir: Path = SOURCES_DIR):
    r = httpx.get(f"{API_URL}/codes")
    r.raise_for_status()

    urau_codes = r.json()
    for code in tqdm(urau_codes):
        urau_dir = sources_dir / code
        if not urau_dir.exists():
            continue

        r = httpx.get(f"{API_URL}/urau/{code}/sources")
        r.raise_for_status()

        # TODO: check data source per year
        urau_sources = r.json()
        if not urau_sources:
            for source_dir in [d for d in urau_dir.glob("*") if d.is_dir()]:
                process_map(
                    upload_annual_data,
                    sorted([f for f in source_dir.glob("*.tif")]),
                    max_workers=os.cpu_count(),
                    chunksize=1,
                    desc=f"Uploading {source_dir.parts[-1]} | {code}",
                )

    print("Done.")


if __name__ == "__main__":
    typer.run(upload_sources)
