from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.utils.dependencies import get_current_user
from app.core.db import get_db
from datetime import datetime
from bson import ObjectId
import motor.motor_asyncio
from gridfs import GridIn
import gridfs

router = APIRouter()

@router.post("/api/resumes")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})

    count = await db.resume_versions.count_documents({"user_id": user["_id"]})
    version_number = count + 1

    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
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
        "uploaded_at": datetime.utcnow()
    }
    result = await db.resume_versions.insert_one(resume_doc)

    return {
        "_id": str(result.inserted_id),
        "user_id": str(user["_id"]),
        "version": version_number,
        "file_url": str(file_id),
        "uploaded_at": resume_doc["uploaded_at"]
    }

@router.get("/api/resumes")
async def get_resumes(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"google_id": current_user["sub"]})
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
    user = await db.users.find_one({"google_id": current_user["sub"]})
    resume = await db.resume_versions.find_one({
        "_id": ObjectId(resume_id),
        "user_id": user["_id"]
    })
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    from fastapi.responses import StreamingResponse
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
    user = await db.users.find_one({"google_id": current_user["sub"]})
    resume = await db.resume_versions.find_one({
        "_id": ObjectId(resume_id),
        "user_id": user["_id"]
    })
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    bucket = AsyncIOMotorGridFSBucket(db)
    await bucket.delete(ObjectId(resume["file_url"]))
    await db.resume_versions.delete_one({"_id": ObjectId(resume_id)})
    return {"message": "Resume deleted"}