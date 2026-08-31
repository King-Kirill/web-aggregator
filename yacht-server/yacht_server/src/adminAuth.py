from datetime import datetime, timedelta
from dotenv import load_dotenv
import secrets
import jwt
import os
from fastapi import Request, HTTPException, status

load_dotenv()

ADMIN_USERNAME = os.getenv("NAME")
ADMIN_PASSWORD = os.getenv("PASSWORD")
ALGORITHM = "HS256"

secret_token = None
expire = None

async def log_user(username: str, password: str):
    global secret_token, expire
    
    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        return None
    
    secret_token = secrets.token_urlsafe(64)
    expire = datetime.utcnow() + timedelta(minutes=60)
    return {"access_token": secret_token, "token_type": "bearer"}


async def verify_token(request: Request):
    token = request.cookies.get("admin_token")

    global secret_token, expire

    if secret_token is None or token != secret_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token"
        )

    if datetime.utcnow() > expire:
        secret_token = None
        expire = None
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )

    return True