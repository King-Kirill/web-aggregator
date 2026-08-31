import os
from contextlib import asynccontextmanager
from aiobotocore.session import get_session
from aiobotocore.session import get_session

def read_secret(path: str) -> str:
    try:
        with open(path) as f:
            return f.read().strip()
    except FileNotFoundError:
        return os.getenv(path.upper())
  
class S3Client:
    def __init__(
        self
    ):
        self.access_key = read_secret("/run/secrets/AWS_ACCESS_KEY_ID")
        self.secret_key = read_secret("/run/secrets/AWS_SECRET_ACCESS_KEY")
        self.endpoint_url = read_secret("/run/secrets/AWS_ENDPOINT_URL")
        self.region = read_secret("/run/secrets/AWS_DEFAULT_REGION")
        self.bucket_name = "vipb-back-up"

        self.config = {
            "aws_access_key_id": self.access_key,
            "aws_secret_access_key": self.secret_key,
            "endpoint_url": self.endpoint_url,
            "region_name": self.region,
        }

        self.session = get_session()

    @asynccontextmanager
    async def get_client(self):
        async with self.session.create_client("s3", **self.config) as client:
            yield client

    async def upload_file(self, file_path: str):
        object_name = file_path.split("/")[-1] 
        async with self.get_client() as client:
            with open(file_path, "rb") as file:
                await client.put_object(
                    Bucket=self.bucket_name,
                    Key=object_name, 
                    Body=file,
                )