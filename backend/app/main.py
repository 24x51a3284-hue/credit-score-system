from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, predictions, admin, users
from app.core.config import settings
from app.db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Credit Score Prediction API",
    description="Production-ready Credit Score Prediction System with ML, JWT Auth, and Explainable AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",        tags=["Authentication"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(admin.router,       prefix="/api/admin",       tags=["Admin"])
app.include_router(users.router,       prefix="/api/users",       tags=["Users"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Credit Score Prediction API is running 🚀"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": "1.0.0"}