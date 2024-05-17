import numpy as np


def compute_max_surface_temp(masked_data: np.ndarray, annual_data: np.ndarray):
    return np.where(
        masked_data > annual_data,
        masked_data,
        annual_data,
    )


data_source_functions = {"max_surface_temp": compute_max_surface_temp}


def process_data_source(
    data_source_key: str,
    data_source_dict: dict[str, np.ndarray],
    masked_data: np.ndarray,
    year: str,
) -> dict[str, np.ndarray]:
    if year not in data_source_dict:
        data_source_dict[year] = masked_data
    else:
        data_source_dict[year] = data_source_functions[data_source_key](
            masked_data, data_source_dict[year]
        )
    return data_source_dict
