import os
from datetime import date
from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
import typer
from pydantic import BaseModel, ConfigDict
from rasterio.enums import Resampling
from rasterio.mask import mask
from rasterio.warp import calculate_default_transform, reproject
from shapely.geometry import Polygon
from tinydb import Query, TinyDB
from tqdm import tqdm
from tqdm.contrib.concurrent import process_map

from urban_heat.tasks import (
    CLIPPED_DIR,
    DATA_DIR,
    DOWNLOADS_DIR,
    get_extents_by_country,
)

NO_DATA = 0
DST_CRS = "EPSG:4326"

SCENCES_JSON = DATA_DIR / "scenes_by_country.json"
db = TinyDB(SCENCES_JSON)
Countries = Query()


class SceneMetadata(BaseModel):
    capture_date: str
    path: str
    crs: str


class CountryScenes(BaseModel):
    code: str
    scenes: list[SceneMetadata]


class ClippingScene(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    code: str
    metadata: SceneMetadata
    mask_gdf: gpd.GeoDataFrame


def clip_scene(clipping_scene: ClippingScene):
    image_path = Path(clipping_scene.metadata.path)

    with rasterio.open(image_path) as src:
        masked_data, masked_transform = mask(src, clipping_scene.mask_gdf.geometry, invert=False)

        # Apply scale factor and convert to celcius
        # https://www.usgs.gov/faqs/how-do-i-use-a-scale-factor-landsat-level-2-science-products
        scale_factor = 0.00341802
        addititive_offset = 149
        temp_c = masked_data * scale_factor + addititive_offset - 273.15
        temp_c = np.where(temp_c < 0, NO_DATA, temp_c)

        clipped_images_dir = CLIPPED_DIR / clipping_scene.code
        clipped_images_dir.mkdir(exist_ok=True)

        clipped_image_path = clipped_images_dir / f"{image_path.stem}.tif"

        # Transform to WGS84
        transform, width, height = calculate_default_transform(
            src.crs, DST_CRS, src.width, src.height, *src.bounds
        )

        dst_meta = src.meta.copy()
        dst_meta.update(
            dtype=rasterio.uint8,
            height=int(masked_data.shape[1]),
            width=int(masked_data.shape[2]),
            nodata=NO_DATA,
            crs=DST_CRS,
            transform=transform,
            compress="lzw",
        )

        with rasterio.open(clipped_image_path, "w", **dst_meta) as dst:
            reproject(
                source=temp_c,
                destination=rasterio.band(dst, 1),
                src_transform=masked_transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=DST_CRS,
                resampling=Resampling.nearest,
            )


def clip_country_scenes(country_code: str, downloads_dir: Path = DOWNLOADS_DIR):
    scenes_gdf = get_extents_by_country(code=country_code)
    mask_gdf: gpd.GeoDataFrame = scenes_gdf.explode(index_parts=False).filter(items=["geometry"])
    mask_gdf_utm = {}

    # Fetch and sort list of raw Level-2 LST images
    query = db.search((Countries.code == country_code))
    if len(query):
        print("Using cached scenes.")
        country_scenes = CountryScenes(**query[0])

        for image_path in tqdm(
            [Path(s.path) for s in country_scenes.scenes], desc="Making CRS masks"
        ):
            with rasterio.open(image_path) as src:
                if (src_crs := str(src.crs)) not in mask_gdf_utm:
                    mask_gdf_utm[src_crs] = mask_gdf.to_crs(src_crs)

    else:
        image_metadata = []
        for image_path in tqdm([f for f in downloads_dir.glob("*.TIF")], desc="Matching extents"):
            with rasterio.open(image_path) as src:
                if (src_crs := str(src.crs)) not in mask_gdf_utm:
                    mask_gdf_utm[src_crs] = mask_gdf.to_crs(src_crs)

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

            intersection = mask_gdf_utm[str(src.crs)].overlay(image_bounds_gdf, how="intersection")
            if intersection.empty:
                continue

            image_metadata.append(
                SceneMetadata(
                    code=country_code,
                    capture_date=date(
                        year=int(image_path.stem[26:30]),
                        month=int(image_path.stem[30:32]),
                        day=int(image_path.stem[32:34]),
                    ).strftime("%Y-%m-%d"),
                    path=str(image_path),
                    crs=str(src.crs),
                )
            )

        image_metadata = sorted(image_metadata, key=lambda img: img.capture_date)  # type: ignore
        country_scenes = CountryScenes(code=country_code, scenes=image_metadata)
        db.insert(country_scenes.model_dump())

    # Multi-core clipping
    process_map(
        clip_scene,
        [
            ClippingScene(
                code=country_code, metadata=metadata, mask_gdf=mask_gdf_utm[metadata.crs]
            )
            for metadata in country_scenes.scenes
        ],
        max_workers=os.cpu_count(),
        chunksize=1,
        desc="Clipping",
    )

    print("Done.")


if __name__ == "__main__":
    typer.run(clip_country_scenes)
