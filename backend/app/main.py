from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import connect_db, close_db
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.applications import router as applications_router
from app.routes.resumes import router as resumes_router
from app.routes.interview_questions import router as interview_questions_router
from app.routes.leetcode import router as leetcode_router
from app.routes.analytics import router as analytics_router

app = FastAPI(title="Tracfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()
    from app.core.indexes import create_indexes
    await create_indexes()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(applications_router)
app.include_router(resumes_router)
app.include_router(interview_questions_router)
app.include_router(leetcode_router)
app.include_router(analytics_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}