from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Input features
    age                 = Column(Integer)
    annual_income       = Column(Float)
    employment_type     = Column(String)
    loan_amount         = Column(Float)
    num_credit_cards    = Column(Integer)
    credit_utilization  = Column(Float)
    outstanding_debt    = Column(Float)
    payment_history_score = Column(Float)
    num_late_payments   = Column(Integer)

    # Output
    credit_score        = Column(Integer)
    risk_category       = Column(String)    # Low / Medium / High
    probability         = Column(Float)

    # Explainability — SHAP values stored as JSON
    shap_values         = Column(JSON, nullable=True)

    created_at          = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")
