from pydantic import BaseModel
from typing import Optional

class LeetCodeStatsUpdate(BaseModel):
    username: Optional[str] = None
    total_solved: Optional[int] = None
    easy: Optional[int] = None
    medium: Optional[int] = None
    hard: Optional[int] = None
    streak: Optional[int] = None