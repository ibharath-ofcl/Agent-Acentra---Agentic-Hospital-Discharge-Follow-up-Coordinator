from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
import os
import shutil
import datetime
import uuid
from pydantic import BaseModel

import models
import document_parser
import extraction_service

from database import engine, get_db, Base
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from services.automation_service import (
    run_automation_pipeline,
    reset_demo_state,
    get_or_create_automation_state,
    get_current_date
)
from services.scheduler import start_scheduler, shutdown_scheduler

app = FastAPI(title="CareFlow AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def on_startup():
    try:
        start_scheduler()
    except Exception as e:
        print(f"Notice: APScheduler startup notice: {e}")

@app.on_event("shutdown")
def on_shutdown():
    try:
        shutdown_scheduler()
    except Exception as e:
        pass

@app.get("/")
def root():
    return {"status": "ok", "service": "CareFlow AI Backend API", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "database": "connected", "service": "CareFlow AI"}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    
    # 1. Look up user by email or role keyword
    if email_clean in ["doctor", "doc", "meera", "admin", "coord", "coordinator", "doctor@careflow.ai", "doctor@acentra.com"]:
        user = db.query(models.User).filter(models.User.role == "doctor").first()
    elif email_clean in ["patient", "ravi", "arun", "demo", "patient@careflow.ai", "ravi@example.com"]:
        user = db.query(models.User).filter(models.User.role == "patient").first()
    else:
        user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
        if not user:
            # Fallback check by name or ID
            user = db.query(models.User).filter(func.lower(models.User.name).contains(email_clean)).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Allow demo passwords or standard hash verification
    valid_passwords = ["password", "doctor123", "patient123", "demo123", "careflow123", "admin123"]
    if req.password not in valid_passwords and not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(user.id)})
    
    patient_id = user.patient.id if user.patient else None
    
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "role": user.role, 
        "name": user.name,
        "patient_id": patient_id
    }

@app.get("/api/auth/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    patient_id = current_user.patient.id if current_user.patient else None
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "name": current_user.name,
        "patient_id": patient_id
    }

# ======================= CAREFLOW PATIENT REMINDER AUTOMATION MODULE =======================

class RunAutomationRequest(BaseModel):
    simulationDate: Optional[str] = None
    isDemo: bool = True
    bypassHoursCheck: bool = True

