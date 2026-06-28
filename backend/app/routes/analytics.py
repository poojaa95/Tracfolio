from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user, get_user_document
from app.core.db import get_db

router = APIRouter()

@router.get("/api/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await get_user_document(current_user, db)
    user_id = user["_id"]

    # Application counts
    total_applications = await db.applications.count_documents({"user_id": user_id})
    total_interviews = await db.applications.count_documents({"user_id": user_id, "status": "Interview"})
    total_offers = await db.applications.count_documents({"user_id": user_id, "status": "Offer"})
    total_rejected = await db.applications.count_documents({"user_id": user_id, "status": "Rejected"})

    # Applications by source
    source_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    source_data = await db.applications.aggregate(source_pipeline).to_list(length=100)
    applications_by_source = {item["_id"]: item["count"] for item in source_data}

    # Applications by status
    status_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    status_data = await db.applications.aggregate(status_pipeline).to_list(length=100)
    applications_by_status = {item["_id"]: item["count"] for item in status_data}

    # Applications by month
    month_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": {
                "year": {"$year": "$applied_at"},
                "month": {"$month": "$applied_at"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]
    month_data = await db.applications.aggregate(month_pipeline).to_list(length=100)
    applications_by_month = [
        {
            "month": f"{item['_id']['year']}-{str(item['_id']['month']).zfill(2)}",
            "count": item["count"]
        }
        for item in month_data
    ]

    # Resume performance
    resume_pipeline = [
        {"$match": {"user_id": user_id, "resume_id": {"$ne": None}}},
        {"$group": {
            "_id": "$resume_id",
            "total": {"$sum": 1},
            "interviews": {"$sum": {"$cond": [{"$eq": ["$status", "Interview"]}, 1, 0]}},
            "offers": {"$sum": {"$cond": [{"$eq": ["$status", "Offer"]}, 1, 0]}}
        }}
    ]
    resume_data = await db.applications.aggregate(resume_pipeline).to_list(length=100)
    resume_performance = [
        {
            "resume_id": str(item["_id"]),
            "total_applications": item["total"],
            "interviews": item["interviews"],
            "offers": item["offers"],
            "interview_rate": round((item["interviews"] / item["total"]) * 100, 2) if item["total"] > 0 else 0
        }
        for item in resume_data
    ]

    # Top interview topics
    topic_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    topic_data = await db.interview_questions.aggregate(topic_pipeline).to_list(length=10)
    top_topics = [{"topic": item["_id"], "count": item["count"]} for item in topic_data]

    # Most repeated questions
    question_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$question", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    question_data = await db.interview_questions.aggregate(question_pipeline).to_list(length=10)
    repeated_questions = [{"question": item["_id"], "count": item["count"]} for item in question_data]

    return {
        "summary": {
            "total_applications": total_applications,
            "total_interviews": total_interviews,
            "total_offers": total_offers,
            "total_rejected": total_rejected,
            "interview_rate": round((total_interviews / total_applications) * 100, 2) if total_applications > 0 else 0,
            "offer_rate": round((total_offers / total_applications) * 100, 2) if total_applications > 0 else 0
        },
        "applications_by_source": applications_by_source,
        "applications_by_status": applications_by_status,
        "applications_by_month": applications_by_month,
        "resume_performance": resume_performance,
        "top_interview_topics": top_topics,
        "most_repeated_questions": repeated_questions
    }