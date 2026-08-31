import logging
import requests
import os
import boto3
from contextlib import asynccontextmanager
from botocore.exceptions import ClientError
from aiobotocore.session import get_session
from dotenv import load_dotenv
from aiobotocore.session import get_session

load_dotenv()
  
class S3Client:
    def __init__(
        self
    ):
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.endpoint_url = os.getenv("AWS_ENDPOINT_URL")
        self.region = os.getenv("AWS_DEFAULT_REGION")
        self.bucket_name = os.getenv("AWS_BUCKET_NAME")

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

    async def create_presigned_url(self, object_name: str, content_type: str, expiration: int = 300):
        try:
            async with self.get_client() as client:
                url = await client.generate_presigned_post(
                    Bucket=self.bucket_name,
                    Key=object_name,
                    Fields={"Content-Type": content_type},
                    Conditions=[{"Content-Type": content_type}],
                    ExpiresIn=expiration,
                )
        except ClientError as e:
            logging.error(e)
            return None

        return url