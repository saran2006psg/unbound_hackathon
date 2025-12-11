from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import Rule, RuleCreate, RuleResponse, RegexValidateRequest
from app.middleware import require_admin
from app.services import RuleService

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.post("", response_model=RuleResponse, dependencies=[Depends(require_admin)])
async def create_rule(rule_create: RuleCreate, force: bool = False):
    """Create a new rule (admin only)
    
    Args:
        rule_create: Rule data
        force: If True, create rule even if conflicts exist
    """
    try:
        # Check for conflicts unless force is True
        if not force:
            conflict_result = RuleService.detect_conflicts(rule_create.pattern)
            if conflict_result["has_conflicts"]:
                raise HTTPException(
                    status_code=409,
                    detail={
                        "error": "Rule conflicts detected",
                        "conflicts": conflict_result
                    }
                )
        
        rule = RuleService.create_rule(rule_create)
        return RuleResponse(
            id=rule.id,
            pattern=rule.pattern,
            action=rule.action.value,
            priority=rule.priority,
            description=rule.description
        )
    except HTTPException:
        raise
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


@router.post("/check-conflicts", dependencies=[Depends(require_admin)])
async def check_conflicts(request: dict):
    """Check if a pattern conflicts with existing rules (admin only)"""
    pattern = request.get("pattern")
    test_commands = request.get("test_commands")
    
    if not pattern:
        raise HTTPException(status_code=400, detail="Pattern is required")
    
    try:
        result = RuleService.detect_conflicts(pattern, test_commands)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-pattern", dependencies=[Depends(require_admin)])
async def test_pattern(request: dict):
    """Test a pattern against specific commands (admin only)"""
    pattern = request.get("pattern")
    commands = request.get("commands")
    
    if not pattern:
        raise HTTPException(status_code=400, detail="Pattern is required")
    if not commands:
        raise HTTPException(status_code=400, detail="Commands are required")
    
    try:
        results = RuleService.test_pattern_against_commands(pattern, commands)
        return {"results": results}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
