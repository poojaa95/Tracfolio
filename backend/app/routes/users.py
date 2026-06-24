from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user
from app.core.db import get_db

router = APIRouter()

@router.get("/api/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user