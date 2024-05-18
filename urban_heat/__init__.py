import os

API_TOKEN = os.environ.get("UH_API_TOKEN", None)
APP_URL = os.environ.get("UH_APP_URL", "https://urbanheat.app")
API_URL = os.environ.get("UH_API_URL", "https://api.urbanheat.app")


def get_auth_headers():
    if not API_TOKEN:
        raise ValueError("Variable 'API_TOKEN' is missing from environment")
    return {"X-Token": API_TOKEN}
