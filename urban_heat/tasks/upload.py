import os
from pathlib import Path

from boto3.session import Session

S3_KEY = os.environ.get("UH_S3_KEY")
S3_SECRET = os.environ.get("UH_S3_SECRET")

S3_ENDPOINT = os.environ.get("UH_S3_ENDPOINT")
S3_REGION = os.environ.get("UH_S3_REGION")
S3_BUCKET = os.environ.get("UH_S3_BUCKET")

# Initiate S3 session
session = Session()
client = session.client(
    "s3",
    region_name=S3_REGION,
    endpoint_url=f"https://{S3_ENDPOINT}",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET,
)

scenes: list[Path] = []
for scene_path in scenes:
    client.upload_file(
        str(scene_path),
        S3_BUCKET,
        "test.TIF",
        ExtraArgs={"ACL": "public-read"},
    )
