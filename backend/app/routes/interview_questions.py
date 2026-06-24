from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user
from app.core.db import get_db
from app.models.interview_question import InterviewQuestionCreate, InterviewQuestionUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def serialize_question(q) -> dict:
    q["_id"] = str(q["_id"])
    q["user_id"] = str(q["user_id"])
    return q

@router.post("/api/interview-questions")
async def create_question(
    data: InterviewQuestionCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
    question = {
        "user_id": user["_id"],
        "company": data.company,
        "role": data.role,
        "round": data.round,
        "topic": data.topic,
        "question": data.question,
        "notes": data.notes,
        "created_at": datetime.utcnow()
    }
    result = await db.interview_questions.insert_one(question)
    question["_id"] = str(result.inserted_id)
    question["user_id"] = str(question["user_id"])
    return question

@router.get("/api/interview-questions")
async def get_questions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
    questions = await db.interview_questions.find(
        {"user_id": user["_id"]}
    ).to_list(length=100)
    return [serialize_question(q) for q in questions]

@router.get("/api/interview-questions/search")
async def search_questions(
    topic: str = None,
    company: str = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
    query = {"user_id": user["_id"]}
    if topic:
        query["topic"] = {"$regex": topic, "$options": "i"}
    if company:
        query["company"] = {"$regex": company, "$options": "i"}
    questions = await db.interview_questions.find(query).to_list(length=100)
    return [serialize_question(q) for q in questions]

@router.put("/api/interview-questions/{question_id}")
async def update_question(
    question_id: str,
    data: InterviewQuestionUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.interview_questions.update_one(
        {"_id": ObjectId(question_id), "user_id": user["_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question updated"}

@router.delete("/api/interview-questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
    result = await db.interview_questions.delete_one(
        {"_id": ObjectId(question_id), "user_id": user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted"}