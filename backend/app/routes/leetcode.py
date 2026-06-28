from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user, get_user_document
from app.core.db import get_db
from datetime import datetime
import httpx

router = APIRouter()

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
"""

async def fetch_leetcode_stats(username: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            LEETCODE_GRAPHQL,
            json={"query": QUERY, "variables": {"username": username}},
            headers={"Content-Type": "application/json", "Referer": "https://leetcode.com"}
        )
        data = response.json()
        user = data.get("data", {}).get("matchedUser")
        if not user:
            raise HTTPException(status_code=404, detail="LeetCode username not found")
        stats = {s["difficulty"]: s["count"] for s in user["submitStats"]["acSubmissionNum"]}
        return {
            "username": username,
            "total_solved": stats.get("All", 0),
            "easy": stats.get("Easy", 0),
            "medium": stats.get("Medium", 0),
            "hard": stats.get("Hard", 0),
        }

@router.get("/api/leetcode")
async def get_leetcode_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await get_user_document(current_user, db)
    stats = await db.leetcode_stats.find_one({"user_id": user["_id"]})
    if not stats:
        return {"message": "No LeetCode username set. Use PUT /api/leetcode to set username."}
    stats["_id"] = str(stats["_id"])
    stats["user_id"] = str(stats["user_id"])
    return stats

@router.put("/api/leetcode")
async def update_leetcode_username(
    username: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    stats = await fetch_leetcode_stats(username)
    stats["user_id"] = user["_id"]
    stats["updated_at"] = datetime.utcnow()
    existing = await db.leetcode_stats.find_one({"user_id": user["_id"]})
    if existing:
        await db.leetcode_stats.update_one(
            {"user_id": user["_id"]},
            {"$set": stats}
        )
    else:
        await db.leetcode_stats.insert_one(stats)
    stats["user_id"] = str(stats["user_id"])
    return stats