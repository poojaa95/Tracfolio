from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from app.services.auth_service import get_google_user
from app.utils.jwt import create_access_token
from app.core.db import get_db
from app.core.config import settings
from datetime import datetime

router = APIRouter()

REDIRECT_URI = "http://localhost:8000/auth/google/callback"

GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
    "?response_type=code"
    f"&client_id={settings.GOOGLE_CLIENT_ID}"
    f"&redirect_uri={REDIRECT_URI}"
    "&scope=openid%20email%20profile"
)

@router.get("/auth/google/login")
async def google_login():
    return RedirectResponse(GOOGLE_AUTH_URL)

@router.get("/auth/google/callback")
async def google_callback(code: str):
    user_data = await get_google_user(code, REDIRECT_URI)

    if not user_data or "email" not in user_data:
        raise HTTPException(status_code=400, detail="Failed to fetch user from Google")

    db = get_db()
    existing_user = await db.users.find_one({"google_id": user_data["id"]})

    if existing_user:
        await db.users.update_one(
            {"google_id": user_data["id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
    else:
        await db.users.insert_one({
            "google_id": user_data["id"],
            "name": user_data["name"],
            "email": user_data["email"],
            "profile_picture": user_data.get("picture"),
            "settings": {
                "theme": "light",
                "notifications": True,
                "default_resume_id": None
            },
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "is_active": True
        })

    token = create_access_token({"sub": user_data["id"], "email": user_data["email"]})
    return {"access_token": token, "token_type": "bearer"}