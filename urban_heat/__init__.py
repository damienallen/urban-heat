import os

API_TOKEN = os.environ.get("UH_API_TOKEN", None)
APP_HOST = os.environ.get("UH_APP_HOST", "urbanheat.app")
API_HOST = os.environ.get("UH_API_HOST", "api.urbanheat.app")


def get_auth_headers():
    if not API_TOKEN:
        raise ValueError("Variable 'API_TOKEN' is missing from environment")
    return {"X-Token": API_TOKEN}
