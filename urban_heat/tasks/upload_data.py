import os

from boto3 import session

S3_KEY = os.environ.get("UH_S3_KEY")
S3_SECRET = os.environ.get("UH_S3_SECRET")

S3_ENDPOINT = os.environ.get("UH_S3_ENDPOINT")
S3_REGION = os.environ.get("UH_S3_REGION")

# Initiate S3 session
session = session.Session()
client = session.client(
    "s3",
    region_name=S3_REGION,
    endpoint_url=f"https://{S3_ENDPOINT}",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET,
)
