import re
from app.services.rule_service import RuleService

print("Testing Regex Validation...")
print("=" * 50)

# Test cases
test_cases = [
    ("^(ls|cat|pwd)$", True, "Valid regex"),
    ("rm\\s+-rf\\s+/", True, "Valid regex with escapes"),
    (":(){ :|:& };:", True, "Fork bomb pattern"),
    ("[invalid(regex", False, "Missing closing bracket"),
    ("(?P<invalid", False, "Invalid group"),
    ("*invalid", False, "Invalid quantifier"),
]

for pattern, should_be_valid, description in test_cases:
    is_valid, error = RuleService.validate_regex(pattern)
    
    status = "✓" if is_valid == should_be_valid else "✗"
    print(f"{status} {description}")
    print(f"   Pattern: {pattern}")
    print(f"   Valid: {is_valid}")
    if error:
        print(f"   Error: {error}")
    print()

print("=" * 50)
print("Regex validation tests completed!")
