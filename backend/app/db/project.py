from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from fastapi import Depends

from app.models.project import Project as ProjectModel, OnboardingForm, Proposal
from app.schemas.project import ProjectCreate, ProjectUpdate, OnboardingFormCreate, ProposalCreate
from app.core.db import get_db

class ProjectCRUD:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get(self, project_id: int) -> Optional[ProjectModel]:
        return self.db.query(ProjectModel).filter(ProjectModel.id == project_id).first()

    def get_multi(self, user_id: int, skip: int = 0, limit: int = 100) -> List[ProjectModel]:
        return self.db.query(ProjectModel).filter(ProjectModel.user_id == user_id).offset(skip).limit(limit).all()

    def create(self, user_id: int, project_in: ProjectCreate) -> ProjectModel:
        project = ProjectModel(
            user_id=user_id,
            name=project_in.name,
            description=project_in.description
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project_id: int, project_in: ProjectUpdate) -> Optional[ProjectModel]:
        project = self.get(project_id)
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
            self.db.add(onboarding_form)
            # Remove from update_data as it's handled separately
            del update_data["onboarding_data"]
        
        # Handle proposal separately if it exists
        if "proposal" in update_data and update_data["proposal"]:
            # Create a new proposal version
            proposal = Proposal(
                project_id=project_id,
                content=update_data["proposal"],
                version=self._get_next_proposal_version(project_id)
            )
            self.db.add(proposal)
            # Remove from update_data as it's handled separately
            del update_data["proposal"]
        
        # Update the project with remaining fields
        for key, value in update_data.items():
            setattr(project, key, value)
        
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: int) -> bool:
        project = self.get(project_id)
        if not project:
            return False
        self.db.delete(project)
        self.db.commit()
        return True
    
    def _get_next_proposal_version(self, project_id: int) -> int:
        """Get the next version number for a proposal"""
        latest_proposal = self.db.query(Proposal).filter(
            Proposal.project_id == project_id
        ).order_by(Proposal.version.desc()).first()
        
        if latest_proposal:
            return latest_proposal.version + 1
        return 1
    
    def get_latest_proposal(self, project_id: int) -> Optional[Proposal]:
        """Get the latest proposal for a project"""
        return self.db.query(Proposal).filter(
            Proposal.project_id == project_id
        ).order_by(Proposal.version.desc()).first()
    
    def get_onboarding_data(self, project_id: int) -> Optional[Dict[str, Any]]:
        """Get the latest onboarding form data for a project"""
        onboarding_form = self.db.query(OnboardingForm).filter(
            OnboardingForm.project_id == project_id
        ).order_by(OnboardingForm.submitted_at.desc()).first()
        
        if onboarding_form:
            return onboarding_form.form_data
        return None

    # Onboarding Form CRUD operations
    @staticmethod
    def create_onboarding_form(db: Session, form: OnboardingFormCreate) -> OnboardingForm:
        db_form = OnboardingForm(
            project_id=form.project_id,
            form_data=form.form_data,
            file_path=form.file_path
        )
        db.add(db_form)
        db.commit()
        db.refresh(db_form)
        return db_form

    @staticmethod
    def get_onboarding_form(db: Session, form_id: int) -> Optional[OnboardingForm]:
        return db.query(OnboardingForm).filter(OnboardingForm.id == form_id).first()

    @staticmethod
    def get_onboarding_forms_by_project(db: Session, project_id: int) -> List[OnboardingForm]:
        return db.query(OnboardingForm).filter(OnboardingForm.project_id == project_id).all()

    @staticmethod
    def update_onboarding_form(db: Session, form_id: int, form_data: Dict[str, Any]) -> Optional[OnboardingForm]:
        db_form = ProjectCRUD.get_onboarding_form(db, form_id)
        if db_form:
            for key, value in form_data.items():
                setattr(db_form, key, value)
            db.commit()
            db.refresh(db_form)
        return db_form

    # Proposal CRUD operations
    @staticmethod
    def create_proposal(db: Session, proposal: ProposalCreate) -> Proposal:
        # Get the latest version for this project
        latest_version = db.query(Proposal).filter(
            Proposal.project_id == proposal.project_id
        ).order_by(Proposal.version.desc()).first()
        
        version = 1
        if latest_version:
            version = latest_version.version + 1
        
        db_proposal = Proposal(
            project_id=proposal.project_id,
            content=proposal.content,
            version=version
        )
        db.add(db_proposal)
        db.commit()
        db.refresh(db_proposal)
        return db_proposal

    @staticmethod
    def get_proposal(db: Session, proposal_id: int) -> Optional[Proposal]:
        return db.query(Proposal).filter(Proposal.id == proposal_id).first()

    @staticmethod
    def get_proposals_by_project(db: Session, project_id: int) -> List[Proposal]:
        return db.query(Proposal).filter(Proposal.project_id == project_id).order_by(Proposal.version.desc()).all()

    @staticmethod
    def update_proposal(db: Session, proposal_id: int, content: str) -> Optional[Proposal]:
        db_proposal = ProjectCRUD.get_proposal(db, proposal_id)
        if db_proposal:
            db_proposal.content = content
            db.commit()
            db.refresh(db_proposal)
        return db_proposal

# Create an instance of the ProjectCRUD class
project = ProjectCRUD()