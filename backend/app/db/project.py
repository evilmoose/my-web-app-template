from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.models.project import Project as ProjectModel, OnboardingForm, Proposal
from app.schemas.project import ProjectCreate, ProjectUpdate, OnboardingFormCreate, ProposalCreate

class ProjectCRUD:
    @staticmethod
    def create_project(db: Session, project: ProjectCreate, user_id: int) -> ProjectModel:
        db_project = ProjectModel(
            user_id=user_id,
            name=project.name,
            description=project.description
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def get_project(db: Session, project_id: int) -> Optional[ProjectModel]:
        return db.query(ProjectModel).filter(ProjectModel.id == project_id).first()

    @staticmethod
    def get_projects_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[ProjectModel]:
        return db.query(ProjectModel).filter(ProjectModel.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def update_project(db: Session, project_id: int, project_update: ProjectUpdate) -> Optional[ProjectModel]:
        db_project = ProjectCRUD.get_project(db, project_id)
        if db_project:
            update_data = project_update.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_project, key, value)
            db.commit()
            db.refresh(db_project)
        return db_project

    @staticmethod
    def delete_project(db: Session, project_id: int) -> bool:
        db_project = ProjectCRUD.get_project(db, project_id)
        if db_project:
            db.delete(db_project)
            db.commit()
            return True
        return False

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