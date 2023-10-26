from pathlib import Path

import numpy as np
import rasterio
from tqdm import tqdm

clipped_data_dir = Path("data/clipped")
annual_data_dir = Path("data/annual")
annual_data_dir.mkdir(exist_ok=True)

clipped_images = [f for f in clipped_data_dir.glob("*.tif")]


# Find largest extent
max_size = 0
largest_bounds = None
largest_meta = None

for image_path in tqdm(clipped_images, desc="Finding largest extent"):
    with rasterio.open(image_path) as src:
        surface_temp = src.read()
        if (imgage_size := (src.height * src.width)) > max_size:
            max_size = imgage_size
            largest_bounds = src.bounds
            largest_meta = src.meta.copy()


# Calculate max surface temp
max_surface_temp = {}
for image_path in tqdm(clipped_images, desc="Calculating max surface temp"):
    year = image_path.stem[17:21]

    with rasterio.open(image_path) as src:
        window = rasterio.windows.from_bounds(*largest_bounds, transform=src.transform)
        surface_temp = src.read(window=window, boundless=True)

    if year not in max_surface_temp:
        max_surface_temp[year] = surface_temp
    else:
        max_surface_temp[year] = np.where(
            surface_temp > max_surface_temp[year], surface_temp, max_surface_temp[year]
        )


for year, max_temp in tqdm(max_surface_temp.items(), desc="Writing surface temp"):
    with rasterio.open(
        annual_data_dir / f"max_surface_temp_{year}.tif", "w", **largest_meta
    ) as dst:
        dst.write(max_temp)
