from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from app.utils.dependencies import get_current_user, get_user_document
from app.core.db import get_db
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket


router = APIRouter()

@router.post("/api/resumes")
async def upload_resume(
    file: UploadFile = File(...),
    name: str = Form(None),
    notes: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    db = get_db()
    user = await get_user_document(current_user, db)
    count = await db.resume_versions.count_documents({"user_id": user["_id"]})
    version_number = count + 1
    bucket = AsyncIOMotorGridFSBucket(db)
    file_content = await file.read()
    file_id = await bucket.upload_from_stream(
        file.filename,
        file_content,
        metadata={"content_type": "application/pdf"}
    )
    resume_doc = {
        "user_id": user["_id"],
        "version": version_number,
        "file_url": str(file_id),
        "name": name or f"Resume v{version_number}",
        "notes": notes,
        "uploaded_at": datetime.utcnow()
    }
    result = await db.resume_versions.insert_one(resume_doc)
    return {
        "_id": str(result.inserted_id),
        "user_id": str(user["_id"]),
        "version": version_number,
        "file_url": str(file_id),
        "name": resume_doc["name"],
        "notes": resume_doc["notes"],
        "uploaded_at": resume_doc["uploaded_at"]
    }

@router.get("/api/resumes")
async def get_resumes(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await get_user_document(current_user, db)
    resumes = await db.resume_versions.find(
        {"user_id": user["_id"]}
    ).sort("version", 1).to_list(length=100)
    for r in resumes:
        r["_id"] = str(r["_id"])
        r["user_id"] = str(r["user_id"])
    return resumes

@router.get("/api/resumes/{resume_id}/download")
async def download_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    try:
        resume = await db.resume_versions.find_one({
            "_id": ObjectId(resume_id),
            "user_id": user["_id"]
        })
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid resume ID format")
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    bucket = AsyncIOMotorGridFSBucket(db)
    stream = await bucket.open_download_stream(ObjectId(resume["file_url"]))
    return StreamingResponse(
        stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resume_v{resume['version']}.pdf"}
    )

@router.delete("/api/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    try:
        resume = await db.resume_versions.find_one({
            "_id": ObjectId(resume_id),
            "user_id": user["_id"]
        })
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid resume ID format")
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    bucket = AsyncIOMotorGridFSBucket(db)
    await bucket.delete(ObjectId(resume["file_url"]))
    await db.resume_versions.delete_one({"_id": ObjectId(resume_id)})
    return {"message": "Resume deleted"}