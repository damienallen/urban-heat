import os
from pathlib import Path

import numpy as np
import pandas as pd
import rasterio
import typer
from affine import Affine
from pydantic import BaseModel, ConfigDict
from rasterio.features import geometry_mask
from rasterio.mask import mask
from rasterio.transform import from_origin
from rasterio.warp import Resampling, reproject
from shapely import Polygon
from shapely.geometry import box
from tqdm.contrib.concurrent import process_map

from urban_heat.tasks import CLIPPED_DIR, DST_CRS, SOURCES_DIR, get_extents_by_country
from urban_heat.tasks.data_sources import process_data_source


class ProcessingConfig(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    urau: pd.Series
    clipped_dir: Path = CLIPPED_DIR
    sources_dir: Path = SOURCES_DIR
    data_source_key: str = "max_surface_temp"


def create_mask(
    geometry: Polygon, resolution: tuple[float, float], output_path: Path
) -> tuple[tuple[int], Affine, dict]:
    # Extract bounds
    xmin, ymin, xmax, ymax = geometry.bounds

    # Calculate number of rows and columns
    width = int((xmax - xmin) / resolution[0])
    height = int((ymax - ymin) / resolution[1])

    # Write mask to raster
    transform = from_origin(xmin, ymax, *resolution)
    mask = geometry_mask([geometry], (height, width), transform=transform, invert=True)

    with rasterio.open(
        output_path,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=1,
        dtype=np.uint8,
        nodata=0,
        transform=transform,
        crs=DST_CRS,
    ) as dst:
        dst.write(mask.astype("uint8"), indexes=1)
        meta = dst.meta.copy()
        meta.update(
            dtype=rasterio.uint8,
            compress="lzw",
        )

    return mask.shape, transform, meta


def process_images_by_urau(config: ProcessingConfig):
    urau_code = config.urau["URAU_CODE"]
    urau_dir: Path = config.sources_dir / urau_code
    urau_dir.mkdir(exist_ok=True)

    # Sample image resolution
    clipped_images = [f for f in (config.clipped_dir / urau_code[:2]).glob("*.tif")]
    with rasterio.open(clipped_images[0]) as src:
        resolution = (
            ((src.bounds.right - src.bounds.left) / src.width),
            ((src.bounds.top - src.bounds.bottom) / src.height),
        )

    # Generate raster template from exents
    ref_shape, ref_transform, metadata = create_mask(
        geometry=config.urau.geometry, resolution=resolution, output_path=urau_dir / "mask.tif"
    )

    # Calculate annual data source values
    data_source_by_year: dict[str, np.ndarray] = {}
    for image_path in clipped_images:
        with rasterio.open(image_path) as src:
            # Continue if geometry is outside URAU
            if not box(*src.bounds).intersects(config.urau.geometry):
                continue

            masked_image, masked_transform = mask(src, [config.urau.geometry])
            masked_surface_temp = np.empty(ref_shape, dtype=masked_image.dtype)

            reproject(
                source=masked_image,
                destination=masked_surface_temp,
                src_transform=masked_transform,
                src_crs=src.crs,
                dst_transform=ref_transform,
                dst_crs=src.crs,
                resampling=Resampling.nearest,
            )

        data_source_by_year = process_data_source(
            data_source_key=config.data_source_key,
            data_source_dict=data_source_by_year,
            masked_data=masked_surface_temp,
            year=image_path.stem[17:21],
        )

    # Export reprojected data
    data_source_dir: Path = SOURCES_DIR / urau_code / config.data_source_key
    data_source_dir.mkdir(exist_ok=True)
    for year, max_temp in data_source_by_year.items():
        with rasterio.open(
            data_source_dir / f"{config.data_source_key}_{year}.tif", "w", **metadata
        ) as dst:
            dst.write(max_temp, 1)


def process_country_sources(
    country_code: str, clipped_dir: Path = CLIPPED_DIR, sources_dir: Path = SOURCES_DIR
):
    extents = get_extents_by_country(code=country_code)

    process_map(
        process_images_by_urau,
        [
            ProcessingConfig(urau=urau, clipped_dir=clipped_dir, sources_dir=sources_dir)
            for _, urau in extents.iterrows()
        ],
        max_workers=os.cpu_count(),
        chunksize=1,
        desc=f"[{country_code}] Processing URAU",
    )

    print("Done.")


if __name__ == "__main__":
    typer.run(process_country_sources)
