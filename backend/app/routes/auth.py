from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from app.services.auth_service import get_google_user, hash_password, verify_password
from app.utils.jwt import create_access_token
from app.utils.dependencies import get_current_user
from app.core.db import get_db
from app.core.config import settings
from app.models.user import RegisterRequest, LoginRequest
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

# ─── Google OAuth ────────────────────────────────────────────

@router.get("/auth/google/login")
async def google_login():
    return RedirectResponse(GOOGLE_AUTH_URL)

@router.get("/auth/google/callback")
async def google_callback(code: str):
    user_data = await get_google_user(code, REDIRECT_URI)

    if not user_data or "email" not in user_data:
        raise HTTPException(status_code=400, detail="Failed to fetch user from Google")

    db = get_db()
    existing_user = await db.users.find_one({"email": user_data["email"]})

    if existing_user:
        await db.users.update_one(
            {"email": user_data["email"]},
            {"$set": {
                "last_login": datetime.utcnow(),
                "google_id": user_data["id"],
                "auth_provider": "google"
            }}
        )
        user_id = str(existing_user["_id"])
    else:
        result = await db.users.insert_one({
            "google_id": user_data["id"],
            "name": user_data["name"],
            "email": user_data["email"],
            "profile_picture": user_data.get("picture"),
            "auth_provider": "google",
            "password_hash": None,
            "settings": {
                "theme": "light",
                "notifications": True,
                "default_resume_id": None
            },
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "is_active": True
        })
        user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_data["id"], "email": user_data["email"], "auth_provider": "google"})
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"http://localhost:5173/auth/callback?token={token}")

# ─── Email/Password Auth ─────────────────────────────────────

@router.post("/auth/register")
async def register(data: RegisterRequest):
    db = get_db()

    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(data.password)

    result = await db.users.insert_one({
        "google_id": None,
        "name": data.name,
        "email": data.email,
        "profile_picture": None,
        "auth_provider": "local",
        "password_hash": password_hash,
        "settings": {
            "theme": "light",
            "notifications": True,
            "default_resume_id": None
        },
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "is_active": True
    })

    token = create_access_token({
        "sub": str(result.inserted_id),
        "email": data.email,
        "auth_provider": "local"
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "name": data.name,
            "email": data.email,
            "auth_provider": "local"
        }
    }

@router.post("/auth/login")
async def login(data: LoginRequest):
    db = get_db()

    user = await db.users.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("auth_provider") == "google":
        raise HTTPException(
            status_code=400,
            detail="This email is registered with Google. Please use Google login."
        )

    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.users.update_one(
        {"email": data.email},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "auth_provider": "local"
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "auth_provider": "local"
        }
    }
@router.post("/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}