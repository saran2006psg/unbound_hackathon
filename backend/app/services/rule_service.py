import re
from typing import List, Optional, Tuple, Dict, Any
from app.database import supabase_admin
from app.models import Rule, RuleCreate, RuleAction


class RuleService:
    # Default test commands for conflict detection
    TEST_COMMANDS = [
        "ls -la",
        "cat /etc/passwd",
        "pwd",
        "echo hello",
        "git status",
        "git log",
        "git diff",
        "rm -rf /",
        "rm file.txt",
        "mkfs.ext4 /dev/sda",
        ":(){ :|:& };:",
        "docker run nginx",
        "npm install",
        "sudo su",
        "chmod 777 file",
    ]
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
    
    @staticmethod
    def detect_conflicts(pattern: str, test_commands: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Detect if a new pattern conflicts with existing rules.
        Returns dict with conflict information.
        """
        # Validate the pattern first
        is_valid, error = RuleService.validate_regex(pattern)
        if not is_valid:
            return {
                "has_conflicts": False,
                "conflicts": [],
                "test_results": [],
                "error": f"Invalid regex pattern: {error}"
            }
        
        # Use default test commands if none provided
        commands_to_test = test_commands or RuleService.TEST_COMMANDS
        
        # Get all existing rules
        existing_rules = RuleService.get_all_rules()
        
        # Track conflicts
        conflicts = []
        test_results = []
        
        try:
            new_pattern_compiled = re.compile(pattern)
        except re.error as e:
            return {
                "has_conflicts": False,
                "conflicts": [],
                "test_results": [],
                "error": str(e)
            }
        
        # Test each command
        for command in commands_to_test:
            new_matches = bool(new_pattern_compiled.search(command))
            
            if new_matches:
                # Check if any existing rule also matches this command
                for rule in existing_rules:
                    try:
                        if re.search(rule.pattern, command):
                            # Check if this rule is already in conflicts
                            existing_conflict = next(
                                (c for c in conflicts if c["rule_id"] == rule.id),
                                None
                            )
                            
                            if existing_conflict:
                                existing_conflict["overlapping_commands"].append(command)
                            else:
                                conflict_info = {
                                    "rule_id": rule.id,
                                    "pattern": rule.pattern,
                                    "action": rule.action.value,
                                    "priority": rule.priority,
                                    "description": rule.description,
                                    "overlapping_commands": [command]
                                }
                                conflicts.append(conflict_info)
                    except re.error:
                        continue
            
            # Record test result
            test_results.append({
                "command": command,
                "matches_new_pattern": new_matches
            })
        
        return {
            "has_conflicts": len(conflicts) > 0,
            "conflicts": conflicts,
            "test_results": test_results,
            "total_conflicts": len(conflicts),
            "total_overlapping_commands": sum(len(c["overlapping_commands"]) for c in conflicts)
        }
    
    @staticmethod
    def test_pattern_against_commands(pattern: str, commands: List[str]) -> List[Dict[str, Any]]:
        """
        Test a pattern against specific commands.
        Returns list of results showing which commands match.
        """
        is_valid, error = RuleService.validate_regex(pattern)
        if not is_valid:
            raise ValueError(f"Invalid regex pattern: {error}")
        
        try:
            pattern_compiled = re.compile(pattern)
        except re.error as e:
            raise ValueError(str(e))
        
        results = []
        for command in commands:
            matches = bool(pattern_compiled.search(command))
            result = {
                "command": command,
                "matches": matches
            }
            
            # If it matches, check which existing rule would handle it
            if matches:
                matched_rule = RuleService.match_command(command)
                if matched_rule:
                    result["current_rule"] = {
                        "id": matched_rule.id,
                        "pattern": matched_rule.pattern,
                        "action": matched_rule.action.value,
                        "priority": matched_rule.priority,
                        "description": matched_rule.description
                    }
            
            results.append(result)
        
        return results
