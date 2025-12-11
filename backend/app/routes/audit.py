from fastapi import APIRouter, Depends
from typing import List
from app.models import AuditLogResponse
from app.middleware import require_admin
from app.services import AuditService

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=List[AuditLogResponse], dependencies=[Depends(require_admin)])
async def get_audit_logs():
    """Get all audit logs (admin only)"""
    logs = AuditService.get_all_logs()
    return [
        AuditLogResponse(
            id=log["id"],
            user_id=log["user_id"],
            user_name=log.get("user_name", "Unknown"),
            event=log["event"],
            meta=log.get("meta", {}),
            timestamp=log["timestamp"]
        )
        for log in logs
    ]
