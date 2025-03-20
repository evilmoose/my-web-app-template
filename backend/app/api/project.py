from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json

from app.core.db import get_db
from app.models.user import User
from app.api.users import current_active_user
from app.schemas.project import (
    Project, ProjectCreate, ProjectUpdate,
    OnboardingForm, OnboardingFormCreate,
    Proposal, ProposalCreate
)
from app.db.project import ProjectCRUD
from app.services.ai_service import AIService
from app.services.file_service import FileService

router = APIRouter()
ai_service = AIService()
file_service = FileService()

# Project endpoints
@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    return await ProjectCRUD.create(db=db, user_id=current_user.id, project_in=project_data)

@router.get("/", response_model=List[Project])
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    return await ProjectCRUD.get_multi(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return db_project

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    return await ProjectCRUD.update(db=db, project_id=project_id, project_in=project_update)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    success = await ProjectCRUD.delete(db=db, project_id=project_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete project")
    return None

# Onboarding form endpoints
@router.post("/{project_id}/onboarding", response_model=OnboardingForm)
async def create_onboarding_form(
    project_id: int,
    form_data: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    # Check if project exists and belongs to user
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Parse form data
    try:
        parsed_form_data = json.loads(form_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid form data format")
    
    # Save file if provided
    file_path = None
    if file:
        file_path = await file_service.save_upload(file, project_id)
    
    # Create onboarding form
    form_create = OnboardingFormCreate(
        project_id=project_id,
        form_data=parsed_form_data,
        file_path=file_path
    )
    db_form = await ProjectCRUD.create_onboarding_form(db=db, form=form_create)
    
    # Process file if provided
    if file_path and file_path.endswith('.pdf'):
        # Extract data from PDF
        extracted_data = ai_service.extract_data_from_pdf(file_path)
        
        # Update form with extracted data
        db_form = await ProjectCRUD.update_onboarding_form(
            db=db, 
            form_id=db_form.id, 
            form_data={
                "extracted_data": extracted_data,
                "processing_status": "completed"
            }
        )
    
    # Index data for RAG
    combined_data = {**parsed_form_data}
    if hasattr(db_form, 'extracted_data') and db_form.extracted_data:
        combined_data.update(db_form.extracted_data)
    
    ai_service.index_project_data(project_id, combined_data)
    
    return db_form

@router.get("/{project_id}/onboarding", response_model=List[OnboardingForm])
async def read_onboarding_forms(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    # Check if project exists and belongs to user
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    return await ProjectCRUD.get_onboarding_forms_by_project(db=db, project_id=project_id)

# Proposal endpoints
@router.post("/{project_id}/proposals", response_model=Proposal)
async def create_proposal(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    # Check if project exists and belongs to user
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Get the latest onboarding form
    forms = await ProjectCRUD.get_onboarding_forms_by_project(db=db, project_id=project_id)
    if not forms:
        raise HTTPException(status_code=400, detail="No onboarding form found for this project")
    
    latest_form = forms[-1]  # Assuming forms are returned in chronological order
    
    # Generate proposal using AI
    form_data = latest_form.form_data
    if hasattr(latest_form, 'extracted_data') and latest_form.extracted_data:
        form_data.update(latest_form.extracted_data)
    
    proposal_content = ai_service.generate_proposal(project_id, form_data)
    
    # Create proposal
    proposal_create = ProposalCreate(
        project_id=project_id,
        content=proposal_content
    )
    
    return await ProjectCRUD.create_proposal(db=db, proposal=proposal_create)

@router.get("/{project_id}/proposals", response_model=List[Proposal])
async def read_proposals(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    # Check if project exists and belongs to user
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    return await ProjectCRUD.get_proposals_by_project(db=db, project_id=project_id)

@router.put("/{project_id}/proposals/{proposal_id}", response_model=Proposal)
async def update_proposal(
    project_id: int,
    proposal_id: int,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(current_active_user)
):
    # Check if project exists and belongs to user
    db_project = await ProjectCRUD.get(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Check if proposal exists and belongs to project
    db_proposal = await ProjectCRUD.get_proposal(db=db, proposal_id=proposal_id)
    if db_proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if db_proposal.project_id != project_id:
        raise HTTPException(status_code=400, detail="Proposal does not belong to this project")
    
    return await ProjectCRUD.update_proposal(db=db, proposal_id=proposal_id, content=content)