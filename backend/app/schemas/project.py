from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class Project(ProjectBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class OnboardingFormBase(BaseModel):
    form_data: Dict[str, Any]
    
class OnboardingFormCreate(OnboardingFormBase):
    project_id: int
    file_path: Optional[str] = None

class OnboardingFormUpdate(BaseModel):
    form_data: Optional[Dict[str, Any]] = None
    processing_status: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None

class OnboardingForm(OnboardingFormBase):
    id: int
    project_id: int
    submitted_at: datetime
    processing_status: str
    file_path: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class ProposalBase(BaseModel):
    content: str
    
class ProposalCreate(ProposalBase):
    project_id: int
    version: Optional[int] = 1

class ProposalUpdate(BaseModel):
    content: Optional[str] = None
    version: Optional[int] = None

class Proposal(ProposalBase):
    id: int
    project_id: int
    version: int
    created_at: datetime
    
    class Config:
        from_attributes = True