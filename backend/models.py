from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Text, Date, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'doctor' | 'patient'
    name = Column(String)
    
    patient = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True) # MRN / custom ID
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    dob = Column(String)
    gender = Column(String)
    primary_diagnosis = Column(String)
    admission_date = Column(String)
    discharge_date = Column(String)
    attending_physician = Column(String)
    contact_phone = Column(String)
    preferred_language = Column(String)
    priority_level = Column(String) # immediate-review, high-priority, routine

    user = relationship("User", back_populates="patient")
    tasks = relationship("FollowUpTask", back_populates="patient")
    documents = relationship("DischargeDocument", back_populates="patient")
    timeline = relationship("TimelineEvent", back_populates="patient")
    issues = relationship("NeedsReviewIssue", back_populates="patient")

class FollowUpTask(Base):
    __tablename__ = "followup_tasks"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    title = Column(String)
    due_date = Column(String)
    status = Column(String) # pending, in-progress, completed, overdue, needs-review
    task_type = Column(String) # appointment, test, care-instruction, referral
    specialty = Column(String, nullable=True)
    attending = Column(String, nullable=True)
    source = Column(String, nullable=True)
    source_page = Column(Integer, nullable=True)
    days_overdue = Column(Integer, nullable=True) # for overdue items

    patient = relationship("Patient", back_populates="tasks")

class DischargeDocument(Base):
    __tablename__ = "discharge_documents"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True) # null if manual review needed
    original_filename = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String) # processed, pending, needs-manual-review
    needs_review = Column(Boolean, default=False)
    review_reason = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="documents")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    date_str = Column(String)
    title = Column(String)
    description = Column(String)
    status = Column(String) # pending, in-progress, completed, missed
    event_type = Column(String) # appointment, medication, instruction, communication

    patient = relationship("Patient", back_populates="timeline")

class NeedsReviewIssue(Base):
    __tablename__ = "needs_review_issues"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("discharge_documents.id"), nullable=True)
    category = Column(String) # medication-reconciliation, scheduling-conflict, missing-date
    issue = Column(String)
    extracted_text = Column(String)
    flag_reason = Column(String)
    source = Column(String)
    page = Column(Integer)
    status = Column(String) # active, resolved

    patient = relationship("Patient", back_populates="issues")

class DischargeExtraction(Base):
    __tablename__ = "discharge_extractions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("discharge_documents.id"))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    structured_data = Column(String, nullable=True) # JSON string
    needs_review = Column(Boolean, default=False)
    
    document = relationship("DischargeDocument")
    patient = relationship("Patient")
