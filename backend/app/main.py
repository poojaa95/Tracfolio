from fastapi import FastAPI
from app.core.db import connect_db, close_db
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router

app = FastAPI(title="Tracfolio API")

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(auth_router)
app.include_router(users_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}