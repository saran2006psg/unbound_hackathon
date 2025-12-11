from fastapi import Header, HTTPException, Depends
from typing import Optional
from app.database import supabase_admin
from app.models import User, UserRole


async def get_current_user(x_api_key: Optional[str] = Header(None)) -> User:
    """Authenticate user via API key"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required")
    
    try:
        # Query user by API key
        response = supabase_admin.table("users").select("*").eq("api_key", x_api_key).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid API key")
        
        user_data = response.data[0]
        return User(**user_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
