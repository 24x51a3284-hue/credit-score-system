from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.db.database import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.schemas import PredictionInput, PredictionOutput, PredictionRecord
from app.core.security import get_current_user
from app.services import ml_service

router = APIRouter()


@router.post("/predict", response_model=PredictionOutput)
def predict(
    data: PredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run credit score prediction and store result in database."""
    result = ml_service.predict(data.dict())

    # Persist to DB
    record = Prediction(
        user_id=current_user.id,
        age=data.age,
        annual_income=data.annual_income,
        employment_type=data.employment_type,
        loan_amount=data.loan_amount,
        num_credit_cards=data.num_credit_cards,
        credit_utilization=data.credit_utilization,
        outstanding_debt=data.outstanding_debt,
        payment_history_score=data.payment_history_score,
        num_late_payments=data.num_late_payments,
        credit_score=result["credit_score"],
        risk_category=result["risk_category"],
        probability=result["probability"],
        shap_values=result["shap_values"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return result


@router.get("/history", response_model=List[PredictionRecord])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return prediction history for the logged-in user."""
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/history/{prediction_id}", response_model=PredictionRecord)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return record


@router.get("/history/{prediction_id}/pdf")
def download_pdf(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a PDF report for a single prediction."""
    record = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    pdf_bytes = _generate_pdf(record, current_user)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=credit_report_{prediction_id}.pdf"},
    )


def _generate_pdf(record: Prediction, user: User) -> bytes:
    """Generate a simple PDF report using reportlab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        import io as _io

        buf = _io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle("Title", fontSize=20, spaceAfter=12, textColor=colors.HexColor("#1E40AF"))
        story.append(Paragraph("Credit Score Prediction Report", title_style))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"User: {user.full_name}  |  Email: {user.email}", styles["Normal"]))
        story.append(Paragraph(f"Date: {record.created_at.strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
        story.append(Spacer(1, 24))

        risk_color = {"Low": "#16A34A", "Medium": "#D97706", "High": "#DC2626"}.get(record.risk_category, "#000")
        story.append(Paragraph(f"<b>Credit Score: {record.credit_score}</b>", ParagraphStyle("Score", fontSize=18, textColor=colors.HexColor(risk_color))))
        story.append(Paragraph(f"Risk Category: {record.risk_category}", styles["Heading2"]))
        story.append(Paragraph(f"Confidence: {record.probability * 100:.1f}%", styles["Normal"]))
        story.append(Spacer(1, 20))

        data = [["Feature", "Value"],
                ["Age", record.age],
                ["Annual Income", f"${record.annual_income:,.0f}"],
                ["Employment Type", record.employment_type],
                ["Loan Amount", f"${record.loan_amount:,.0f}"],
                ["Credit Cards", record.num_credit_cards],
                ["Credit Utilization", f"{record.credit_utilization:.1f}%"],
                ["Outstanding Debt", f"${record.outstanding_debt:,.0f}"],
                ["Payment History Score", f"{record.payment_history_score:.1f}"],
                ["Late Payments", record.num_late_payments]]

        t = Table(data, colWidths=[200, 200])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E40AF")),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EFF6FF")]),
        ]))
        story.append(t)
        doc.build(story)
        return buf.getvalue()
    except ImportError:
        # fallback plain text
        text = f"Credit Score Report\n\nScore: {record.credit_score}\nRisk: {record.risk_category}\n"
        return text.encode()
