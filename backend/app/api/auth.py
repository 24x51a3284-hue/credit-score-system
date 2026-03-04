from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.schemas.schemas import UserCreate, UserResponse, Token, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.services.otp_service import send_otp, verify_otp

router = APIRouter()


class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str
    full_name: str
    email: str
    password: str

class OTPCheck(BaseModel):
    phone: str
    otp: str


@router.post("/send-otp")
def request_otp(data: OTPRequest):
    if len(data.phone) != 10 or not data.phone.isdigit():
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")
    result = send_otp(data.phone)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"message": "OTP sent successfully to your mobile!"}


@router.post("/check-otp")
def check_otp(data: OTPCheck):
    if not verify_otp(data.phone, data.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "OTP verified successfully"}


@router.post("/verify-otp", response_model=Token, status_code=201)
def verify_and_signup(data: OTPVerify, db: Session = Depends(get_db)):
    if not verify_otp(data.phone, data.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/signup", response_model=Token, status_code=201)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/token", response_model=Token, include_in_schema=False)
def token_login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}