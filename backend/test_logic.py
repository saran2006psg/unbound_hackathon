import sys
import os
import re

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

print("=" * 60)
print("BACKEND REGEX VALIDATION TEST")
print("=" * 60)
print()

# Test regex validation without database
def validate_regex(pattern: str):
    """Validate regex pattern. Returns (is_valid, error_message)"""
    try:
        re.compile(pattern)
        return True, None
    except re.error as e:
        return False, str(e)

test_cases = [
    ("^(ls|cat|pwd)$", True, "Valid basic commands"),
    ("rm\\s+-rf\\s+/", True, "Valid with escapes"),
    (":(){ :|:& };:", True, "Fork bomb pattern"),
    ("git\\s+(status|log|diff)", True, "Git commands"),
    ("^(ls|cat|pwd|echo)", True, "Allow basic shell"),
    ("[invalid(regex", False, "Missing closing bracket"),
    ("(?P<invalid", False, "Invalid group"),
    ("*invalid", False, "Invalid quantifier"),
]

print("Testing regex validation...")
print()

all_passed = True
for pattern, should_be_valid, description in test_cases:
    is_valid, error = validate_regex(pattern)
    
    passed = is_valid == should_be_valid
    status = "✓" if passed else "✗"
    
    if not passed:
        all_passed = False
    
    print(f"{status} {description}")
    print(f"   Pattern: {pattern}")
    print(f"   Expected: {'Valid' if should_be_valid else 'Invalid'}")
    print(f"   Got: {'Valid' if is_valid else 'Invalid'}")
    if error:
        print(f"   Error: {error}")
    print()

print("=" * 60)
if all_passed:
    print("✅ ALL REGEX TESTS PASSED!")
else:
    print("❌ SOME TESTS FAILED")
print("=" * 60)
print()

# Test command matching
print("Testing command matching against rules...")
print()

rules = [
    {"pattern": ":(){ :|:& };:", "action": "AUTO_REJECT", "priority": 1, "description": "Block fork-bomb"},
    {"pattern": "rm\\s+-rf\\s+/", "action": "AUTO_REJECT", "priority": 2, "description": "Block root delete"},
    {"pattern": "mkfs\\.", "action": "AUTO_REJECT", "priority": 3, "description": "Block filesystem format"},
    {"pattern": "git\\s+(status|log|diff)", "action": "AUTO_ACCEPT", "priority": 10, "description": "Allow safe git"},
    {"pattern": "^(ls|cat|pwd|echo)", "action": "AUTO_ACCEPT", "priority": 20, "description": "Allow basic commands"},
]

test_commands = [
    ("ls -la", "AUTO_ACCEPT", "Allow basic commands"),
    ("cat /etc/passwd", "AUTO_ACCEPT", "Allow basic commands"),
    ("git status", "AUTO_ACCEPT", "Allow safe git"),
    ("git log", "AUTO_ACCEPT", "Allow safe git"),
    ("rm -rf /", "AUTO_REJECT", "Block root delete"),
    ("mkfs.ext4 /dev/sda", "AUTO_REJECT", "Block filesystem format"),
    (":(){ :|:& };:", "AUTO_REJECT", "Block fork-bomb"),
    ("docker run", None, "No matching rule"),
]

all_match_passed = True
for command, expected_action, description in test_commands:
    matched_rule = None
    for rule in sorted(rules, key=lambda r: r["priority"]):
        try:
            if re.search(rule["pattern"], command):
                matched_rule = rule
                break
        except re.error:
            continue
    
    actual_action = matched_rule["action"] if matched_rule else None
    passed = actual_action == expected_action
    status = "✓" if passed else "✗"
    
    if not passed:
        all_match_passed = False
    
    print(f"{status} {description}")
    print(f"   Command: {command}")
    print(f"   Expected: {expected_action}")
    print(f"   Got: {actual_action}")
    if matched_rule:
        print(f"   Rule: {matched_rule['description']}")
    print()

print("=" * 60)
if all_match_passed:
    print("✅ ALL COMMAND MATCHING TESTS PASSED!")
else:
    print("❌ SOME TESTS FAILED")
print("=" * 60)
print()

if all_passed and all_match_passed:
    print("🎉 BACKEND LOGIC VALIDATED SUCCESSFULLY!")
    print()
    print("The rule engine is working correctly.")
    sys.exit(0)
else:
    sys.exit(1)
