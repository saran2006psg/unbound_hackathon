import re
from typing import List, Optional, Tuple
from app.database import supabase_admin
from app.models import Rule, RuleCreate, RuleAction


class RuleService:
    @staticmethod
    def validate_regex(pattern: str) -> Tuple[bool, Optional[str]]:
        """Validate regex pattern. Returns (is_valid, error_message)"""
        try:
            re.compile(pattern)
            return True, None
        except re.error as e:
            return False, str(e)
    
    @staticmethod
    def create_rule(rule_create: RuleCreate) -> Rule:
        """Create a new rule with regex validation"""
        is_valid, error = RuleService.validate_regex(rule_create.pattern)
        if not is_valid:
            raise ValueError(f"Invalid regex pattern: {error}")
        
        rule_data = {
            "pattern": rule_create.pattern,
            "action": rule_create.action.value,
            "priority": rule_create.priority,
            "description": rule_create.description
        }
        
        response = supabase_admin.table("rules").insert(rule_data).execute()
        
        if not response.data:
            raise Exception("Failed to create rule")
        
        return Rule(**response.data[0])
    
    @staticmethod
    def get_all_rules() -> List[Rule]:
        """Get all rules ordered by priority"""
        response = supabase_admin.table("rules").select("*").order("priority").execute()
        return [Rule(**rule) for rule in response.data]
    
    @staticmethod
    def delete_rule(rule_id: int) -> bool:
        """Delete a rule"""
        response = supabase_admin.table("rules").delete().eq("id", rule_id).execute()
        return response.data is not None
    
    @staticmethod
    def match_command(command_text: str) -> Optional[Rule]:
        """Match command against rules (first match wins)"""
        rules = RuleService.get_all_rules()
        
        for rule in rules:
            try:
                if re.search(rule.pattern, command_text):
                    return rule
            except re.error:
                # Skip invalid regex patterns
                continue
        
        return None
