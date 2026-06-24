from pydantic import BaseModel
from typing import Optional

class InterviewQuestionCreate(BaseModel):
    company: str
    role: str
    round: str
    topic: str
    question: str
    notes: Optional[str] = None

class InterviewQuestionUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    round: Optional[str] = None
    topic: Optional[str] = None
    question: Optional[str] = None
    notes: Optional[str] = None