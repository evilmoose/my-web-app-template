"""
API endpoints for file uploads.
"""

import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import JSONResponse
import aiofiles

from app.core.config import settings
from app.models.user import User
from app.api.users import current_active_user, is_admin

# Create router
router = APIRouter()

# Define upload directory
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Define allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
    is_admin_user: bool = Depends(is_admin),
):
    """
    Upload a file to the server.
    
    Only authenticated users can upload files, and only admins can upload files for blog posts.
    """
    if not is_admin_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can upload files"
        )
    
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Generate URL
    # Use the base URL from the request to construct a full URL
    base_url = str(request.base_url).rstrip('/')
    file_url = f"/uploads/{unique_filename}"
    full_url = f"{base_url}{file_url}"
    
    return {"url": file_url, "full_url": full_url}

@router.get("/test", status_code=status.HTTP_200_OK)
async def test_upload_access(request: Request):
    """
    Test endpoint to check if uploads are accessible.
    """
    base_url = str(request.base_url).rstrip('/')
    test_url = f"{base_url}/uploads/test.txt"
    
    # Create a test file if it doesn't exist
    test_file_path = os.path.join(UPLOAD_DIR, "test.txt")
    if not os.path.exists(test_file_path):
        try:
            with open(test_file_path, 'w') as f:
                f.write("This is a test file to check if uploads are accessible.")
        except Exception as e:
            return {
                "status": "error",
                "message": f"Could not create test file: {str(e)}",
                "upload_dir": UPLOAD_DIR,
                "exists": os.path.exists(UPLOAD_DIR),
                "writable": os.access(UPLOAD_DIR, os.W_OK)
            }
    
    return {
        "status": "success",
        "message": "Upload directory is accessible",
        "test_url": test_url,
        "upload_dir": UPLOAD_DIR,
        "exists": os.path.exists(UPLOAD_DIR),
        "writable": os.access(UPLOAD_DIR, os.W_OK)
    } 