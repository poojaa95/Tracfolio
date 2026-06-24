from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeVersionResponse(BaseModel):
    id: str
    user_id: str
    version: int
    file_url: str
    uploaded_at: datetime