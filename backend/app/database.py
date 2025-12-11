from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Client for regular operations (respects RLS)
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Service role client for admin operations (bypasses RLS)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
