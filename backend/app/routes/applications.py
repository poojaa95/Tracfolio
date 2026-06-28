from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user, get_user_document
from app.core.db import get_db
from app.models.application import ApplicationCreate, ApplicationUpdate
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()

def serialize_application(app) -> dict:
    app["_id"] = str(app["_id"])
    app["user_id"] = str(app["user_id"])
    if app.get("resume_id"):
        app["resume_id"] = str(app["resume_id"])
    return app

@router.post("/api/applications")
async def create_application(
    data: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    application = {
        "user_id": user["_id"],
        "company": data.company,
        "role": data.role,
        "source": data.source,
        "status": data.status,
        "resume_id": ObjectId(data.resume_id) if data.resume_id else None,
        "applied_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.applications.insert_one(application)
    application["_id"] = str(result.inserted_id)
    application["user_id"] = str(application["user_id"])
    return application

@router.get("/api/applications")
async def get_applications(
    current_user: dict = Depends(get_current_user),
    page: int = 1,
    limit: int = 20,
    status: str = None,
    source: str = None
):
    db = get_db()
    user = await get_user_document(current_user, db)
    query = {"user_id": user["_id"]}
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    skip = (page - 1) * limit
    applications = await db.applications.find(query).skip(skip).limit(limit).to_list(length=limit)
    total = await db.applications.count_documents(query)
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": [serialize_application(app) for app in applications]
    }

@router.get("/api/applications/{application_id}")
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    try:
        app = await db.applications.find_one({
            "_id": ObjectId(application_id),
            "user_id": user["_id"]
        })
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid application ID format")
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return serialize_application(app)

@router.put("/api/applications/{application_id}")
async def update_application(
    application_id: str,
    data: ApplicationUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    update_data = {"updated_at": datetime.utcnow()}
    if data.status:
        update_data["status"] = data.status
    if data.resume_id:
        try:
            update_data["resume_id"] = ObjectId(data.resume_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid resume ID format")
    try:
        result = await db.applications.update_one(
            {"_id": ObjectId(application_id), "user_id": user["_id"]},
            {"$set": update_data}
        )
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid application ID format")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application updated"}

@router.delete("/api/applications/{application_id}")
async def delete_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user = await get_user_document(current_user, db)
    try:
        result = await db.applications.delete_one(
            {"_id": ObjectId(application_id), "user_id": user["_id"]}
        )
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid application ID format")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}