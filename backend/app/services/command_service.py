from typing import List, Dict, Any
from datetime import datetime
from app.database import supabase_admin
from app.models import Command, CommandStatus, RuleAction
from app.services.rule_service import RuleService
from app.services.user_service import UserService
from app.services.audit_service import AuditService


class CommandService:
    @staticmethod
    def mock_execute(command_text: str) -> str:
        """Mock command execution - returns fake output"""
        return f"Mock execution for command: {command_text}"
    
    @staticmethod
    def process_command(user_id: int, command_text: str) -> Dict[str, Any]:
        """
        Process command with full workflow:
        1. Check credits
        2. Match against rules
        3. Execute or reject
        4. Deduct credit if executed
        5. Log to audit
        
        Returns dict with status, output, new_balance, etc.
        """
        # Check credits first
        user = UserService.get_user_by_id(user_id)
        if not user:
            raise Exception("User not found")
        
        if user.credits <= 0:
            # Log rejection due to no credits
            AuditService.log_event(
                user_id=user_id,
                event="COMMAND_REJECTED",
                meta={"command": command_text, "reason": "No credits"}
            )
            
            # Store rejected command
            command_data = {
                "user_id": user_id,
                "command_text": command_text,
                "status": CommandStatus.REJECTED.value,
                "action": "NO_CREDITS",
                "result_message": "Insufficient credits"
            }
            supabase_admin.table("commands").insert(command_data).execute()
            
            raise Exception("Insufficient credits")
        
        # Match against rules
        matched_rule = RuleService.match_command(command_text)
        
        if not matched_rule:
            # No rule matched - reject by default
            AuditService.log_event(
                user_id=user_id,
                event="COMMAND_REJECTED",
                meta={"command": command_text, "reason": "No matching rule"}
            )
            
            command_data = {
                "user_id": user_id,
                "command_text": command_text,
                "status": CommandStatus.REJECTED.value,
                "action": "NO_RULE",
                "result_message": "No matching rule found"
            }
            response = supabase_admin.table("commands").insert(command_data).execute()
            
            return {
                "id": response.data[0]["id"],
                "status": "rejected",
                "result_message": "No matching rule found",
                "action": "NO_RULE",
                "new_balance": user.credits,
                "created_at": response.data[0]["created_at"]
            }
        
        # Handle AUTO_REJECT
        if matched_rule.action == RuleAction.AUTO_REJECT:
            AuditService.log_event(
                user_id=user_id,
                event="COMMAND_REJECTED",
                meta={
                    "command": command_text,
                    "rule_id": matched_rule.id,
                    "rule_description": matched_rule.description
                }
            )
            
            command_data = {
                "user_id": user_id,
                "command_text": command_text,
                "status": CommandStatus.REJECTED.value,
                "action": matched_rule.action.value,
                "result_message": f"Command rejected by rule: {matched_rule.description or 'Security policy'}"
            }
            response = supabase_admin.table("commands").insert(command_data).execute()
            
            return {
                "id": response.data[0]["id"],
                "status": "rejected",
                "result_message": command_data["result_message"],
                "action": matched_rule.action.value,
                "new_balance": user.credits,
                "created_at": response.data[0]["created_at"]
            }
        
        # Handle AUTO_ACCEPT - atomic operation
        try:
            # Deduct credit
            new_balance = UserService.deduct_credit(user_id)
            
            # Mock execute
            output = CommandService.mock_execute(command_text)
            
            # Store command
            command_data = {
                "user_id": user_id,
                "command_text": command_text,
                "status": CommandStatus.EXECUTED.value,
                "action": matched_rule.action.value,
                "result_message": output
            }
            response = supabase_admin.table("commands").insert(command_data).execute()
            
            # Log success
            AuditService.log_event(
                user_id=user_id,
                event="COMMAND_EXECUTED",
                meta={
                    "command": command_text,
                    "rule_id": matched_rule.id,
                    "rule_description": matched_rule.description,
                    "credits_remaining": new_balance
                }
            )
            
            return {
                "id": response.data[0]["id"],
                "status": "executed",
                "result_message": output,
                "action": matched_rule.action.value,
                "new_balance": new_balance,
                "created_at": response.data[0]["created_at"]
            }
        
        except Exception as e:
            # Log failure
            AuditService.log_event(
                user_id=user_id,
                event="COMMAND_FAILED",
                meta={"command": command_text, "error": str(e)}
            )
            raise
    
    @staticmethod
    def get_user_commands(user_id: int) -> List[Command]:
        """Get command history for a user"""
        response = supabase_admin.table("commands").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return [Command(**cmd) for cmd in response.data]
