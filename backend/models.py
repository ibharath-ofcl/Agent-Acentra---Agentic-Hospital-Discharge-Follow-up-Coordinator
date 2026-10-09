from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Text, Date, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(50)) # 'doctor' | 'patient'
    name = Column(String(255))
    
    patient = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String(100), primary_key=True) # MRN / custom ID
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    email = Column(String(255), nullable=True)
    dob = Column(String(50))
    gender = Column(String(50))
    primary_diagnosis = Column(String(255))
    admission_date = Column(String(50))
    discharge_date = Column(String(50))
    attending_physician = Column(String(255))
    contact_phone = Column(String(50))
    preferred_language = Column(String(50), default="English")
    priority_level = Column(String(50), default="routine") # immediate-review, high-priority, routine
    email_consent = Column(Boolean, default=True)
    sms_consent = Column(Boolean, default=True)
    age = Column(Integer, nullable=True)
    blood_group = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    department = Column(String(100), nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


    user = relationship("User", back_populates="patient")
    tasks = relationship("FollowUpTask", back_populates="patient")
    documents = relationship("DischargeDocument", back_populates="patient")
    timeline = relationship("TimelineEvent", back_populates="patient")
    issues = relationship("NeedsReviewIssue", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    required_tests = relationship("RequiredTest", back_populates="patient")
    notifications = relationship("NotificationLog", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String(100), primary_key=True) # e.g. APT-RAVI-001
    patient_id = Column(String(100), ForeignKey("patients.id"))
    appointment_date = Column(Date, nullable=False) # e.g. 2026-10-15
    time_str = Column(String(50), default="10:30 AM")
    doctor_name = Column(String(255), default="Dr. Rajesh Mehta")
    department = Column(String(100), default="Cardiology")
    location = Column(String(255), default="Suite 204 • Heart Center")
    status = Column(String(50), default="scheduled") # scheduled, attended, no_show, cancelled, completed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    required_tests = relationship("RequiredTest", back_populates="appointment")
    notifications = relationship("NotificationLog", back_populates="appointment")

class RequiredTest(Base):
    __tablename__ = "required_tests"
    id = Column(String(100), primary_key=True) # e.g. TEST-RAVI-001
    appointment_id = Column(String(100), ForeignKey("appointments.id"))
    patient_id = Column(String(100), ForeignKey("patients.id"))
    test_name = Column(String(255)) # e.g. Blood Test (Fasting Lipid & Renal Panel)
    due_date = Column(Date, nullable=True) # e.g. 2026-10-14
    status = Column(String(50), default="pending") # pending, in-progress, completed, cancelled
    completed_at = Column(DateTime, nullable=True)
    source_doc = Column(String(255), default="Discharge Summary • Page 3")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    appointment = relationship("Appointment", back_populates="required_tests")
    patient = relationship("Patient", back_populates="required_tests")

class NotificationLog(Base):
    __tablename__ = "notification_logs"
    id = Column(String(100), primary_key=True) # e.g. NOTIF-uuid
    patient_id = Column(String(100), ForeignKey("patients.id"))
    appointment_id = Column(String(100), ForeignKey("appointments.id"), nullable=True)
    test_id = Column(String(100), ForeignKey("required_tests.id"), nullable=True)
    scenario = Column(String(100)) # test_missing_early, test_missing_urgent, staff_missing_test, test_missing_final, appointment_reminder, appointment_morning, skipped_test_today, missed_appointment
    channel = Column(String(50)) # email, sms, staff_alert
    status = Column(String(50)) # sent, simulated, skipped, failed
    subject = Column(String(255), nullable=True)
    message = Column(Text)
    provider_message_id = Column(String(255), nullable=True)
    error_message = Column(String(255), nullable=True)
    ai_generation_mode = Column(String(100), default="gemini_ai") # gemini_ai, fallback_template, dlt_template, staff_template
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(50), nullable=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_demo = Column(Boolean, default=True)
    simulation_date = Column(String(50), nullable=True) # e.g. 2026-10-08

    patient = relationship("Patient", back_populates="notifications")
    appointment = relationship("Appointment", back_populates="notifications")

class SMSTemplate(Base):
    __tablename__ = "sms_templates"
    id = Column(String(100), primary_key=True) # e.g. DLT-CF-001
    dlt_template_id = Column(String(100), unique=True)
    scenario = Column(String(100))
    language = Column(String(50), default="English")
    template_text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AutomationState(Base):
    __tablename__ = "automation_state"
    id = Column(Integer, primary_key=True)
    simulation_date = Column(String(50), default="2026-10-08")
    is_running = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    last_run_summary = Column(Text, nullable=True)
    timezone = Column(String(50), default="Asia/Kolkata")
    next_scheduled_run = Column(String(50), default="09:00 AM IST")

class FollowUpTask(Base):
    __tablename__ = "followup_tasks"
    id = Column(String(100), primary_key=True)
    patient_id = Column(String(100), ForeignKey("patients.id"))
    title = Column(String(255))
    due_date = Column(String(50))
    status = Column(String(50)) # pending, in-progress, completed, overdue, needs-review
    task_type = Column(String(50)) # appointment, test, care-instruction, referral
    specialty = Column(String(100), nullable=True)
    attending = Column(String(255), nullable=True)
    source = Column(String(255), nullable=True)
    source_page = Column(Integer, nullable=True)
    days_overdue = Column(Integer, nullable=True) # for overdue items

    patient = relationship("Patient", back_populates="tasks")

class DischargeDocument(Base):
    __tablename__ = "discharge_documents"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(100), ForeignKey("patients.id"), nullable=True) # null if manual review needed
    original_filename = Column(String(255))
    file_path = Column(String(500))
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50)) # processed, pending, needs-manual-review
    needs_review = Column(Boolean, default=False)
    review_reason = Column(String(255), nullable=True)

    patient = relationship("Patient", back_populates="documents")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(String(100), primary_key=True)
    patient_id = Column(String(100), ForeignKey("patients.id"))
    date_str = Column(String(50))
    title = Column(String(255))
    description = Column(Text)
    status = Column(String(50)) # pending, in-progress, completed, missed
    event_type = Column(String(50)) # appointment, medication, instruction, communication, notification

    patient = relationship("Patient", back_populates="timeline")

class NeedsReviewIssue(Base):
    __tablename__ = "needs_review_issues"
    id = Column(String(100), primary_key=True)
    patient_id = Column(String(100), ForeignKey("patients.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("discharge_documents.id"), nullable=True)
    category = Column(String(100)) # medication-reconciliation, scheduling-conflict, missing-date
    issue = Column(String(255))
    extracted_text = Column(Text)
    flag_reason = Column(String(255))
    source = Column(String(255))
    page = Column(Integer)
    status = Column(String(50)) # active, resolved

    patient = relationship("Patient", back_populates="issues")

class DischargeExtraction(Base):
    __tablename__ = "discharge_extractions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("discharge_documents.id"))
    patient_id = Column(String(100), ForeignKey("patients.id"), nullable=True)
    structured_data = Column(Text, nullable=True) # JSON string
    needs_review = Column(Boolean, default=False)
    
    document = relationship("DischargeDocument")
    patient = relationship("Patient")
