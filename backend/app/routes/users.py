from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import User, UserCreate, UserResponse, UserUpdateCredits
from app.middleware import require_admin, get_current_user
from app.services import UserService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def create_user(user_create: UserCreate):
    """Create a new user (admin only)"""
    try:
        user = UserService.create_user(user_create)
        return UserResponse(
            id=user.id,
            name=user.name,
            api_key=user.api_key,
            role=user.role.value,
            credits=user.credits
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[UserResponse], dependencies=[Depends(require_admin)])
async def get_all_users():
    """Get all users (admin only)"""
    users = UserService.get_all_users()
    return [
        UserResponse(
            id=user.id,
            name=user.name,
            api_key=user.api_key,
            role=user.role.value,
            credits=user.credits
        )
        for user in users
    ]


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        api_key=current_user.api_key,
        role=current_user.role.value,
        credits=current_user.credits
    )


@router.put("/{user_id}/credits", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def update_user_credits(user_id: int, update: UserUpdateCredits):
    """Update user credits (admin only)"""
    try:
        user = UserService.update_credits(user_id, update.credits)
        return UserResponse(
            id=user.id,
            name=user.name,
            api_key=user.api_key,
            role=user.role.value,
            credits=user.credits
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
