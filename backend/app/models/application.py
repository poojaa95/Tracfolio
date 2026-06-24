from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

VALID_SOURCES = ["LinkedIn", "Indeed", "Naukri", "Internshala", "Unstop", "Other"]
VALID_STATUSES = ["Applied", "OA Received", "OA Completed", "Interview", "Offer", "Rejected", "Withdrawn"]

class ApplicationCreate(BaseModel):
    company: str
    role: str
    source: str
    status: str = "Applied"
    resume_id: Optional[str] = None

    @validator("source")
    def validate_source(cls, v):
        if v not in VALID_SOURCES:
            raise ValueError(f"source must be one of {VALID_SOURCES}")
        return v

    @validator("status")
    def validate_status(cls, v):
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    resume_id: Optional[str] = None

    @validator("status")
    def validate_status(cls, v):
        if v and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v