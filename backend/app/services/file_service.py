import os
import shutil
from fastapi import UploadFile
from typing import Optional
import uuid

class FileService:
    def __init__(self):
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_upload(self, file: UploadFile, project_id: int) -> Optional[str]:
        """Save an uploaded file and return the file path"""
        if not file:
            return None
        
        # Create project directory if it doesn't exist
        project_dir = os.path.join(self.upload_dir, f"project_{project_id}")
        os.makedirs(project_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(project_dir, unique_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return file_path