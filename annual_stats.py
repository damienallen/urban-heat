from pathlib import Path

import numpy as np
import rasterio
from rasterio.warp import Resampling, calculate_default_transform, reproject
from tqdm import tqdm

data_dir = Path("data")
clipped_data_dir = data_dir / "clipped"
annual_data_dir = data_dir / "annual"

clipped_images = [f for f in clipped_data_dir.glob("*.tif")]

dst_crs = "EPSG:4326"

# Find largest extent
max_size = 0

largest_src = {}
largest_metadata = None

for image_path in tqdm(clipped_images, desc="Finding largest extent"):
    with rasterio.open(image_path) as src:
        surface_temp = src.read()
        if (image_size := (src.height * src.width)) > max_size:
            max_size = image_size

            largest_src["crs"] = src.crs
            largest_src["bounds"] = src.bounds
            largest_src["transform"] = src.transform
            largest_src["width"] = src.width
            largest_src["height"] = src.height

            largest_metadata = src.meta.copy()
            largest_metadata.update(
                dtype=rasterio.uint8,
                height=int(surface_temp.shape[1]),
                width=int(surface_temp.shape[2]),
                compress="lzw",
            )


# Calculate max surface temp
max_surface_temp = {}
for image_path in tqdm(clipped_images, desc="Calculating max surface temp"):
    year = image_path.stem[17:21]

    with rasterio.open(image_path) as src:
        window = rasterio.windows.from_bounds(*largest_src["bounds"], transform=src.transform)
        surface_temp = src.read(window=window, boundless=True)

    if year not in max_surface_temp:
        max_surface_temp[year] = surface_temp
    else:
        max_surface_temp[year] = np.where(
            surface_temp > max_surface_temp[year], surface_temp, max_surface_temp[year]
        )


# Prepare for projection
dst_transform, width, height = calculate_default_transform(
    largest_src["crs"],
    dst_crs,
    largest_src["width"],
    largest_src["height"],
    *largest_src["bounds"],
)

dst_metadata = largest_metadata
dst_metadata.update({"crs": dst_crs, "transform": dst_transform, "width": width, "height": height})

# Export reprojected data
annual_data_dir.mkdir(exist_ok=True)
for year, max_temp in tqdm(max_surface_temp.items(), desc="Writing surface temp"):
    with rasterio.open(
        annual_data_dir / f"max_surface_temp_{year}.tif", "w", **dst_metadata
    ) as dst:
        projected_max_temp = np.zeros_like(max_temp)

        reproject(
            source=max_temp,
            destination=projected_max_temp,
            src_transform=largest_src["transform"],
            src_crs=largest_src["crs"],
            dst_transform=dst_transform,
            dst_crs=dst_crs,
            resampling=Resampling.nearest,
        )

        dst.write(projected_max_temp)
