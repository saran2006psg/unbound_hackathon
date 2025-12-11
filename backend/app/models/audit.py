from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AuditLog(BaseModel):
    id: Optional[int] = None
    user_id: int
    event: str
    meta: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    event: str
    meta: Optional[Dict[str, Any]] = None
    timestamp: str
