import os
from pathlib import Path

import httpx
import numpy as np
import numpy.ma as ma
import rasterio
import typer
from boto3.session import Session
from tqdm.contrib.concurrent import process_map

from urban_heat import API_URL, get_auth_headers
from urban_heat.models import Stats
from urban_heat.tasks import NO_DATA, SOURCES_DIR

S3_KEY = os.environ.get("UH_S3_KEY")
S3_SECRET = os.environ.get("UH_S3_SECRET")

S3_REGION = os.environ.get("UH_S3_REGION")
S3_BUCKET = os.environ.get("UH_S3_BUCKET")
S3_ENDPOINT = os.environ.get("UH_S3_ENDPOINT")
S3_CDN_ENDPOINT = os.environ.get("UH_S3_CDN_ENDPOINT")

# Initiate S3 session
session = Session()
client = session.client(
    "s3",
    region_name=S3_REGION,
    endpoint_url=f"https://{S3_ENDPOINT}",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET,
)


def get_raster_stats(image_path: Path) -> Stats:
    with rasterio.open(image_path) as src:
        img = src.read()

        masked_data = ma.masked_equal(img, NO_DATA)
        unique, counts = np.unique(img, return_counts=True)
        histogram_dict = dict(zip(unique, counts))
        del histogram_dict[NO_DATA]

        if not histogram_dict:
            raise ValueError("No data found within masked area")

        return Stats(
            histogram=histogram_dict,
            mean=round(masked_data.mean(), 1),
            median=int(ma.median(masked_data)),
            min=masked_data.min(),
            max=masked_data.max(),
            st_dev=round(masked_data.std(), 1),
        )


def upload_annual_data(image_path: Path):
    urau_code = image_path.parts[-3]
    relative_path = f"{urau_code}/{image_path.parts[-1]}"

    try:
        raster_stats = get_raster_stats(image_path)
    except ValueError:
        print(f"Unable to generate stats for {urau_code}, skipping")
        return

    client.upload_file(
        str(image_path),
        S3_BUCKET,
        relative_path,
        ExtraArgs={"ACL": "public-read"},
    )

    r = httpx.post(
        f"{API_URL}/urau/{urau_code}/source/add/{image_path.parts[-2]}",
        json={
            "year": int(image_path.stem.split("_")[-1]),
            "url": f"{S3_CDN_ENDPOINT}/{relative_path}",
            "stats": raster_stats.model_dump(),
        },
        headers=get_auth_headers(),
    )
    r.raise_for_status()


def upload_sources(sources_dir: Path = SOURCES_DIR, overwrite: bool = False):
    r = httpx.get(f"{API_URL}/codes")
    r.raise_for_status()

    urau_codes = r.json()
    for code in urau_codes:
        urau_dir = sources_dir / code
        if not urau_dir.exists():
            continue

        r = httpx.get(f"{API_URL}/urau/{code}/sources")
        r.raise_for_status()

        # TODO: check data source per year (i.e. needed to add 2024)
        urau_sources = r.json()
        if not urau_sources or overwrite:
            for source_dir in [d for d in urau_dir.glob("*") if d.is_dir()]:
                process_map(
                    upload_annual_data,
                    sorted([f for f in source_dir.glob("*.tif")]),
                    max_workers=os.cpu_count(),
                    chunksize=1,
                    desc=f"Uploading {code} ({source_dir.parts[-1]})",
                )

    print("Done.")


if __name__ == "__main__":
    typer.run(upload_sources)
