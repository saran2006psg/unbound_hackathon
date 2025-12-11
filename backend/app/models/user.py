from pydantic import BaseModel
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class User(BaseModel):
    id: Optional[int] = None
    name: str
    api_key: str
    role: UserRole
    credits: int


class UserCreate(BaseModel):
    name: str
    role: UserRole = UserRole.MEMBER
    credits: int = 10


class UserResponse(BaseModel):
    id: int
    name: str
    api_key: str
    role: str
    credits: int


class UserUpdateCredits(BaseModel):
    credits: int
