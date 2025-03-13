from fastapi import APIRouter, Depends, HTTPException, status, Request
import asyncio
from app.services.discord import DiscordService
from app.core.config import settings
from pydantic import BaseModel
from app.api.users import current_superuser, optional_current_user
from app.models.user import User
from typing import List, Dict, Any, Union, Optional

router = APIRouter()

class MessageResponse(BaseModel):
    id: str
    author: str
    content: str

class MessagesResponse(BaseModel):
    messages: List[MessageResponse]

class ErrorResponse(BaseModel):
    error: str

@router.get("/messages", response_model=Union[MessagesResponse, ErrorResponse])
async def get_messages(limit: int = 5, user: Optional[User] = Depends(optional_current_user)):
    """
    Get messages from the Discord blog channel.
    This endpoint is public but will provide additional data for authenticated users in the future.
    """
    result = await DiscordService.fetch_messages(settings.DISCORD_BLOG_CHANNEL_ID, limit)
    
    # Check if result is an error
    if isinstance(result, dict) and "error" in result:
        return result
    
    # If it's a list of messages, return in the expected format
    if isinstance(result, list):
        return {"messages": result}
    
    # Fallback for unexpected response
    return {"error": "Unexpected response format from Discord service"}

class BlogPost(BaseModel):
    content: str

@router.post("/post")
async def post_message(post: BlogPost, user: User = Depends(current_superuser)):
    """
    Post a message to the Discord blog channel.
    Only superusers (admins) can post messages.
    """
    return await DiscordService.send_message(settings.DISCORD_BLOG_CHANNEL_ID, post.content)
