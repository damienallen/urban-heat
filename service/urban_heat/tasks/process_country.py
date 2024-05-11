import os
from datetime import date
from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
import typer
from pydantic import BaseModel, ConfigDict
from rasterio.mask import mask
from shapely.geometry import Polygon
from tqdm import tqdm
from tqdm.contrib.concurrent import process_map

from urban_heat.tasks import (
    CLIPPED_DIR,
    DOWNLOADS_DIR,
    get_extents_by_country,
)

NO_DATA = 0


class ClippingScene(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    code: str
    scene: dict
    mask_gdf: gpd.GeoDataFrame


def clip_scene(clipping_scene: ClippingScene):
    image_path = clipping_scene.scene["path"]

    with rasterio.open(image_path) as src:
        masked_data, masked_transform = mask(src, clipping_scene.mask_gdf.geometry, invert=False)

        dst_meta = src.meta.copy()
        dst_meta.update(
            dtype=rasterio.uint8,
            height=int(masked_data.shape[1]),
            width=int(masked_data.shape[2]),
            nodata=NO_DATA,
            transform=masked_transform,
            compress="lzw",
        )

        # Apply scale factor and convert to celcius
        # https://www.usgs.gov/faqs/how-do-i-use-a-scale-factor-landsat-level-2-science-products
        scale_factor = 0.00341802
        addititive_offset = 149
        temp_c = masked_data * scale_factor + addititive_offset - 273.15
        temp_c = np.where(temp_c < 0, NO_DATA, temp_c)

        clipped_images_dir = CLIPPED_DIR / clipping_scene.code
        clipped_images_dir.mkdir(exist_ok=True)

        clipped_image_path = clipped_images_dir / f"{image_path.stem}.tif"
        with rasterio.open(clipped_image_path, "w", **dst_meta) as dst:
            dst.write(temp_c)
            dst.write(temp_c)


def clip_country_scenes(country_code: str, downloads_dir: Path = DOWNLOADS_DIR):
    scenes_gdf = get_extents_by_country(code=country_code)
    mask_gdf: gpd.GeoDataFrame = scenes_gdf.explode(index_parts=False).filter(items=["geometry"])
    mask_gdf_utm = {}

    # Fetch and sort list of raw Level-2 LST images
    images = []
    for image_path in tqdm([f for f in DOWNLOADS_DIR.glob("*.TIF")], desc="Matching extents"):
        with rasterio.open(image_path) as src:
            if src.crs not in mask_gdf_utm:
                mask_gdf_utm[src.crs] = mask_gdf.to_crs(src.crs)

            image_bounds_gdf = gpd.GeoDataFrame(
                geometry=[
                    Polygon(
                        (
                            (src.bounds.left, src.bounds.top),
                            (src.bounds.right, src.bounds.top),
                            (src.bounds.right, src.bounds.bottom),
                            (src.bounds.left, src.bounds.bottom),
                            (src.bounds.left, src.bounds.top),
                        )
                    )
                ],
                crs=src.crs,
            )

        intersection = mask_gdf_utm[src.crs].overlay(image_bounds_gdf, how="intersection")
        if intersection.empty:
            continue

        images.append(
            {
                "capture_date": date(
                    year=int(image_path.stem[26:30]),
                    month=int(image_path.stem[30:32]),
                    day=int(image_path.stem[32:34]),
                ),
                "path": image_path,
                "crs": src.crs,
            }
        )

    # Multi-core clipping
    images = sorted(images, key=lambda img: img["capture_date"])  # type: ignore
    process_map(
        clip_scene,
        [
            ClippingScene(code=country_code, scene=scene, mask_gdf=mask_gdf_utm[scene["crs"]])
            for scene in images
        ],
        max_workers=os.cpu_count(),
        desc="Clipping",
    )

    print("Done.")


if __name__ == "__main__":
    typer.run(clip_country_scenes)
