from pydantic import BaseModel
from typing import Optional
from enum import Enum


class RuleAction(str, Enum):
    AUTO_ACCEPT = "AUTO_ACCEPT"
    AUTO_REJECT = "AUTO_REJECT"


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


class RuleResponse(BaseModel):
    id: int
    pattern: str
    action: str
    priority: int
    description: Optional[str] = None


class RegexValidateRequest(BaseModel):
    pattern: str
