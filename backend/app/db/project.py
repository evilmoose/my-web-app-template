from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from fastapi import Depends
from sqlalchemy import select

from app.models.project import Project as ProjectModel, OnboardingForm, Proposal
from app.schemas.project import ProjectCreate, ProjectUpdate, OnboardingFormCreate, ProposalCreate
from app.core.db import get_db

class ProjectCRUD:
    @staticmethod
    async def get(db, project_id: int) -> Optional[ProjectModel]:
        result = await db.execute(
            select(ProjectModel).filter(ProjectModel.id == project_id)
        )
        return result.scalars().first()

    @staticmethod
    async def get_multi(db, user_id: int, skip: int = 0, limit: int = 100) -> List[ProjectModel]:
        result = await db.execute(
            select(ProjectModel)
            .filter(ProjectModel.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def create(db, user_id: int, project_in: ProjectCreate) -> ProjectModel:
        project = ProjectModel(
            user_id=user_id,
            name=project_in.name,
            description=project_in.description
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def update(db, project_id: int, project_in: ProjectUpdate) -> Optional[ProjectModel]:
        project = await ProjectCRUD.get(db, project_id)
        if not project:
            return None
        
        update_data = project_in.dict(exclude_unset=True)
        
        # Handle onboarding_data separately if it exists
        if "onboarding_data" in update_data and update_data["onboarding_data"]:
            # Create or update OnboardingForm
            onboarding_form = OnboardingForm(
                project_id=project_id,
                form_data=update_data["onboarding_data"],
                processing_status="completed"
            )
            db.add(onboarding_form)
            # Remove from update_data as it's handled separately
            del update_data["onboarding_data"]
        
        # Handle proposal separately if it exists
        if "proposal" in update_data and update_data["proposal"]:
            # Create a new proposal version
            proposal = Proposal(
                project_id=project_id,
                content=update_data["proposal"],
                version=await ProjectCRUD._get_next_proposal_version(db, project_id)
            )
            db.add(proposal)
            # Remove from update_data as it's handled separately
            del update_data["proposal"]
        
        # Update the project with remaining fields
        for key, value in update_data.items():
            setattr(project, key, value)
        
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete(db, project_id: int) -> bool:
        project = await ProjectCRUD.get(db, project_id)
        if not project:
            return False
        await db.delete(project)
        await db.commit()
        return True
    
    @staticmethod
    async def _get_next_proposal_version(db, project_id: int) -> int:
        """Get the next version number for a proposal"""
        result = await db.execute(
            select(Proposal)
            .filter(Proposal.project_id == project_id)
            .order_by(Proposal.version.desc())
        )
        latest_proposal = result.scalars().first()
        
        if latest_proposal:
            return latest_proposal.version + 1
        return 1
    
    @staticmethod
    async def get_latest_proposal(db, project_id: int) -> Optional[Proposal]:
        """Get the latest proposal for a project"""
        result = await db.execute(
            select(Proposal)
            .filter(Proposal.project_id == project_id)
            .order_by(Proposal.version.desc())
        )
        return result.scalars().first()
    
    @staticmethod
    async def get_onboarding_data(db, project_id: int) -> Optional[Dict[str, Any]]:
        """Get the latest onboarding form data for a project"""
        result = await db.execute(
            select(OnboardingForm)
            .filter(OnboardingForm.project_id == project_id)
            .order_by(OnboardingForm.submitted_at.desc())
        )
        onboarding_form = result.scalars().first()
        
        if onboarding_form:
            return onboarding_form.form_data
        return None

    # Onboarding Form CRUD operations
    @staticmethod
    async def create_onboarding_form(db, form: OnboardingFormCreate) -> OnboardingForm:
        db_form = OnboardingForm(
            project_id=form.project_id,
            form_data=form.form_data,
            file_path=form.file_path
        )
        db.add(db_form)
        await db.commit()
        await db.refresh(db_form)
        return db_form

    @staticmethod
    async def get_onboarding_form(db, form_id: int) -> Optional[OnboardingForm]:
        result = await db.execute(
            select(OnboardingForm).filter(OnboardingForm.id == form_id)
        )
        return result.scalars().first()

    @staticmethod
    async def get_onboarding_forms_by_project(db, project_id: int) -> List[OnboardingForm]:
        result = await db.execute(
            select(OnboardingForm).filter(OnboardingForm.project_id == project_id)
        )
        return result.scalars().all()

    @staticmethod
    async def update_onboarding_form(db, form_id: int, form_data: Dict[str, Any]) -> Optional[OnboardingForm]:
        db_form = await ProjectCRUD.get_onboarding_form(db, form_id)
        if db_form:
            for key, value in form_data.items():
                setattr(db_form, key, value)
            await db.commit()
            await db.refresh(db_form)
        return db_form

    # Proposal CRUD operations
    @staticmethod
    async def create_proposal(db, proposal: ProposalCreate) -> Proposal:
        # Get the latest version for this project
        result = await db.execute(
            select(Proposal)
            .filter(Proposal.project_id == proposal.project_id)
            .order_by(Proposal.version.desc())
        )
        latest_version = result.scalars().first()
        
        version = 1
        if latest_version:
            version = latest_version.version + 1
        
        db_proposal = Proposal(
            project_id=proposal.project_id,
            content=proposal.content,
            version=version
        )
        db.add(db_proposal)
        await db.commit()
        await db.refresh(db_proposal)
        return db_proposal

    @staticmethod
    async def get_proposal(db, proposal_id: int) -> Optional[Proposal]:
        result = await db.execute(
            select(Proposal).filter(Proposal.id == proposal_id)
        )
        return result.scalars().first()

    @staticmethod
    async def get_proposals_by_project(db, project_id: int) -> List[Proposal]:
        result = await db.execute(
            select(Proposal)
            .filter(Proposal.project_id == project_id)
            .order_by(Proposal.version.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def update_proposal(db, proposal_id: int, content: str) -> Optional[Proposal]:
        db_proposal = await ProjectCRUD.get_proposal(db, proposal_id)
        if db_proposal:
            db_proposal.content = content
            await db.commit()
            await db.refresh(db_proposal)
        return db_proposal