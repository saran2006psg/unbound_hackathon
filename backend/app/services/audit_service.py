from typing import List, Dict, Any, Optional
from app.database import supabase_admin
from app.models import AuditLog


class AuditService:
    @staticmethod
    def log_event(user_id: int, event: str, meta: Optional[Dict[str, Any]] = None) -> AuditLog:
        """Log an audit event"""
        audit_data = {
            "user_id": user_id,
            "event": event,
            "meta": meta or {}
        }
        
        response = supabase_admin.table("audit_logs").insert(audit_data).execute()
        
        if not response.data:
            raise Exception("Failed to create audit log")
        
        return AuditLog(**response.data[0])
    
    @staticmethod
    def get_all_logs() -> List[Dict[str, Any]]:
        """Get all audit logs with user information"""
        response = supabase_admin.table("audit_logs").select("*, users(name)").order("timestamp", desc=True).execute()
        
        logs = []
        for log in response.data:
            log_data = {
                "id": log["id"],
                "user_id": log["user_id"],
                "user_name": log.get("users", {}).get("name", "Unknown") if log.get("users") else "Unknown",
                "event": log["event"],
                "meta": log.get("meta", {}),
                "timestamp": log["timestamp"]
            }
            logs.append(log_data)
        
        return logs
