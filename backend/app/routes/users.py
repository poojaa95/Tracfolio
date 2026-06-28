from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user, get_user_document
from app.core.db import get_db

router = APIRouter()

@router.get("/api/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await get_user_document(current_user, db)
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    return user