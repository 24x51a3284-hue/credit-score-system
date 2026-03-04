"""
Train a RandomForestClassifier on synthetic credit data.
Run this script ONCE before starting the API:
    python -m app.ml.train_model
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

RANDOM_STATE = 42
N_SAMPLES = 10_000
MODEL_DIR = "models"


def generate_synthetic_data(n: int = N_SAMPLES) -> pd.DataFrame:
    """Generate realistic synthetic credit data."""
    np.random.seed(RANDOM_STATE)

    age = np.random.randint(18, 75, n)
    annual_income = np.random.lognormal(mean=11, sigma=0.8, size=n).clip(10_000, 500_000)
    employment_type = np.random.choice(["Employed", "Self-Employed", "Unemployed"],
                                        n, p=[0.65, 0.25, 0.10])
    loan_amount = np.random.lognormal(mean=10, sigma=1.0, size=n).clip(1_000, 200_000)
    num_credit_cards = np.random.randint(0, 15, n)
    credit_utilization = np.random.beta(2, 5, n) * 100
    outstanding_debt = np.random.lognormal(mean=9, sigma=1.2, size=n).clip(0, 100_000)
    payment_history_score = np.random.beta(7, 2, n) * 100
    num_late_payments = np.random.poisson(lam=1.5, size=n).clip(0, 20)

    # Encode employment
    emp_map = {"Employed": 2, "Self-Employed": 1, "Unemployed": 0}
    emp_encoded = np.array([emp_map[e] for e in employment_type])

    # Composite "credit_score_raw" — higher = better credit
    raw_score = (
        0.25 * (payment_history_score / 100)
        + 0.20 * (1 - credit_utilization / 100)
        + 0.15 * np.log1p(annual_income) / np.log1p(500_000)
        + 0.10 * (1 - np.log1p(outstanding_debt) / np.log1p(100_000))
        + 0.10 * (1 - num_late_payments / 20)
        + 0.10 * emp_encoded / 2
        + 0.05 * np.clip(age - 18, 0, 42) / 42
        + 0.05 * (1 - loan_amount / 200_000)
    ) + np.random.normal(0, 0.05, n)

    raw_score = raw_score.clip(0, 1)

    # Map to credit score 300–850
    credit_score = (300 + raw_score * 550).astype(int)

    # Risk label
    risk_category = np.where(credit_score >= 700, "Low",
                    np.where(credit_score >= 580, "Medium", "High"))

    df = pd.DataFrame({
        "age": age,
        "annual_income": annual_income,
        "employment_type_encoded": emp_encoded,
        "loan_amount": loan_amount,
        "num_credit_cards": num_credit_cards,
        "credit_utilization": credit_utilization,
        "outstanding_debt": outstanding_debt,
        "payment_history_score": payment_history_score,
        "num_late_payments": num_late_payments,
        "credit_score": credit_score,
        "risk_category": risk_category,
    })
    return df


def train():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("📊 Generating synthetic dataset …")
    df = generate_synthetic_data()
    print(f"   Rows: {len(df)}  |  Risk distribution:\n{df['risk_category'].value_counts()}\n")

    feature_cols = [
        "age", "annual_income", "employment_type_encoded",
        "loan_amount", "num_credit_cards", "credit_utilization",
        "outstanding_debt", "payment_history_score", "num_late_payments",
    ]

    X = df[feature_cols].values
    y = df["risk_category"].values

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    # Train
    print("🌲 Training RandomForestClassifier …")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

    # Save
    joblib.dump(model,        f"{MODEL_DIR}/credit_model.pkl")
    joblib.dump(scaler,       f"{MODEL_DIR}/scaler.pkl")
    joblib.dump(feature_cols, f"{MODEL_DIR}/feature_names.pkl")
    joblib.dump({"accuracy": acc}, f"{MODEL_DIR}/model_meta.pkl")

    print(f"💾 Model saved to {MODEL_DIR}/")
    return model, scaler, feature_cols


if __name__ == "__main__":
    train()
