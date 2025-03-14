from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.db import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="projects")
    onboarding_forms = relationship("OnboardingForm", back_populates="project", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="project", cascade="all, delete-orphan")

class OnboardingForm(Base):
    __tablename__ = "onboarding_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    form_data = Column(JSON, nullable=False)
    file_path = Column(String(255))
    processing_status = Column(String(50), default="pending")
    extracted_data = Column(JSON)
    submitted_at = Column(DateTime, default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="onboarding_forms")

class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="proposals")