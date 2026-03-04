from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.schemas import UserResponse
from app.core.security import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
