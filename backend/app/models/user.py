from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class UserSettings(BaseModel):
    theme: str = "light"
    notifications: bool = True
    default_resume_id: Optional[str] = None

class User(BaseModel):
    name: str
    email: EmailStr
    profile_picture: Optional[str] = None
    auth_provider: str = "local"
    google_id: Optional[str] = None
    password_hash: Optional[str] = None
    settings: UserSettings = UserSettings()
    created_at: datetime = datetime.utcnow()
    last_login: datetime = datetime.utcnow()
    is_active: bool = True

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict