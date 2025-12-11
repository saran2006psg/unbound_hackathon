import requests
import json

API_KEY = "cgw_admin_default_key_change_in_production"
BASE_URL = "http://127.0.0.1:8000"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Test 1: Check conflicts for a pattern that should conflict with existing "Basic commands" rule
print("Test 1: Pattern '^ls' should conflict with existing rules")
response = requests.post(
    f"{BASE_URL}/api/rules/check-conflicts",
    headers=headers,
    json={"pattern": "^ls"}
)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))
print("\n" + "="*80 + "\n")

# Test 2: Check conflicts for a non-conflicting pattern
print("Test 2: Pattern '^docker' should not conflict")
response = requests.post(
    f"{BASE_URL}/api/rules/check-conflicts",
    headers=headers,
    json={"pattern": "^docker"}
)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))
print("\n" + "="*80 + "\n")

# Test 3: Try to create a rule with conflicts (should fail with 409)
print("Test 3: Creating rule with conflicts without force (should fail)")
response = requests.post(
    f"{BASE_URL}/api/rules",
    headers=headers,
    json={
        "pattern": "^ls.*",
        "action": "AUTO_ACCEPT",
        "priority": 150,
        "description": "Test conflicting rule"
    }
)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))
print("\n" + "="*80 + "\n")

# Test 4: Create the same rule with force=true (should succeed)
print("Test 4: Creating rule with conflicts using force=true (should succeed)")
response = requests.post(
    f"{BASE_URL}/api/rules?force=true",
    headers=headers,
    json={
        "pattern": "^ls.*",
        "action": "AUTO_ACCEPT",
        "priority": 150,
        "description": "Test conflicting rule (forced)"
    }
)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))
