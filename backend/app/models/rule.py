from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class RuleAction(str, Enum):
    AUTO_ACCEPT = "AUTO_ACCEPT"
    AUTO_REJECT = "AUTO_REJECT"


class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REJECTED = "REJECTED"


class VoteType(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"


class Rule(BaseModel):
    id: Optional[int] = None
    pattern: str
    action: RuleAction
    priority: int
    description: Optional[str] = None


class RuleCreate(BaseModel):
    pattern: str
    action: RuleAction
    priority: int
    description: Optional[str] = None
    approval_threshold: Optional[int] = 1


class RuleResponse(BaseModel):
    id: int
    pattern: str
    action: str
    priority: int
    description: Optional[str] = None
    approval_threshold: Optional[int] = 1
    approval_status: Optional[str] = "ACTIVE"
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    approval_count: Optional[int] = 0
    rejection_count: Optional[int] = 0


class RegexValidateRequest(BaseModel):
    pattern: str


class RuleVoteCreate(BaseModel):
    vote: VoteType
    comment: Optional[str] = None


class RuleVoteResponse(BaseModel):
    id: int
    rule_id: int
    admin_id: int
    admin_name: str
    vote: str
    comment: Optional[str] = None
    voted_at: datetime


class RuleNotification(BaseModel):
    id: int
    rule_id: int
    rule_pattern: str
    message: str
    is_read: bool
    created_at: datetime
