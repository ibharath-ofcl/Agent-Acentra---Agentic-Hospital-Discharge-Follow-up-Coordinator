from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import os
import shutil
import datetime

import models
from database import engine, get_db, Base
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from pydantic import BaseModel

app = FastAPI(title="CareFlow AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
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

# ======================= DOCTOR DASHBOARD ENDPOINTS =======================

@app.get("/api/doctor/stats")
def doctor_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    total_patients = db.query(models.Patient).count()
    pending = db.query(models.FollowUpTask).filter(models.FollowUpTask.status.in_(['pending', 'in-progress'])).count()
    high_priority = db.query(models.Patient).filter(models.Patient.priority_level == 'high-priority').count()
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
        next_task = tasks[0].title if tasks else "No pending tasks"
        due = tasks[0].due_date if tasks else "-"
        status = "pending" if tasks else "stable"
        
        out.append({
            "id": p.id,
            "patientId": p.id,
            "patientName": p.name,
            "followUp": next_task,
            "dueDate": due,
            "status": status,
            "level": p.priority_level,
            "actionLabel": "Review Now" if p.priority_level == 'immediate-review' else "View",
            # Additional details
            "gender": p.gender,
            "primaryDiagnosis": p.primary_diagnosis,
            "admissionDate": p.admission_date,
            "dischargeDate": p.discharge_date,
            "attendingPhysician": p.attending_physician,
            "contactPhone": p.contact_phone,
            "preferredLanguage": p.preferred_language
        })
        
    # Sort: immediate > high > routine
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

@app.post("/api/doctor/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403)
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Validate extension
    ext = file.filename.split('.')[-1].lower()
    if ext not in ['pdf', 'doc', 'docx', 'xls', 'xlsx']:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    document = models.DischargeDocument(
        original_filename=file.filename,
        file_path=file_path,
        status="needs-manual-review",
        needs_review=True,
        review_reason="Patient identifier could not be confidently matched."
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return {"message": "Document uploaded and flagged for review.", "documentId": document.id}

# ======================= PATIENT DASHBOARD ENDPOINTS =======================

@app.get("/api/patient/me")
def patient_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'patient' or not current_user.patient:
        raise HTTPException(status_code=403, detail="Unauthorized")
    p = current_user.patient
    return {
        "id": p.id,
        "name": p.name,
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
        "type": t.task_type
    } for t in tasks]

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
