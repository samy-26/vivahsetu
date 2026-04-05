import boto3
import logging
from botocore.exceptions import NoCredentialsError
from app.config import settings

logger = logging.getLogger(__name__)


def get_s3_client():
    if not settings.AWS_ACCESS_KEY_ID:
        return None
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def upload_file(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    s3 = get_s3_client()
    if not s3:
        raise Exception("S3 not configured")
    s3.put_object(
        Bucket=settings.AWS_BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


def get_presigned_url(key: str, expires_in: int = 3600) -> str:
    s3 = get_s3_client()
    if not s3:
        raise Exception("S3 not configured")
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in,
    )


def delete_file(key: str):
    s3 = get_s3_client()
    if not s3:
        return
    try:
        s3.delete_object(Bucket=settings.AWS_BUCKET_NAME, Key=key)
    except Exception as e:
        logger.warning(f"Failed to delete S3 object {key}: {e}")
