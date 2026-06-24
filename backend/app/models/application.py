from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    company: str
    role: str
    source: str
    status: str = "Applied"
    resume_id: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    resume_id: Optional[str] = None