from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import Rule, RuleCreate, RuleResponse, RegexValidateRequest
from app.middleware import require_admin
from app.services import RuleService

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.post("", response_model=RuleResponse, dependencies=[Depends(require_admin)])
async def create_rule(rule_create: RuleCreate):
    """Create a new rule (admin only)"""
    try:
        rule = RuleService.create_rule(rule_create)
        return RuleResponse(
            id=rule.id,
            pattern=rule.pattern,
            action=rule.action.value,
            priority=rule.priority,
            description=rule.description
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[RuleResponse], dependencies=[Depends(require_admin)])
async def get_all_rules():
    """Get all rules (admin only)"""
    rules = RuleService.get_all_rules()
    return [
        RuleResponse(
            id=rule.id,
            pattern=rule.pattern,
            action=rule.action.value,
            priority=rule.priority,
            description=rule.description
        )
        for rule in rules
    ]


@router.delete("/{rule_id}", dependencies=[Depends(require_admin)])
async def delete_rule(rule_id: int):
    """Delete a rule (admin only)"""
    success = RuleService.delete_rule(rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted successfully"}


@router.post("/validate", dependencies=[Depends(require_admin)])
async def validate_regex(request: RegexValidateRequest):
    """Validate a regex pattern (admin only)"""
    is_valid, error = RuleService.validate_regex(request.pattern)
    if is_valid:
        return {"valid": True, "message": "Regex pattern is valid"}
    else:
        return {"valid": False, "message": f"Invalid regex: {error}"}
