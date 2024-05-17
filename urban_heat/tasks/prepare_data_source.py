from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
import typer
from rasterio.features import geometry_mask
from rasterio.mask import mask
from rasterio.transform import from_origin
from shapely import Polygon
from tqdm import tqdm

from urban_heat.tasks import CLIPPED_DIR, DST_CRS, SOURCES_DIR, get_extents_by_country


def create_mask(
    geometry: Polygon, resolution: tuple[float, float], output_path: Path
) -> np.ndarray:
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

    return mask


def process_images_by_urau(
    urau: gpd.GeoSeries,
    clipped_dir: Path = CLIPPED_DIR,
    sources_dir: Path = SOURCES_DIR,
    data_source_key: str = "max_surface_temperature",
):
    urau_code = urau["URAU_CODE"]
    urau_dir: Path = sources_dir / urau_code
    urau_dir.mkdir(exist_ok=True)

    clipped_images = [f for f in (clipped_dir / urau_code[:2]).glob("*.tif")]
    with rasterio.open(clipped_images[0]) as src:
        urau_gdf = gpd.GeoDataFrame(geometry=[urau.geometry], crs=DST_CRS)
        resolution = (
            float(((urau_gdf.bounds.maxx - urau_gdf.bounds.minx) / src.width).iloc[0]),
            float(((urau_gdf.bounds.maxy - urau_gdf.bounds.miny) / src.height).iloc[0]),
        )

    # Generate raster template from exents
    mask_path = urau_dir / "mask.tif"
    create_mask(urau.geometry, resolution, mask_path)
    with rasterio.open(mask_path) as src:
        src_crs = src.crs
        utm_bounds = src.bounds
        src_width = src.width
        src_height = src.height

        raster_metadata = src.meta.copy()
        raster_metadata.update(compress="lzw")

    # Calculate max surface temp
    max_surface_temp = {}
    urau_utm = {}
    for image_path in tqdm(clipped_images, desc="Calculating max surface temp"):
        year = image_path.stem[17:21]

        with rasterio.open(image_path) as src:
            if (utm_crs := str(src.crs)) not in urau_utm:
                urau_utm[utm_crs] = urau_gdf.to_crs(utm_crs).geometry.iloc[0]

            try:
                masked_surface_temp, _ = mask(src, [urau_utm[utm_crs]], crop=True)
            except ValueError:
                continue

        if year not in max_surface_temp:
            max_surface_temp[year] = masked_surface_temp
        else:
            max_surface_temp[year] = np.where(
                masked_surface_temp > max_surface_temp[year],
                masked_surface_temp,
                max_surface_temp[year],
            )

    # Export reprojected data
    data_source_dir: Path = SOURCES_DIR / urau_code / data_source_key
    data_source_dir.mkdir(exist_ok=True)

    for year, max_temp in tqdm(max_surface_temp.items(), desc="Writing surface temp"):
        with rasterio.open(
            data_source_dir / f"max_surface_temp_{year}.tif", "w", **raster_metadata
        ) as dst:
            dst.write(max_temp)


def prepare_data_source(
    country_code: str, clipped_dir: Path = CLIPPED_DIR, sources_dir: Path = SOURCES_DIR
):
    extents_gdf = get_extents_by_country(code=country_code)

    for _, urau in extents_gdf.iterrows():
        process_images_by_urau(urau, clipped_dir=clipped_dir, sources_dir=sources_dir)
        print(urau)

    print("Done.")


if __name__ == "__main__":
    typer.run(prepare_data_source)
