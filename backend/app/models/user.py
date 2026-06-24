from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSettings(BaseModel):
    theme: str = "light"
    notifications: bool = True
    default_resume_id: Optional[str] = None

class User(BaseModel):
    google_id: str
    name: str
    email: EmailStr
    profile_picture: Optional[str] = None
    settings: UserSettings = UserSettings()
    created_at: datetime = datetime.utcnow()
    last_login: datetime = datetime.utcnow()
    is_active: bool = True