@app.post("/api/automation/run")
def api_run_automation(req: RunAutomationRequest = RunAutomationRequest(), db: Session = Depends(get_db)):
    """
    Executes the deterministic CareFlow Care Plan Automation Engine.
    Used by the Staff Dashboard / Jury Demo to run on-demand or with a simulated date.
    """
    try:
        result = run_automation_pipeline(
            db=db,
            simulation_date_str=req.simulationDate,
            is_demo=req.isDemo,
            bypass_hours_check=req.bypassHoursCheck
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Automation execution error: {str(e)}")

@app.post("/api/demo/reset")
def api_reset_demo(db: Session = Depends(get_db)):
    """
    Resets the jury demo dataset strictly to initial baseline:
    Ravi Kumar -> 15 Oct Appointment (Scheduled), Blood Test (Pending), cleared demo notifications.
    """
    try:
        return reset_demo_state(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo reset failed: {str(e)}")

@app.get("/api/demo/state")
def api_get_demo_state(db: Session = Depends(get_db)):
    """
    Fetches the current live CareFlow demo scenario state, active dates, and care coordination insights.
    """
    state = get_or_create_automation_state(db)
    curr_date = get_current_date(db)
    
    # Get Ravi Kumar's live record
    pat_ravi = db.query(models.Patient).filter(models.Patient.id == "MRN-RAVI-001").first()
    appt_ravi = db.query(models.Appointment).filter(models.Appointment.id == "APT-RAVI-001").first()
    test_ravi = db.query(models.RequiredTest).filter(models.RequiredTest.id == "TEST-RAVI-001").first()

    # Dynamic Care Coordination Insight
    if test_ravi and test_ravi.status == "completed":
        care_insight = {
            "title": "State-Aware Adaptation: Test Verified Complete",
            "previousState": "Required blood test missing (T-7 / T-3 / T-2 active)",
            "currentState": "Blood test completed & archived",
            "automationResponse": "Test-missing reminder workflow automatically STOPPED.",
            "nextAction": "Standard appointment confirmation workflow continued.",
            "ruleInsight": "CareFlow dynamically detected state change and eliminated unnecessary test-chasing notifications."
        }
    else:
        care_insight = {
            "title": "Active Care Plan Monitoring: Pending Diagnostic Dependency",
            "previousState": "Hospital discharge plan initialized",
            "currentState": "Blood test pending before 15 Oct Cardiology evaluation",
            "automationResponse": "Test-missing reminder escalation active according to timeline horizon.",
            "nextAction": "Monitor for patient test completion or care coordinator assistance.",
            "ruleInsight": "If test is completed, CareFlow will instantly stop test-missing alerts and transition to appointment reminders."
        }

    return {
        "simulationDate": state.simulation_date,
        "currentDateFormatted": curr_date.strftime("%d %B %Y"),
        "isRunning": state.is_running,
        "timezone": state.timezone,
        "nextScheduledRun": state.next_scheduled_run,
        "lastRunAt": state.last_run_at.strftime("%d %b %Y, %I:%M %p") if state.last_run_at else "Never",
        "lastRunSummary": state.last_run_summary,
        "patient": {
            "id": pat_ravi.id if pat_ravi else "MRN-RAVI-001",
            "name": pat_ravi.name if pat_ravi else "Ravi Kumar",
            "email": pat_ravi.email if pat_ravi else "ravi@example.com",
            "phone": pat_ravi.contact_phone if pat_ravi else "+919876543210",
            "preferredLanguage": pat_ravi.preferred_language if pat_ravi else "English"
        } if pat_ravi else None,
        "appointment": {
            "id": appt_ravi.id if appt_ravi else "APT-RAVI-001",
            "date": appt_ravi.appointment_date.strftime("%d %B %Y") if appt_ravi else "15 October 2026",
            "doctor": appt_ravi.doctor_name if appt_ravi else "Dr. Rajesh Mehta",
            "department": appt_ravi.department if appt_ravi else "Cardiology",
            "status": appt_ravi.status if appt_ravi else "scheduled"
        } if appt_ravi else None,
        "requiredTest": {
            "id": test_ravi.id if test_ravi else "TEST-RAVI-001",
            "name": test_ravi.test_name if test_ravi else "Blood Test (Fasting Lipid & Renal Panel)",
            "status": test_ravi.status if test_ravi else "pending",
            "dueDate": test_ravi.due_date.strftime("%d %B %Y") if test_ravi and test_ravi.due_date else "14 October 2026",
            "completedAt": test_ravi.completed_at.strftime("%d %b %Y, %I:%M %p") if test_ravi and test_ravi.completed_at else None
        } if test_ravi else None,
        "careInsight": care_insight
    }

@app.get("/api/notifications")
def api_get_notifications(
    channel: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns operational notification dashboard metrics and full event log history.
    """
    query = db.query(models.NotificationLog).order_by(desc(models.NotificationLog.created_at))

    if channel and channel != "all":
        query = query.filter(models.NotificationLog.channel == channel)
    if status and status != "all":
        query = query.filter(models.NotificationLog.status == status)

    all_logs = query.all()
    
    # Filter by search if provided
    if search:
        s = search.lower()
        all_logs = [
            l for l in all_logs
            if (l.subject and s in l.subject.lower()) or
               (l.message and s in l.message.lower()) or
               (l.patient and s in l.patient.name.lower()) or
               (l.scenario and s in l.scenario.lower())
        ]

    total = len(all_logs)
    emails = len([l for l in all_logs if l.channel == "email"])
    sms = len([l for l in all_logs if l.channel == "sms"])
    staff_alerts = len([l for l in all_logs if l.channel == "staff_alert"])
    skipped = len([l for l in all_logs if l.status == "skipped"])
    failed = len([l for l in all_logs if l.status == "failed"])

    items = []
    for l in all_logs:
        items.append({
            "id": l.id,
            "patientId": l.patient_id,
            "patientName": l.patient.name if l.patient else "Patient",
            "scenario": l.scenario,
            "channel": l.channel,
            "status": l.status,
            "subject": l.subject,
            "message": l.message,
            "providerMessageId": l.provider_message_id,
            "errorMessage": l.error_message,
            "aiGenerationMode": l.ai_generation_mode,
            "recipientEmail": l.recipient_email,
            "recipientPhone": l.recipient_phone,
            "sentAt": l.sent_at.strftime("%d %b %Y, %I:%M %p") if l.sent_at else None,
            "simulationDate": l.simulation_date,
            "isDemo": l.is_demo
        })

    return {
        "total": total,
        "emails": emails,
        "sms": sms,
        "staffAlerts": staff_alerts,
        "skipped": skipped,
        "failed": failed,
        "items": items
    }

@app.get("/api/notifications/{notif_id}")
def api_get_notification_detail(notif_id: str, db: Session = Depends(get_db)):
    l = db.query(models.NotificationLog).filter(models.NotificationLog.id == notif_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {
        "id": l.id,
        "patientId": l.patient_id,
        "patientName": l.patient.name if l.patient else "Unknown",
        "scenario": l.scenario,
        "channel": l.channel,
        "status": l.status,
        "subject": l.subject,
        "message": l.message,
        "providerMessageId": l.provider_message_id,
        "errorMessage": l.error_message,
        "aiGenerationMode": l.ai_generation_mode,
        "recipientEmail": l.recipient_email,
        "recipientPhone": l.recipient_phone,
        "sentAt": l.sent_at.strftime("%d %b %Y, %I:%M %p") if l.sent_at else None,
        "createdAt": l.created_at.strftime("%d %b %Y, %I:%M %p") if l.created_at else None,
        "simulationDate": l.simulation_date,
        "isDemo": l.is_demo
    }

@app.put("/api/tests/{test_id}/complete")
@app.post("/api/tests/{test_id}/complete")
def api_complete_test(test_id: str, db: Session = Depends(get_db)):
    """
    Marks a required diagnostic test as completed.
    CareFlow automatically records verified completion and syncs the patient care timeline.
    """
    test = db.query(models.RequiredTest).filter(models.RequiredTest.id == test_id).first()
    if not test:
        # Check if it was matching Ravi's demo test
        test = db.query(models.RequiredTest).filter(models.RequiredTest.id == "TEST-RAVI-001").first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    test.status = "completed"
    test.completed_at = datetime.datetime.utcnow()
    db.commit()

    # Add milestone to patient timeline
    tl = models.TimelineEvent(
        id=f"TL-TEST-COMP-{uuid.uuid4().hex[:6].upper()}",
        patient_id=test.patient_id,
        date_str=datetime.datetime.utcnow().strftime("%d %b %Y"),
        title=f"✓ {test.test_name} Verified Completed",
        description="Diagnostic test completed. CareFlow stopped test-missing escalation and enabled standard appointment reminders.",
        status="completed",
        event_type="test"
    )
    db.add(tl)
    db.commit()

    return {
        "status": "success",
        "message": f"'{test.test_name}' marked as completed.",
        "testId": test.id,
        "testStatus": "completed",
        "completedAt": test.completed_at.strftime("%d %b %Y %H:%M")
    }

@app.put("/api/tests/{test_id}/revert")
@app.post("/api/tests/{test_id}/revert")
def api_revert_test(test_id: str, db: Session = Depends(get_db)):
    test = db.query(models.RequiredTest).filter(models.RequiredTest.id == test_id).first()
    if not test:
        test = db.query(models.RequiredTest).filter(models.RequiredTest.id == "TEST-RAVI-001").first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    test.status = "pending"
    test.completed_at = None
    db.commit()

    return {
        "status": "success",
        "message": f"'{test.test_name}' reverted to pending.",
        "testId": test.id,
        "testStatus": "pending"
    }

@app.post("/api/appointments/{appt_id}/send-reminder")
def api_send_appointment_reminder(appt_id: str, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    result = run_automation_pipeline(db, is_demo=True, bypass_hours_check=True)
    return {"status": "success", "result": result}

@app.get("/api/patients/{patient_id}/timeline")
def api_get_patient_timeline(patient_id: str, db: Session = Depends(get_db)):
    events = db.query(models.TimelineEvent).filter(models.TimelineEvent.patient_id == patient_id).all()
    return [{
        "id": e.id,
        "date": e.date_str,
        "title": e.title,
        "description": e.description,
        "status": e.status,
        "type": e.event_type
    } for e in events]

@app.get("/api/patients/{patient_id}/reminders")
def api_get_patient_reminders(patient_id: str, db: Session = Depends(get_db)):
    logs = db.query(models.NotificationLog).filter(models.NotificationLog.patient_id == patient_id).order_by(desc(models.NotificationLog.created_at)).all()
    return [{
        "id": l.id,
        "scenario": l.scenario,
        "channel": l.channel,
        "status": l.status,
        "subject": l.subject,
        "message": l.message,
        "sentAt": l.sent_at.strftime("%d %b %Y, %I:%M %p") if l.sent_at else None,
        "simulationDate": l.simulation_date
    } for l in logs]


# ======================= DOCTOR DASHBOARD ENDPOINTS =======================

@app.get("/api/doctor/stats")
def doctor_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    total_patients = db.query(models.Patient).count()
    pending = db.query(models.FollowUpTask).filter(models.FollowUpTask.status.in_(['pending', 'in-progress'])).count()
    high_priority = db.query(models.Patient).filter(models.Patient.priority_level.in_(['high-priority', 'immediate-review'])).count()
    needs_review = db.query(models.NeedsReviewIssue).filter(models.NeedsReviewIssue.status == 'active').count()
    overdue = db.query(models.FollowUpTask).filter(models.FollowUpTask.status == 'overdue').count()
    
    return {
        "totalPatients": total_patients,
        "pendingFollowUps": pending,
        "highPriority": high_priority,
        "needsReview": needs_review,
        "overdue": overdue
    }

@app.get("/api/doctor/patients")
def doctor_patients(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    patients = db.query(models.Patient).all()
    out = []
    for p in patients:
        tasks = [t for t in p.tasks if t.status != 'completed']
        next_task = tasks[0].title if tasks else "Routine Post-Discharge Follow-up"
        due = tasks[0].due_date if tasks else "-"
        status = tasks[0].status if tasks else "stable"
        
        # Check appointments if tasks don't have department/due
        appts = [a for a in p.appointments if a.status != 'completed']
        dept = appts[0].department if appts else (tasks[0].specialty if tasks and tasks[0].specialty else "Cardiology")
        if (due == "-" or not due) and appts:
            due = str(appts[0].appointment_date)

        out.append({
            "id": p.id,
            "patientId": p.id,
            "patientName": p.name,
            "name": p.name,
            "department": dept,
            "followUp": next_task,
            "dueDate": due,
            "followUpDate": due,
            "status": status,
            "level": p.priority_level or "routine",
            "actionLabel": "Review Now" if p.priority_level == 'immediate-review' else "View",
            "gender": p.gender or "Unknown",
            "primaryDiagnosis": p.primary_diagnosis or "General Care",
            "admissionDate": p.admission_date or "-",
            "dischargeDate": p.discharge_date or "Recently Discharged",
            "attendingPhysician": p.attending_physician or "Dr. Meera Patel",
            "contactPhone": p.contact_phone or "-",
            "preferredLanguage": p.preferred_language or "English"
        })
        
    priority_map = {"immediate-review": 0, "high-priority": 1, "routine": 2}
    out.sort(key=lambda x: priority_map.get(x["level"], 3))
    return out

@app.get("/api/doctor/reviews")
def doctor_reviews(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403)
    issues = db.query(models.NeedsReviewIssue).filter(models.NeedsReviewIssue.status == 'active').all()
    return [{
        "id": i.id,
        "patientId": i.patient_id,
        "patientName": i.patient.name if i.patient else "UNKNOWN",
        "category": i.category,
        "issue": i.issue,
        "extractedText": i.extracted_text,
        "flagReason": i.flag_reason,
        "source": i.source,
        "page": i.page
    } for i in issues]

@app.get("/api/doctor/overdue")
def doctor_overdue(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403)
    tasks = db.query(models.FollowUpTask).filter(models.FollowUpTask.status == 'overdue').all()
    return [{
        "id": t.id,
        "patientName": t.patient.name,
        "daysOverdue": t.days_overdue or 1,
        "taskTitle": t.title,
        "dueDate": t.due_date,
        "attending": t.attending,
        "contactPhone": t.patient.contact_phone
    } for t in tasks]

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class TaskStatusUpdateRequest(BaseModel):
    status: str # pending, in-progress, completed, overdue, needs-review

class CreateTaskRequest(BaseModel):
    patientId: str
    title: str
    dueDate: str
    taskType: str = "appointment"
    specialty: Optional[str] = "General Medicine"
    attending: Optional[str] = "Dr. Meera Patel"
    source: Optional[str] = "Care Coordinator Manual Entry"

@app.get("/api/doctor/follow-ups")
def get_doctor_follow_ups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    
    tasks = db.query(models.FollowUpTask).all()
    out = []
    for t in tasks:
        p = t.patient
        out.append({
            "id": t.id,
            "patientId": p.id if p else "UNKNOWN",
            "patientName": p.name if p else "Unknown Patient",
            "patientAge": 55,
            "patientGender": p.gender if p else "Unknown",
            "mrn": p.id if p else "UNKNOWN",
            "primaryDiagnosis": p.primary_diagnosis if p else "Post-Discharge Recovery",
            "followUpType": t.title,
            "specialty": t.specialty or "Specialist Care",
            "dueDate": t.due_date,
            "dueDaysRemaining": 5,
            "priority": "urgent" if (p and p.priority_level == "immediate-review") else "high",
            "status": t.status,
            "assignedCoordinator": t.attending or "Dr. Meera Patel",
            "dependencyStatus": {
                "requiredPrecondition": "Fasting Diagnostic Lab Draw",
                "preconditionStatus": "satisfied" if t.status == "completed" else "pending",
                "workflowRisk": "Follow-up requires review of prerequisite lab metrics."
            },
            "lastActivity": f"Status updated to {t.status}",
            "objective": f"Coordinate {t.title} and verify adherence.",
            "relatedTasks": [t.title],
            "reminderHistory": [
                {"timestamp": t.due_date, "channel": "SMS", "status": "Recorded", "outcome": "Queued in automated reminder service"}
            ],
            "sourceEvidence": {
                "documentId": "DOC-AUTO",
                "documentName": t.source or "Discharge Care Plan",
                "pageNumber": t.source_page or 1,
                "sectionTitle": "Specialist Care Transition",
                "extractedText": f"Patient indicated for {t.title}.",
                "confidence": 0.98
            }
        })
    return out

@app.get("/api/doctor/tasks")
def get_doctor_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    tasks = db.query(models.FollowUpTask).all()
    return [{
        "id": t.id,
        "patientId": t.patient_id,
        "patientName": t.patient.name if t.patient else "Unknown",
        "title": t.title,
        "dueDate": t.due_date,
        "status": t.status,
        "taskType": t.task_type,
        "specialty": t.specialty,
        "attending": t.attending,
        "source": t.source,
        "sourcePage": t.source_page,
        "daysOverdue": t.days_overdue
    } for t in tasks]

@app.post("/api/doctor/tasks")
def create_doctor_task(req: CreateTaskRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    task_id = f"TASK_{uuid.uuid4().hex[:8].upper()}"
    new_task = models.FollowUpTask(
        id=task_id,
        patient_id=req.patientId,
        title=req.title,
        due_date=req.dueDate,
        status="pending",
        task_type=req.taskType,
        specialty=req.specialty,
        attending=req.attending,
        source=req.source,
        source_page=1,
        days_overdue=0
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"status": "success", "task": {
        "id": new_task.id,
        "patientId": new_task.patient_id,
        "title": new_task.title,
        "dueDate": new_task.due_date,
        "status": new_task.status
    }}

@app.put("/api/doctor/tasks/{task_id}/status")
def update_task_status(task_id: str, req: TaskStatusUpdateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    task = db.query(models.FollowUpTask).filter(models.FollowUpTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = req.status
    if req.status == 'completed':
        # Log timeline event
        tl = models.TimelineEvent(
            id=f"TL_{task.id}_{uuid.uuid4().hex[:6]}",
            patient_id=task.patient_id,
            date_str=datetime.datetime.utcnow().strftime("%d %b"),
            title=f"{task.title} Verified Completed",
            description=f"Clinical coordinator verified completion of task.",
            status="completed",
            event_type="appointment"
        )
        db.add(tl)
    db.commit()
    return {"status": "success", "taskId": task.id, "newStatus": task.status}

@app.get("/api/doctor/care-instructions")
def get_care_instructions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    tasks = db.query(models.FollowUpTask).filter(models.FollowUpTask.task_type == "care-instruction").all()
    if not tasks:
        # Return standard structured recovery instructions from active patients
        patients = db.query(models.Patient).all()
        return [{
            "id": f"INST-{p.id}",
            "patientId": p.id,
            "patientName": p.name,
            "category": "Wound Care & Physical Activity",
            "instruction": "Keep incision clean and dry; restrict lifting objects > 10 lbs for 4 weeks.",
            "status": "active",
            "source": "Post-Procedure Discharge Nursing Protocol",
            "priority": "high"
        } for p in patients]
    return [{
        "id": t.id,
        "patientId": t.patient_id,
        "patientName": t.patient.name if t.patient else "Patient",
        "category": t.specialty or "Care Protocol",
        "instruction": t.title,
        "status": t.status,
        "source": t.source or "Discharge Summary",
        "priority": "high"
    } for t in tasks]

@app.get("/api/doctor/documents")
def list_documents(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    docs = db.query(models.DischargeDocument).order_by(models.DischargeDocument.id.desc()).all()
    return [{
        "id": d.id,
        "patientId": d.patient_id,
        "patientName": d.patient.name if d.patient else "Unassigned / Pending Match",
        "originalFilename": d.original_filename,
        "uploadDate": d.upload_date.strftime("%d %b %Y, %I:%M %p") if d.upload_date else "-",
        "status": d.status,
        "needsReview": d.needs_review,
        "reviewReason": d.review_reason
    } for d in docs]

@app.get("/api/doctor/documents/{doc_id}")
def get_document_detail(doc_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    doc = db.query(models.DischargeDocument).filter(models.DischargeDocument.id == doc_id).first()
    if not doc: raise HTTPException(status_code=404, detail="Document not found")
    
    ext = db.query(models.DischargeExtraction).filter(models.DischargeExtraction.document_id == doc_id).first()
    import json
    extraction_data = json.loads(ext.structured_data) if (ext and ext.structured_data) else {}
    
    return {
        "id": doc.id,
        "patientId": doc.patient_id,
        "patientName": doc.patient.name if doc.patient else None,
        "originalFilename": doc.original_filename,
        "uploadDate": doc.upload_date.strftime("%d %b %Y, %I:%M %p") if doc.upload_date else "-",
        "status": doc.status,
        "needsReview": doc.needs_review,
        "reviewReason": doc.review_reason,
        "extraction": extraction_data
    }

class ApproveExtractionRequest(BaseModel):
    extraction: dict
    filename: Optional[str] = "Synthetic_Discharge_Summary.txt"

class MatchExtractedPatientRequest(BaseModel):
    mrn: Optional[str] = None
    name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    contactPhone: Optional[str] = None
    primaryDiagnosis: Optional[str] = None
    department: Optional[str] = None

class RegisterAndApproveRequest(BaseModel):
    patient: dict
    documentId: Optional[int] = None
    filename: Optional[str] = "Synthetic_Discharge_Summary.txt"
    extraction: dict

class UpdateAndApproveRequest(BaseModel):
    patientId: str
    updatedFields: dict
    documentId: Optional[int] = None
    filename: Optional[str] = "Synthetic_Discharge_Summary.txt"
    extraction: dict

def _execute_document_approval(
    db: Session, 
    document: models.DischargeDocument, 
    ext: Optional[models.DischargeExtraction], 
    data: dict,
    custom_patient_data: Optional[dict] = None,
    updated_fields: Optional[dict] = None,
    target_patient_id: Optional[str] = None
):
    # 1. Extract Patient Information
    p_info = data.get("patientInfo") or {}
    
    if custom_patient_data:
        patient_mrn = (custom_patient_data.get("id") or custom_patient_data.get("mrn") or f"MRN-{uuid.uuid4().hex[:6].upper()}").strip()
        patient_name = custom_patient_data.get("name") or "Arun Kumar"
        dob = custom_patient_data.get("dob") or "1968-06-12"
        gender = custom_patient_data.get("gender") or "Male"
        primary_diag = custom_patient_data.get("primaryDiagnosis") or custom_patient_data.get("primary_diagnosis") or "Acute Myocardial Infarction (Post-PCI)"
        admission_date = custom_patient_data.get("admissionDate") or custom_patient_data.get("admission_date") or "01 Oct 2026"
        discharge_date = custom_patient_data.get("dischargeDate") or custom_patient_data.get("discharge_date") or datetime.date.today().strftime("%d %b %Y")
        attending = custom_patient_data.get("attendingPhysician") or custom_patient_data.get("attending_physician") or "Dr. Meera Patel"
        contact_phone = custom_patient_data.get("contactPhone") or custom_patient_data.get("contact_phone") or "+919876543210"
        priority_lvl = custom_patient_data.get("priorityLevel") or custom_patient_data.get("priority_level") or "high-priority"
    else:
        raw_mrn = target_patient_id or p_info.get("mrn") or data.get("patient_mrn") or data.get("patientId") or document.patient_id or f"MRN-{uuid.uuid4().hex[:6].upper()}"
        patient_mrn = raw_mrn.strip()
        patient_name = p_info.get("name") or data.get("patient_name") or data.get("patientName") or "Arun Kumar"
        dob = p_info.get("dob") or "1968-06-12"
        gender = p_info.get("gender") or "Male"
        primary_diag = p_info.get("primaryDiagnosis") or data.get("primary_diagnosis") or data.get("diagnosis") or "Acute Myocardial Infarction (Post-PCI)"
        admission_date = p_info.get("admissionDate") or data.get("admission_date") or "01 Oct 2026"
        discharge_date = p_info.get("dischargeDate") or data.get("discharge_date") or datetime.date.today().strftime("%d %b %Y")
        attending = p_info.get("attendingPhysician") or data.get("attending_physician") or "Dr. Meera Patel"
        contact_phone = p_info.get("contactPhone") or data.get("contact_phone") or "+919876543210"
        has_review_flags = bool(data.get("needsReview") or data.get("needs_review") or document.needs_review)
        priority_lvl = "immediate-review" if has_review_flags else (p_info.get("priorityLevel") or data.get("priority_level") or "high-priority")

    # 2. Lookup or Create Patient in MySQL
    lookup_id = target_patient_id or patient_mrn
    patient = db.query(models.Patient).filter(func.upper(models.Patient.id) == lookup_id.upper()).first()
    
    if not patient and not target_patient_id:
        # Fallback check by name if exact ID not found
        patient = db.query(models.Patient).filter(func.lower(models.Patient.name) == patient_name.lower().strip()).first()

    if not patient:
        clean_email = f"{patient_mrn.lower().replace('-', '_')}@careflow.ai"
        user = db.query(models.User).filter(models.User.email == clean_email).first()
        if not user:
            user = models.User(
                email=clean_email,
                hashed_password=get_password_hash("password"),
                role="patient",
                name=patient_name
            )
            db.add(user)
            db.flush()
            
        patient = models.Patient(
            id=patient_mrn,
            user_id=user.id,
            name=patient_name,
            email=clean_email,
            dob=dob,
            gender=gender,
            primary_diagnosis=primary_diag,
            admission_date=admission_date,
            discharge_date=discharge_date,
            attending_physician=attending,
            contact_phone=contact_phone,
            preferred_language="English",
            priority_level=priority_lvl,
            email_consent=True,
            sms_consent=True
        )
        db.add(patient)
        db.flush()
    else:
        # Update existing patient metadata with approved fields
        if updated_fields:
            if "name" in updated_fields and updated_fields["name"]:
                patient.name = updated_fields["name"]
            if "primaryDiagnosis" in updated_fields and updated_fields["primaryDiagnosis"]:
                patient.primary_diagnosis = updated_fields["primaryDiagnosis"]
            elif "primary_diagnosis" in updated_fields and updated_fields["primary_diagnosis"]:
                patient.primary_diagnosis = updated_fields["primary_diagnosis"]
            if "dischargeDate" in updated_fields and updated_fields["dischargeDate"]:
                patient.discharge_date = updated_fields["dischargeDate"]
            elif "discharge_date" in updated_fields and updated_fields["discharge_date"]:
                patient.discharge_date = updated_fields["discharge_date"]
            if "attendingPhysician" in updated_fields and updated_fields["attendingPhysician"]:
                patient.attending_physician = updated_fields["attendingPhysician"]
            elif "attending_physician" in updated_fields and updated_fields["attending_physician"]:
                patient.attending_physician = updated_fields["attending_physician"]
            if "contactPhone" in updated_fields and updated_fields["contactPhone"]:
                patient.contact_phone = updated_fields["contactPhone"]
            elif "contact_phone" in updated_fields and updated_fields["contact_phone"]:
                patient.contact_phone = updated_fields["contact_phone"]
            if "priorityLevel" in updated_fields and updated_fields["priorityLevel"]:
                patient.priority_level = updated_fields["priorityLevel"]
            elif "priority_level" in updated_fields and updated_fields["priority_level"]:
                patient.priority_level = updated_fields["priority_level"]
        else:
            if patient_name and patient.name in ["Unknown", "UNKNOWN", ""]:
                patient.name = patient_name
            if primary_diag:
                patient.primary_diagnosis = primary_diag
            if discharge_date:
                patient.discharge_date = discharge_date
            if attending:
                patient.attending_physician = attending
            if priority_lvl:
                patient.priority_level = priority_lvl
        db.flush()

    # Update Document and Extraction associations
    document.patient_id = patient.id
    document.status = "approved"
    document.needs_review = False
    document.review_reason = None
    if ext:
        ext.patient_id = patient.id

    tasks_created = 0
    appointments_created = 0
    tests_created = 0

    # 3. Process Appointments & Follow-ups
    raw_appts = data.get("appointments", [])
    if not raw_appts and data.get("follow_ups"):
        raw_appts = data.get("follow_ups")
        
    created_appointments = []
    for idx, appt in enumerate(raw_appts):
        specialty = appt.get("specialty") or appt.get("department") or "Cardiology"
        doctor_name = appt.get("doctorName") or appt.get("doctor") or attending
        date_str = appt.get("date") or appt.get("appointment_date") or "2026-10-15"
        time_str = appt.get("time") or "10:30 AM"
        location = appt.get("location") or "Cardiovascular Outpatient Pavilion • Suite 204"
        reason = appt.get("reason") or appt.get("instruction") or f"Outpatient {specialty} follow-up consultation"
        
        try:
            parsed_date = datetime.datetime.strptime(date_str[:10], "%Y-%m-%d").date()
        except Exception:
            parsed_date = datetime.date(2026, 10, 15)

        appt_id = f"APT_{patient.id}_{idx+1}"
        existing_appt = db.query(models.Appointment).filter(
            models.Appointment.patient_id == patient.id,
            (models.Appointment.id == appt_id) | (models.Appointment.department == specialty)
        ).first()

        if not existing_appt:
            new_appt = models.Appointment(
                id=appt_id,
                patient_id=patient.id,
                appointment_date=parsed_date,
                time_str=time_str,
                doctor_name=doctor_name,
                department=specialty,
                location=location,
                status="scheduled",
                notes=reason
            )
            db.add(new_appt)
            db.flush()
            created_appointments.append(new_appt)
            appointments_created += 1
        else:
            existing_appt.appointment_date = parsed_date
            existing_appt.time_str = time_str
            existing_appt.doctor_name = doctor_name
            existing_appt.department = specialty
            existing_appt.location = location
            existing_appt.notes = reason
            created_appointments.append(existing_appt)

        # Create/update corresponding FollowUpTask for operational dashboard
        task_id = f"TASK_APT_{document.id}_{idx+1}"
        existing_task = db.query(models.FollowUpTask).filter(
            models.FollowUpTask.patient_id == patient.id,
            (models.FollowUpTask.id == task_id) | (models.FollowUpTask.title == f"{specialty} Specialist Follow-up")
        ).first()
        if not existing_task:
            task = models.FollowUpTask(
                id=task_id,
                patient_id=patient.id,
                title=f"{specialty} Specialist Follow-up",
                due_date=date_str,
                status="pending",
                task_type="appointment",
                specialty=specialty,
                attending=doctor_name,
                source=document.original_filename,
                source_page=1,
                days_overdue=0
            )
            db.add(task)
            tasks_created += 1

    # 4. Process Diagnostic Tests
    raw_tests = data.get("tests", [])
    if not raw_tests and data.get("diagnostic_tests"):
        raw_tests = data.get("diagnostic_tests")

    first_appt = created_appointments[0] if created_appointments else None
    for idx, t in enumerate(raw_tests):
        test_name = t.get("testName") or t.get("name") or t.get("test_name") or "Diagnostic Blood Panel"
        due_date_str = t.get("targetDate") or t.get("due_date") or t.get("date") or "2026-10-14"
        instructions = t.get("instructions") or t.get("instruction") or "10 to 12 hours overnight fasting required. Water permitted."
        
        try:
            test_due_d = datetime.datetime.strptime(due_date_str[:10], "%Y-%m-%d").date()
        except Exception:
            test_due_d = datetime.date(2026, 10, 14)

        test_id = f"TEST_{patient.id}_{idx+1}"
        existing_test = db.query(models.RequiredTest).filter(
            models.RequiredTest.patient_id == patient.id,
            (models.RequiredTest.id == test_id) | (models.RequiredTest.test_name == test_name)
        ).first()

        if not existing_test:
            db_test = models.RequiredTest(
                id=test_id,
                patient_id=patient.id,
                appointment_id=first_appt.id if first_appt else None,
                test_name=test_name,
                due_date=test_due_d,
                status="pending",
                source_doc=f"{document.original_filename} • Page {t.get('sourcePage', 3)}",
                notes=instructions
            )
            db.add(db_test)
            tests_created += 1
        else:
            existing_test.due_date = test_due_d
            existing_test.notes = instructions

        # Create/update corresponding FollowUpTask
        task_id = f"TASK_TEST_{document.id}_{idx+1}"
        existing_task = db.query(models.FollowUpTask).filter(
            models.FollowUpTask.patient_id == patient.id,
            (models.FollowUpTask.id == task_id) | (models.FollowUpTask.title == f"Diagnostic Test: {test_name}")
        ).first()
        if not existing_task:
            task = models.FollowUpTask(
                id=task_id,
                patient_id=patient.id,
                title=f"Diagnostic Test: {test_name}",
                due_date=due_date_str,
                status="pending",
                task_type="test",
                specialty="Diagnostic Pathology",
                attending=attending,
                source=document.original_filename,
                source_page=1,
                days_overdue=0
            )
            db.add(task)
            tasks_created += 1

    # 5. Process Referrals
    raw_referrals = data.get("referrals", [])
    for idx, r in enumerate(raw_referrals):
        provider_type = r.get("providerType") or r.get("specialty") or "Specialist Outpatient Referral"
        reason = r.get("reason") or r.get("notes") or "Post-discharge specialized consultation"
        task_id = f"TASK_REF_{document.id}_{idx+1}"
        existing_task = db.query(models.FollowUpTask).filter(
            models.FollowUpTask.patient_id == patient.id,
            (models.FollowUpTask.id == task_id) | (models.FollowUpTask.title == f"Referral: {provider_type}")
        ).first()
        if not existing_task:
            task = models.FollowUpTask(
                id=task_id,
                patient_id=patient.id,
                title=f"Referral: {provider_type}",
                due_date="28 Oct 2026",
                status="pending",
                task_type="referral",
                specialty=provider_type,
                attending=attending,
                source=document.original_filename,
                source_page=1,
                days_overdue=0
            )
            db.add(task)
            tasks_created += 1

    # 6. Process Care & Medication Instructions
    raw_care = data.get("careInstructions", []) or data.get("care_instructions", [])
    for idx, c in enumerate(raw_care):
        category = c.get("category") or "Recovery Guidance"
        instruction = c.get("instruction") or "Adhere to hospital discharge care protocols."
        task_id = f"TASK_CARE_{document.id}_{idx+1}"
        existing_task = db.query(models.FollowUpTask).filter(
            models.FollowUpTask.patient_id == patient.id,
            models.FollowUpTask.id == task_id
        ).first()
        if not existing_task:
            task = models.FollowUpTask(
                id=task_id,
                patient_id=patient.id,
                title=f"{category}: {instruction[:80]}",
                due_date="Ongoing Recovery",
                status="pending",
                task_type="care-instruction",
                specialty=category,
                attending=attending,
                source=document.original_filename,
                source_page=1,
                days_overdue=0
            )
            db.add(task)
            tasks_created += 1

    # Ensure patient has at least 1 task for cohort tracking
    if not patient.tasks and tasks_created == 0:
        task_id = f"TASK_DEFAULT_{document.id}_{uuid.uuid4().hex[:6]}"
        task = models.FollowUpTask(
            id=task_id,
            patient_id=patient.id,
            title=f"Clinical Recovery Follow-up",
            due_date="15 Oct 2026",
            status="pending",
            task_type="appointment",
            specialty="Cardiology",
            attending=attending,
            source=document.original_filename,
            source_page=1,
            days_overdue=0
        )
        db.add(task)
        tasks_created += 1

    # 7. Resolve existing review issues for this document
    issues = db.query(models.NeedsReviewIssue).filter(models.NeedsReviewIssue.document_id == document.id).all()
    for issue in issues:
        issue.status = "resolved"
        issue.patient_id = patient.id

    # 8. Record audit timeline events
    tl = models.TimelineEvent(
        id=f"TL_APPR_{document.id}_{uuid.uuid4().hex[:6]}",
        patient_id=patient.id,
        date_str=datetime.datetime.utcnow().strftime("%d %b"),
        title="Discharge Care Plan Authorized",
        description=f"Care Coordinator authorized discharge plan from '{document.original_filename}'. {tasks_created} tasks, {appointments_created} appointments, and {tests_created} tests activated in MySQL.",
        status="completed",
        event_type="appointment"
    )
    db.add(tl)

    db.commit()

    return {
        "status": "approved",
        "message": f"Successfully activated in MySQL! Created/linked patient {patient.name} ({patient.id}), {tasks_created} tasks, {appointments_created} appointments, and {tests_created} tests.",
        "documentId": document.id,
        "document_id": document.id,
        "patientId": patient.id,
        "patient_id": patient.id,
        "patientName": patient.name,
        "patient_name": patient.name,
        "tasksCreated": tasks_created,
        "tasks_created": tasks_created,
        "appointmentsCreated": appointments_created,
        "appointments_created": appointments_created,
        "testsCreated": tests_created,
        "tests_created": tests_created
    }

@app.post("/api/doctor/documents/{doc_id}/approve")
def approve_document(doc_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    document = db.query(models.DischargeDocument).filter(models.DischargeDocument.id == doc_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    ext = db.query(models.DischargeExtraction).filter(models.DischargeExtraction.document_id == doc_id).first()
    if not ext or not ext.structured_data:
        raise HTTPException(status_code=400, detail="No extraction payload found for this document.")
        
    import json
    try:
        data = json.loads(ext.structured_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse extraction data: {str(e)}")
        
    try:
        return _execute_document_approval(db, document, ext, data)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database activation failed: {str(exc)}")

@app.post("/api/doctor/documents/approve-extraction")
def approve_extraction(req: ApproveExtractionRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    data = req.extraction
    if not data or not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Invalid extraction data payload.")
        
    import json
    filename = req.filename or "Direct_Extraction.txt"
    
    # Create document record
    document = models.DischargeDocument(
        patient_id=None,
        original_filename=filename,
        file_path=os.path.join(UPLOAD_DIR, filename),
        status="processed",
        needs_review=False,
        review_reason=None
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    ext = models.DischargeExtraction(
        document_id=document.id,
        patient_id=None,
        structured_data=json.dumps(data),
        needs_review=False
    )
    db.add(ext)
    db.commit()
    db.refresh(ext)
    
    try:
        return _execute_document_approval(db, document, ext, data)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database activation failed: {str(exc)}")

def _format_patient_match(p: models.Patient, db: Session):
    tasks_count = db.query(models.FollowUpTask).filter(models.FollowUpTask.patient_id == p.id).count()
    appts_count = db.query(models.Appointment).filter(models.Appointment.patient_id == p.id).count()
    tests_count = db.query(models.RequiredTest).filter(models.RequiredTest.patient_id == p.id).count()
    return {
        "id": p.id,
        "mrn": p.id,
        "name": p.name,
        "dob": p.dob or "Not documented",
        "gender": p.gender or "Not documented",
        "primaryDiagnosis": p.primary_diagnosis or "Post-Discharge Recovery",
        "department": p.attending_physician or "Cardiology",
        "admissionDate": p.admission_date or "Not documented",
        "dischargeDate": p.discharge_date or "Active in Care",
        "attendingPhysician": p.attending_physician or "Dr. Meera Patel",
        "contactPhone": p.contact_phone or "Not documented",
        "priorityLevel": p.priority_level or "routine",
        "activeTasksCount": tasks_count,
        "appointmentsCount": appts_count,
        "testsCount": tests_count
    }

@app.post("/api/doctor/patients/match-extracted")
def match_extracted_patient(req: MatchExtractedPatientRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # 1. Authoritative MRN matching
    if req.mrn and req.mrn.strip():
        clean_mrn = req.mrn.strip().upper()
        exact_matches = db.query(models.Patient).filter(func.upper(models.Patient.id) == clean_mrn).all()
        if len(exact_matches) == 1:
            return {"status": "existing", "patient": _format_patient_match(exact_matches[0], db)}
        elif len(exact_matches) > 1:
            return {"status": "ambiguous", "candidates": [_format_patient_match(p, db) for p in exact_matches]}

    # 2. Name & Secondary Identifiers matching
    if req.name and req.name.strip():
        clean_name = req.name.strip().lower()
        if clean_name not in ["patient", "unknown", "discharge summary"]:
            name_matches = db.query(models.Patient).filter(func.lower(models.Patient.name) == clean_name).all()
            if not name_matches and len(clean_name) > 3:
                name_matches = db.query(models.Patient).filter(func.lower(models.Patient.name).contains(clean_name)).all()
            
            if len(name_matches) == 1:
                return {"status": "existing", "patient": _format_patient_match(name_matches[0], db)}
            elif len(name_matches) > 1:
                return {"status": "ambiguous", "candidates": [_format_patient_match(p, db) for p in name_matches]}

    # 3. No existing patient match
    suggested_mrn = req.mrn.strip().upper() if (req.mrn and req.mrn.strip() and "UNKNOWN" not in req.mrn.upper()) else f"MRN-{uuid.uuid4().hex[:6].upper()}"
    return {
        "status": "new",
        "patient": None,
        "candidates": [],
        "suggestedMrn": suggested_mrn,
        "extractedDetails": {
            "name": req.name or "",
            "dob": req.dob or "",
            "gender": req.gender or "",
            "contactPhone": req.contactPhone or "",
            "primaryDiagnosis": req.primaryDiagnosis or "",
            "department": req.department or ""
        }
    }

@app.post("/api/doctor/patients/register-and-approve")
def register_and_approve(req: RegisterAndApproveRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    patient_data = req.patient
    mrn = (patient_data.get("id") or patient_data.get("mrn") or f"MRN-{uuid.uuid4().hex[:6].upper()}").strip()
    
    # 1. Check or create DischargeDocument
    document = None
    if req.documentId:
        document = db.query(models.DischargeDocument).filter(models.DischargeDocument.id == req.documentId).first()
    
    import json
    if not document:
        filename = req.filename or f"Discharge_Summary_{mrn}.txt"
        document = models.DischargeDocument(
            patient_id=None,
            original_filename=filename,
            file_path=os.path.join(UPLOAD_DIR, filename),
            status="processed",
            needs_review=False,
            review_reason=None
        )
        db.add(document)
        db.commit()
        db.refresh(document)
    
    # 2. Save extraction record if needed
    ext = db.query(models.DischargeExtraction).filter(models.DischargeExtraction.document_id == document.id).first()
    if not ext:
        ext = models.DischargeExtraction(
            document_id=document.id,
            patient_id=None,
            structured_data=json.dumps(req.extraction),
            needs_review=False
        )
        db.add(ext)
        db.commit()
        db.refresh(ext)
    
    # 3. Execute approval with custom patient data
    try:
        return _execute_document_approval(db, document, ext, req.extraction, custom_patient_data=patient_data)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration & activation failed: {str(exc)}")

@app.post("/api/doctor/patients/update-and-approve")
def update_and_approve(req: UpdateAndApproveRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    patient = db.query(models.Patient).filter(func.upper(models.Patient.id) == req.patientId.strip().upper()).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Existing patient '{req.patientId}' not found in database.")
    
    # 1. Check or create DischargeDocument
    document = None
    if req.documentId:
        document = db.query(models.DischargeDocument).filter(models.DischargeDocument.id == req.documentId).first()
    
    import json
    if not document:
        filename = req.filename or f"Discharge_Summary_{patient.id}.txt"
        document = models.DischargeDocument(
            patient_id=patient.id,
            original_filename=filename,
            file_path=os.path.join(UPLOAD_DIR, filename),
            status="processed",
            needs_review=False,
            review_reason=None
        )
        db.add(document)
        db.commit()
        db.refresh(document)
    
    # 2. Save extraction record if needed
    ext = db.query(models.DischargeExtraction).filter(models.DischargeExtraction.document_id == document.id).first()
    if not ext:
        ext = models.DischargeExtraction(
            document_id=document.id,
            patient_id=patient.id,
            structured_data=json.dumps(req.extraction),
            needs_review=False
        )
        db.add(ext)
        db.commit()
        db.refresh(ext)
    
    # 3. Execute approval with updated fields
    try:
        return _execute_document_approval(
            db, document, ext, req.extraction, 
            updated_fields=req.updatedFields, 
            target_patient_id=patient.id
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update & activation failed: {str(exc)}")

@app.post("/api/doctor/documents/{doc_id}/reject")
def reject_document(doc_id: int, reason: Optional[str] = "Manual entry required", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    doc = db.query(models.DischargeDocument).filter(models.DischargeDocument.id == doc_id).first()
    if not doc: raise HTTPException(status_code=404, detail="Document not found")
    doc.status = "rejected"
    doc.needs_review = True
    doc.review_reason = reason
    db.commit()
    return {"status": "success", "message": "Document flagged as rejected.", "documentId": doc_id}

@app.post("/api/doctor/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Validate extension
    filename = file.filename or "discharge_summary.pdf"
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    allowed_exts = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'doc', 'txt', 'xls', 'xlsx']
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '.{ext}'. Supported formats: PDF, PNG, JPG, DOCX, TXT.")
        
    # Generate unique safe filename
    safe_name = f"{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    
    # Save file with size validation (15MB limit)
    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 15MB limit.")
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
        
    # Extract text from document
    text = document_parser.extract_text(file_path, ext)
    mrns = document_parser.find_patient_mrns(text)
    
    needs_review = False
    review_reason = None
    matched_patient = None
    
    if len(mrns) == 0:
        needs_review = True
        review_reason = "Missing patient identifier. No MRN found in document."
    elif len(mrns) > 1:
        needs_review = True
        review_reason = f"Ambiguous patient identifiers found: {', '.join(mrns)}."
    else:
        mrn = mrns[0]
        matched_patient = db.query(models.Patient).filter(func.upper(models.Patient.id) == mrn).first()
        if not matched_patient:
            needs_review = True
            review_reason = f"Unknown patient identifier '{mrn}' not registered in patient directory."
            
    document = models.DischargeDocument(
        patient_id=matched_patient.id if matched_patient else None,
        original_filename=filename,
        file_path=file_path,
        status="needs-manual-review" if needs_review else "processed",
        needs_review=needs_review,
        review_reason=review_reason
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Process Gemini Extraction
    ext_record, ext_reasons = extraction_service.process_document_extraction(db, text, document, matched_patient)
    
    if needs_review:
        issue = models.NeedsReviewIssue(
            id=f"NR_DOC_{document.id}",
            patient_id=matched_patient.id if matched_patient else None,
            document_id=document.id,
            category="patient-matching",
            issue="Document ingestion requires human review.",
            extracted_text=",".join(mrns) if mrns else "No MRN detected",
            flag_reason=review_reason,
            source=filename,
            page=1,
            status="active"
        )
        db.add(issue)
        db.commit()
        return {
            "message": "Document uploaded and flagged for clinical review.",
            "documentId": document.id,
            "document_id": document.id,
            "filename": filename,
            "fileSize": len(contents),
            "file_size": len(contents),
            "needsReview": True,
            "needs_review": True,
            "reason": review_reason,
            "patientName": None,
            "patient_name": None,
            "extractionId": ext_record.id if ext_record else None,
            "extraction_id": ext_record.id if ext_record else None
        }
    else:
        tl = models.TimelineEvent(
            id=f"TL_DOC_{document.id}",
            patient_id=matched_patient.id,
            date_str=datetime.datetime.utcnow().strftime("%d %b"),
            title="Discharge Document Ingested & Analyzed",
            description=f"File '{filename}' extracted via Gemini AI. Pending staff care plan authorization.",
            status="completed",
            event_type="communication"
        )
        db.add(tl)
        db.commit()
        
        return {
            "message": "success",
            "documentId": document.id,
            "document_id": document.id,
            "filename": filename,
            "fileSize": len(contents),
            "file_size": len(contents),
            "needsReview": document.needs_review,
            "needs_review": document.needs_review,
            "reason": document.review_reason,
            "patientName": matched_patient.name,
            "patient_name": matched_patient.name,
            "extractionId": ext_record.id if ext_record else None,
            "extraction_id": ext_record.id if ext_record else None
        }

@app.post("/api/patient/upload")
async def patient_upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    patient = current_user.patient
    filename = file.filename or "patient_discharge_summary.pdf"
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    allowed_exts = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'doc', 'txt']
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported format '.{ext}'. Supported: PDF, PNG, JPG, DOCX, TXT.")
        
    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 15MB limit.")
        
    safe_name = f"PAT_{patient.id}_{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
        
    text = document_parser.extract_text(file_path, ext)
    
    document = models.DischargeDocument(
        patient_id=patient.id,
        original_filename=filename,
        file_path=file_path,
        status="needs-manual-review",
        needs_review=True,
        review_reason="Patient-uploaded document pending clinical staff review and care plan confirmation."
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Process extraction in background
    ext_record, ext_reasons = extraction_service.process_document_extraction(db, text, document, patient)
    
    tl = models.TimelineEvent(
        id=f"TL_PAT_UPL_{document.id}",
        patient_id=patient.id,
        date_str=datetime.datetime.utcnow().strftime("%d %b"),
        title="Discharge Summary Uploaded by Patient",
        description=f"File '{filename}' received and queued for care coordinator verification.",
        status="completed",
        event_type="communication"
    )
    db.add(tl)
    db.commit()
    
    return {
        "status": "success",
        "message": "Discharge summary uploaded successfully. Your care coordinator will verify and activate your recovery care plan.",
        "documentId": document.id,
        "document_id": document.id,
        "filename": filename,
        "fileSize": len(contents),
        "file_size": len(contents)
    }

# ======================= PATIENT PORTAL ENDPOINTS =======================

@app.get("/api/patient/me")
def patient_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403, detail="Unauthorized")
    p = current_user.patient
    return {
        "id": p.id,
        "name": p.name,
        "email": p.email,
        "dob": p.dob,
        "gender": p.gender,
        "primaryDiagnosis": p.primary_diagnosis,
        "admissionDate": p.admission_date,
        "dischargeDate": p.discharge_date,
        "attendingPhysician": p.attending_physician,
        "contactPhone": p.contact_phone,
        "preferredLanguage": p.preferred_language,
        "priority_level": p.priority_level
    }

@app.get("/api/patient/tasks")
def patient_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403)
    tasks = db.query(models.FollowUpTask).filter(models.FollowUpTask.patient_id == current_user.patient.id).all()
    return [{
        "id": t.id,
        "title": t.title,
        "dueDate": t.due_date,
        "status": t.status,
        "type": t.task_type,
        "specialty": t.specialty,
        "attending": t.attending,
        "source": t.source,
        "sourcePage": t.source_page
    } for t in tasks]

@app.put("/api/patient/tasks/{task_id}/complete")
def patient_complete_task(task_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403)
    task = db.query(models.FollowUpTask).filter(
        models.FollowUpTask.id == task_id,
        models.FollowUpTask.patient_id == current_user.patient.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "completed"
    
    tl = models.TimelineEvent(
        id=f"TL_PAT_CMP_{task.id}_{uuid.uuid4().hex[:6]}",
        patient_id=task.patient_id,
        date_str=datetime.datetime.utcnow().strftime("%d %b"),
        title=f"{task.title} Completed",
        description="Patient confirmed completion of recovery action item.",
        status="completed",
        event_type="appointment"
    )
    db.add(tl)
    db.commit()
    return {"status": "success", "taskId": task.id, "newStatus": "completed"}

@app.get("/api/patient/follow-ups")
def get_patient_follow_ups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403)
    p_id = current_user.patient.id
    appts = db.query(models.Appointment).filter(models.Appointment.patient_id == p_id).all()
    tasks = db.query(models.FollowUpTask).filter(
        models.FollowUpTask.patient_id == p_id,
        models.FollowUpTask.task_type.in_(["appointment", "referral"])
    ).all()
    
    out = []
    for a in appts:
        out.append({
            "id": a.id,
            "title": f"{a.department} Evaluation Visit",
            "type": "Appointment",
            "doctor": a.doctor_name,
            "department": a.department,
            "date": a.appointment_date.strftime("%d %B %Y") if a.appointment_date else "-",
            "time": a.time_str or "10:30 AM",
            "location": a.location or "Hospital Suite 204",
            "status": a.status,
            "notes": a.notes
        })
    for t in tasks:
        out.append({
            "id": t.id,
            "title": t.title,
            "type": "Follow-up Task",
            "doctor": t.attending or "Care Team Specialist",
            "department": t.specialty or "Outpatient Care",
            "date": t.due_date,
            "time": "Scheduled Time",
            "location": "Specialty Outpatient Pavilion",
            "status": t.status,
            "notes": t.source or "Discharge Care Plan"
        })
    return out

@app.get("/api/patient/tests")
def get_patient_tests(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403)
    p_id = current_user.patient.id
    tests = db.query(models.RequiredTest).filter(models.RequiredTest.patient_id == p_id).all()
    return [{
        "id": t.id,
        "name": t.test_name,
        "dueDate": t.due_date.strftime("%d %B %Y") if t.due_date else "14 October 2026",
        "status": t.status,
        "completedAt": t.completed_at.strftime("%d %B %Y, %I:%M %p") if t.completed_at else None,
        "source": t.source_doc,
        "notes": t.notes
    } for t in tests]

@app.put("/api/patient/tests/{test_id}/report")
def report_test_status(test_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403, detail="Unauthorized patient account")
    
    p_id = current_user.patient.id
    test = db.query(models.RequiredTest).filter(
        models.RequiredTest.patient_id == p_id,
        (models.RequiredTest.id == test_id) | (models.RequiredTest.id.ilike(f"%{test_id}%"))
    ).first()

    if not test:
        # If test was from preset or not yet registered, create and complete it
        test_name = "Fasting Lipid Profile & CMP" if "01" in test_id else "Diagnostic Blood Work" if "02" in test_id else "Diagnostic Test"
        test = models.RequiredTest(
            id=test_id,
            patient_id=p_id,
            test_name=test_name,
            due_date=datetime.date(2026, 10, 14),
            status="completed",
            completed_at=datetime.datetime.utcnow(),
            source_doc="Discharge Summary"
        )
        db.add(test)
    else:
        test.status = "completed"
        test.completed_at = datetime.datetime.utcnow()
    
    tl = models.TimelineEvent(
        id=f"TL_TEST_PAT_{test.id}_{uuid.uuid4().hex[:6]}",
        patient_id=p_id,
        date_str=datetime.datetime.utcnow().strftime("%d %b"),
        title=f"{test.test_name} Reported Completed",
        description="Patient reported diagnostic test completion / sample collected.",
        status="completed",
        event_type="appointment"
    )
    db.add(tl)
    db.commit()
    db.refresh(test)
    return {"status": "success", "testId": test.id, "newStatus": "completed", "completedAt": test.completed_at.isoformat()}

@app.put("/api/patient/referrals/{ref_id}/report")
def report_referral_status(ref_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403, detail="Unauthorized patient account")
    
    p_id = current_user.patient.id
    tl = models.TimelineEvent(
        id=f"TL_REF_PAT_{ref_id}_{uuid.uuid4().hex[:6]}",
        patient_id=p_id,
        date_str=datetime.datetime.utcnow().strftime("%d %b"),
        title="Specialist Referral Inquiry Confirmed",
        description=f"Patient confirmed specialist referral inquiry ({ref_id}) with clinic coordinator.",
        status="completed",
        event_type="communication"
    )
    db.add(tl)
    db.commit()
    return {"status": "success", "referralId": ref_id, "newStatus": "in-progress"}

@app.get("/api/patient/timeline")
def patient_timeline(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403)
    events = db.query(models.TimelineEvent).filter(models.TimelineEvent.patient_id == current_user.patient.id).all()
    return [{
        "id": e.id,
        "date": e.date_str,
        "title": e.title,
        "description": e.description,
        "status": e.status,
        "type": e.event_type
    } for e in events]

@app.get("/api/doctor/extraction/{document_id}")
async def get_extraction(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403)
    ext = db.query(models.DischargeExtraction).filter(models.DischargeExtraction.document_id == document_id).first()
    if not ext:
        raise HTTPException(status_code=404, detail="Extraction not found")
    import json
    return json.loads(ext.structured_data) if ext.structured_data else {}

# ======================= CAREFLOW GEMINI AI DISCHARGE INTELLIGENCE =======================

class AnalyzeDischargeRequest(BaseModel):
    documentText: str

@app.post("/api/ai/analyze-discharge")
async def analyze_discharge(req: AnalyzeDischargeRequest):
    text = (req.documentText or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="documentText must not be empty.")
    
    try:
        from llm_provider import DischargeLLMProvider
        llm = DischargeLLMProvider()
        result = llm.extract(text)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Discharge intelligence extraction encountered an error: {str(e)[:120]}"
        )

@app.get("/api/ai/status")
def ai_status():
    api_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "online",
        "service": "CareFlow AI Discharge Intelligence",
        "provider": "Google Gemini API",
        "configured": bool(api_key and api_key != "your_key_here"),
        "model": "gemini-3.5-flash / gemini-flash-latest",
        "safetyBoundaries": "Active (Zero autonomous diagnoses or unauthorized dosage changes)",
        "disclaimer": "Synthetic healthcare data — demonstration only."
    }
