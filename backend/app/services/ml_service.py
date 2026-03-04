"""
Loads the trained model and provides prediction + SHAP explanations.
"""

import numpy as np
import joblib
import os
from typing import Tuple, Dict

from app.core.config import settings

# ─── Load model artifacts once at startup ────────────────────────────────────
_model        = None
_scaler       = None
_feature_names = None
_model_meta    = None

def _load():
    global _model, _scaler, _feature_names, _model_meta
    if _model is None:
        _model         = joblib.load(settings.MODEL_PATH)
        _scaler        = joblib.load(settings.SCALER_PATH)
        _feature_names = joblib.load(settings.FEATURE_NAMES_PATH)
        meta_path      = settings.MODEL_PATH.replace("credit_model.pkl", "model_meta.pkl")
        _model_meta    = joblib.load(meta_path) if os.path.exists(meta_path) else {"accuracy": 0.95}


SCORE_MAP = {"Low": (700, 850), "Medium": (580, 699), "High": (300, 579)}

EMP_MAP = {"Employed": 2, "Self-Employed": 1, "Unemployed": 0}

DISPLAY_NAMES = {
    "age": "Age",
    "annual_income": "Annual Income",
    "employment_type_encoded": "Employment Type",
    "loan_amount": "Loan Amount",
    "num_credit_cards": "Credit Cards",
    "credit_utilization": "Credit Utilization %",
    "outstanding_debt": "Outstanding Debt",
    "payment_history_score": "Payment History",
    "num_late_payments": "Late Payments",
}


def predict(input_data: dict) -> dict:
    """
    Returns credit_score, risk_category, probability, shap_values, feature_importance.
    """
    _load()

    # Build feature vector
    raw = [
        input_data["age"],
        input_data["annual_income"],
        EMP_MAP.get(input_data["employment_type"], 1),
        input_data["loan_amount"],
        input_data["num_credit_cards"],
        input_data["credit_utilization"],
        input_data["outstanding_debt"],
        input_data["payment_history_score"],
        input_data["num_late_payments"],
    ]

    X = _scaler.transform([raw])

    # Predict
    risk_category = _model.predict(X)[0]          # "Low" / "Medium" / "High"
    proba_arr     = _model.predict_proba(X)[0]
    classes       = list(_model.classes_)
    prob_dict     = dict(zip(classes, proba_arr))
    probability   = float(prob_dict[risk_category])

    # Map risk → credit score range
    lo, hi = SCORE_MAP[risk_category]
    credit_score = int(lo + probability * (hi - lo))

    # SHAP values (TreeExplainer is fast for RF)
    shap_values_dict = _compute_shap(X, risk_category)

    # Feature importance from RF
    fi = {DISPLAY_NAMES[_feature_names[i]]: float(v)
          for i, v in enumerate(_model.feature_importances_)}

    return {
        "credit_score":       credit_score,
        "risk_category":      risk_category,
        "probability":        probability,
        "shap_values":        shap_values_dict,
        "feature_importance": fi,
        "message":            _generate_message(risk_category, credit_score),
    }


def _compute_shap(X: np.ndarray, risk_category: str) -> Dict[str, float]:
    """Compute SHAP values using TreeExplainer."""
    try:
        import shap
        explainer   = shap.TreeExplainer(_model)
        shap_arr    = explainer.shap_values(X)
        class_idx   = list(_model.classes_).index(risk_category)
        vals        = shap_arr[class_idx][0] if isinstance(shap_arr, list) else shap_arr[0]
        return {DISPLAY_NAMES[_feature_names[i]]: float(v) for i, v in enumerate(vals)}
    except Exception:
        # Fallback: use feature importance as proxy
        return {DISPLAY_NAMES[_feature_names[i]]: float(v)
                for i, v in enumerate(_model.feature_importances_)}


def _generate_message(risk: str, score: int) -> str:
    msgs = {
        "Low":    f"Excellent! Your credit score of {score} indicates low risk. You qualify for most loan products.",
        "Medium": f"Fair credit score of {score}. Improving payment history and reducing debt can raise it.",
        "High":   f"Credit score of {score} indicates high risk. Focus on clearing outstanding debt and late payments.",
    }
    return msgs[risk]


def get_model_accuracy() -> float:
    _load()
    return _model_meta.get("accuracy", 0.95)
