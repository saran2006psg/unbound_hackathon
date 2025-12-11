import secrets
from typing import List, Optional
from app.database import supabase_admin
from app.models import User, UserCreate, UserRole


class UserService:
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key"""
        return f"cgw_{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def create_user(user_create: UserCreate) -> User:
        """Create a new user with generated API key"""
        api_key = UserService.generate_api_key()
        
        user_data = {
            "name": user_create.name,
            "api_key": api_key,
            "role": user_create.role.value,
            "credits": user_create.credits
        }
        
        response = supabase_admin.table("users").insert(user_data).execute()
        
        if not response.data:
            raise Exception("Failed to create user")
        
        return User(**response.data[0])
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """Get user by ID"""
        response = supabase_admin.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            return None
        
        return User(**response.data[0])
    
    @staticmethod
    def get_all_users() -> List[User]:
        """Get all users"""
        response = supabase_admin.table("users").select("*").execute()
        return [User(**user) for user in response.data]
    
    @staticmethod
    def update_credits(user_id: int, credits: int) -> User:
        """Update user credits"""
        response = supabase_admin.table("users").update({"credits": credits}).eq("id", user_id).execute()
        
        if not response.data:
            raise Exception("Failed to update credits")
        
        return User(**response.data[0])
    
    @staticmethod
    def deduct_credit(user_id: int) -> int:
        """Deduct one credit from user and return new balance"""
        user = UserService.get_user_by_id(user_id)
        if not user:
            raise Exception("User not found")
        
        if user.credits <= 0:
            raise Exception("Insufficient credits")
        
        new_credits = user.credits - 1
        updated_user = UserService.update_credits(user_id, new_credits)
        return updated_user.credits
