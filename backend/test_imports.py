import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

print("=" * 60)
print("BACKEND IMPORT TEST")
print("=" * 60)
print()

# Test imports without database connection
print("Testing core module imports (no database connection)...")
print()

try:
    from app.config import get_settings
    print("✓ Config module")
    
    from app.models import User, Rule, Command, AuditLog, UserCreate, RuleCreate
    print("✓ Models")
    
    from app.models.user import UserRole
    from app.models.rule import RuleAction
    from app.models.command import CommandStatus
    print("✓ Enums")
    
    # Test services without database operations
    import app.services.user_service as user_svc
    import app.services.rule_service as rule_svc
    import app.services.command_service as cmd_svc
    import app.services.audit_service as audit_svc
    print("✓ Service modules")
    
    from app.middleware import get_current_user, require_admin
    print("✓ Middleware")
    
    from app.routes import auth_router, users_router, rules_router, commands_router, audit_router
    print("✓ API routes")
    
    from main import app
    print("✓ FastAPI application")
    
    print()
    print("=" * 60)
    print("✅ ALL IMPORTS SUCCESSFUL!")
    print("=" * 60)
    print()
    print("Backend structure is correct and ready for testing.")
    print()
    print("Next steps:")
    print("1. Configure Supabase in .env file")
    print("2. Run SQL migration in Supabase")
    print("3. Start the server: python main.py")
    print()
    
except Exception as e:
    print()
    print("=" * 60)
    print("❌ IMPORT ERROR")
    print("=" * 60)
    print(f"Error: {str(e)}")
    print()
    import traceback
    traceback.print_exc()
    sys.exit(1)
