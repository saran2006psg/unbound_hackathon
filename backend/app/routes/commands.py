from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import User, CommandSubmit, CommandResponse
from app.middleware import get_current_user
from app.services import CommandService

router = APIRouter(prefix="/api/commands", tags=["commands"])


@router.post("", response_model=CommandResponse)
async def submit_command(command: CommandSubmit, current_user: User = Depends(get_current_user)):
    """Submit a command for processing"""
    try:
        result = CommandService.process_command(current_user.id, command.command_text)
        return CommandResponse(
            id=result["id"],
            command_text=command.command_text,
            status=result["status"],
            action=result.get("action"),
            result_message=result["result_message"],
            new_balance=result.get("new_balance"),
            created_at=result["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history", response_model=List[CommandResponse])
async def get_command_history(current_user: User = Depends(get_current_user)):
    """Get command history for current user"""
    commands = CommandService.get_user_commands(current_user.id)
    return [
        CommandResponse(
            id=cmd.id,
            command_text=cmd.command_text,
            status=cmd.status.value,
            action=cmd.action,
            result_message=cmd.result_message,
            new_balance=None,
            created_at=cmd.created_at.isoformat() if cmd.created_at else ""
        )
        for cmd in commands
    ]
