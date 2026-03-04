from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Prediction ──────────────────────────────────────────────────────────────

class PredictionInput(BaseModel):
    age: int                     = Field(..., ge=18, le=100,   description="Age in years")
    annual_income: float         = Field(..., ge=0,            description="Annual income in USD")
    employment_type: str         = Field(...,                  description="Employed / Self-Employed / Unemployed")
    loan_amount: float           = Field(..., ge=0,            description="Requested loan amount")
    num_credit_cards: int        = Field(..., ge=0, le=30,     description="Number of credit cards")
    credit_utilization: float    = Field(..., ge=0, le=100,    description="Credit utilization %")
    outstanding_debt: float      = Field(..., ge=0,            description="Outstanding debt in USD")
    payment_history_score: float = Field(..., ge=0, le=100,    description="Payment history score 0–100")
    num_late_payments: int       = Field(..., ge=0,            description="Number of late payments")

    @validator("employment_type")
    def validate_employment(cls, v):
        allowed = ["Employed", "Self-Employed", "Unemployed"]
        if v not in allowed:
            raise ValueError(f"employment_type must be one of {allowed}")
        return v


class PredictionOutput(BaseModel):
    credit_score: int
    risk_category: str
    probability: float
    shap_values: Optional[Dict[str, float]]
    feature_importance: Optional[Dict[str, float]]
    message: str

    class Config:
        from_attributes = True


class PredictionRecord(BaseModel):
    id: int
    age: int
    annual_income: float
    employment_type: str
    loan_amount: float
    num_credit_cards: int
    credit_utilization: float
    outstanding_debt: float
    payment_history_score: float
    num_late_payments: int
    credit_score: int
    risk_category: str
    probability: float
    shap_values: Optional[Dict]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Admin ───────────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_predictions: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    model_accuracy: float
    avg_credit_score: float
