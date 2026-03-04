from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.schemas import AdminStats
from app.core.security import get_current_admin
from app.services.ml_service import get_model_accuracy

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def get_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    total_users       = db.query(func.count(User.id)).scalar()
    total_predictions = db.query(func.count(Prediction.id)).scalar()
    low_risk          = db.query(func.count(Prediction.id)).filter(Prediction.risk_category == "Low").scalar()
    medium_risk       = db.query(func.count(Prediction.id)).filter(Prediction.risk_category == "Medium").scalar()
    high_risk         = db.query(func.count(Prediction.id)).filter(Prediction.risk_category == "High").scalar()
    avg_score_row     = db.query(func.avg(Prediction.credit_score)).scalar()
    avg_score         = float(avg_score_row) if avg_score_row else 0.0

    return AdminStats(
        total_users=total_users or 0,
        total_predictions=total_predictions or 0,
        low_risk_count=low_risk or 0,
        medium_risk_count=medium_risk or 0,
        high_risk_count=high_risk or 0,
        model_accuracy=get_model_accuracy(),
        avg_credit_score=avg_score,
    )


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name,
             "role": u.role, "is_active": u.is_active,
             "created_at": u.created_at,
             "prediction_count": len(u.predictions)} for u in users]


@router.get("/predictions")
def get_all_predictions(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return db.query(Prediction).order_by(Prediction.created_at.desc()).limit(200).all()
