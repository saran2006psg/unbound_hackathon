from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class CommandStatus(str, Enum):
    EXECUTED = "executed"
    REJECTED = "rejected"


class Command(BaseModel):
    id: Optional[int] = None
    user_id: int
    command_text: str
    status: CommandStatus
    action: Optional[str] = None
    result_message: str
    created_at: Optional[datetime] = None


class CommandSubmit(BaseModel):
    command_text: str


class CommandResponse(BaseModel):
    id: int
    command_text: str
    status: str
    action: Optional[str] = None
    result_message: str
    new_balance: Optional[int] = None
    created_at: str
