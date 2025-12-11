from fastapi import APIRouter, Depends
from app.models import User, UserResponse
from app.middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/validate", response_model=UserResponse)
async def validate_api_key(current_user: User = Depends(get_current_user)):
    """Validate API key and return user info"""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        api_key=current_user.api_key,
        role=current_user.role.value,
        credits=current_user.credits
    )
