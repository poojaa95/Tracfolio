from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeVersionResponse(BaseModel):
    id: str
    user_id: str
    version: int
    file_url: str
    name: Optional[str] = None
    notes: Optional[str] = None
    uploaded_at: datetime