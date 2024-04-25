from datetime import date
from shutil import rmtree

import geopandas as gpd
import numpy as np
import rasterio
from rasterio.mask import mask
from tqdm import tqdm

from tasks import data_dir

NO_DATA = 0

# File handling
raw_data_dir = data_dir / "raw"

clipped_data_dir = data_dir / "clipped"
rmtree(clipped_data_dir)
clipped_data_dir.mkdir(exist_ok=True)

# Fetch and sort list of raw Level-2 LST images
images = []
for image_path in raw_data_dir.glob("*.TIF"):
    images.append(
        {
            "capture_date": date(
                year=int(image_path.stem[26:30]),
                month=int(image_path.stem[30:32]),
                day=int(image_path.stem[32:34]),
            ),
            "path": image_path,
        }
    )

images = sorted(images, key=lambda img: img["capture_date"])  # type: ignore

# Mask for clipping
mask_path = data_dir / "zh_extent.gpkg"
mask_gdf = gpd.read_file(mask_path)

pbar = tqdm(images)
for raw_image in pbar:
    image_path = raw_image["path"]
    pbar.set_description(raw_image["capture_date"].strftime("%y-%m-%d"))

    with rasterio.open(image_path) as src:
        image_data = src.read()
        masked_data, masked_transform = mask(src, mask_gdf.geometry, invert=False)

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

        clipped_image_path = clipped_data_dir / f"{image_path.stem}.tif"
        with rasterio.open(clipped_image_path, "w", **dst_meta) as dst:
            dst.write(temp_c)
            dst.write(temp_c)
