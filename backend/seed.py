import random
from datetime import datetime, timedelta, date
from database import SessionLocal, engine
import models
from auth import get_password_hash
from services.sms_service import DLT_TEMPLATES

models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_data():
    # 1. Create doctor user
    doctor = models.User(
        email="doctor@acentra.com",
        hashed_password=get_password_hash("password"),
        role="doctor",
        name="Dr. Meera Patel"
    )
    db.add(doctor)

    # 2. Seed DLT SMS Templates
    for scenario_key, tpl in DLT_TEMPLATES.items():
        sms_tpl = models.SMSTemplate(
            id=f"TPL-{tpl['dlt_id']}",
            dlt_template_id=tpl['dlt_id'],
            scenario=scenario_key,
            language="English",
            template_text=tpl['text']
        )
        db.add(sms_tpl)

    # 3. Seed Ravi Kumar (Core Demonstration Patient for Jury)
    user_ravi = models.User(
        email="ravi@example.com",
        hashed_password=get_password_hash("password"),
        role="patient",
        name="Ravi Kumar"
    )
    db.add(user_ravi)
    db.flush()

    pat_ravi = models.Patient(
        id="MRN-RAVI-001",
        user_id=user_ravi.id,
        name="Ravi Kumar",
        email="ravi@example.com",
        dob="1972-04-15",
        gender="Male",
        primary_diagnosis="Post-PCI Acute Coronary Syndrome",
        admission_date="01 Oct 2026",
        discharge_date="05 Oct 2026",
        attending_physician="Dr. Rajesh Mehta",
        contact_phone="+919876543210",
        preferred_language="English",
        priority_level="high-priority",
        email_consent=True,
        sms_consent=True
    )
    db.add(pat_ravi)
    db.flush()

    # Appointment on 15 October 2026
    appt_ravi = models.Appointment(
        id="APT-RAVI-001",
        patient_id=pat_ravi.id,
        appointment_date=date(2026, 10, 15),
        time_str="10:30 AM",
        doctor_name="Dr. Rajesh Mehta",
        department="Cardiology",
        location="Suite 204 • Heart Center",
        status="scheduled",
        notes="Post-discharge comprehensive cardiology outpatient evaluation"
    )
    db.add(appt_ravi)
    db.flush()

    # Required Test (Blood Test) due 14 October 2026
    test_ravi = models.RequiredTest(
        id="TEST-RAVI-001",
        appointment_id=appt_ravi.id,
        patient_id=pat_ravi.id,
        test_name="Blood Test (Fasting Lipid & Renal Panel)",
        due_date=date(2026, 10, 14),
        status="pending",
        source_doc="Discharge Summary • Page 3",
        notes="Required before 15 Oct cardiology evaluation"
    )
    db.add(test_ravi)

    # Follow-up task for Ravi
    task_ravi = models.FollowUpTask(
        id="FT-RAVI-01",
        patient_id=pat_ravi.id,
        title="Cardiology Specialist Evaluation",
        due_date="15 Oct 2026",
        status="pending",
        task_type="appointment",
        specialty="Cardiology",
        attending="Dr. Rajesh Mehta",
        source="Discharge Summary",
        source_page=2
    )
    db.add(task_ravi)

    task_ravi_blood = models.FollowUpTask(
        id="FT-RAVI-02",
        patient_id=pat_ravi.id,
        title="Fasting Blood Chemistry (Lipid & Renal)",
        due_date="14 Oct 2026",
        status="pending",
        task_type="test",
        specialty="Diagnostic Pathology",
        attending="Dr. Rajesh Mehta",
        source="Discharge Summary",
        source_page=3
    )
    db.add(task_ravi_blood)

    # Initial timeline events for Ravi
    db.add(models.TimelineEvent(
        id="TL-RAVI-1",
        patient_id=pat_ravi.id,
        date_str="05 Oct 2026",
        title="Hospital Discharge & Summary Processed",
        description="Care plan initialized with 15 Oct Cardiology evaluation and 14 Oct required blood test.",
        status="completed",
        event_type="instruction"
    ))
    db.add(models.TimelineEvent(
        id="TL-RAVI-2",
        patient_id=pat_ravi.id,
        date_str="08 Oct 2026",
        title="CareFlow Care Plan Monitoring Active",
        description="Automated tracking active for 14 Oct Fasting Blood Draw and 15 Oct Cardiology Appointment.",
        status="in-progress",
        event_type="appointment"
    ))

    # 4. Seed Automation State
    state = models.AutomationState(
        id=1,
        simulation_date="2026-10-08",
        is_running=True,
        timezone="Asia/Kolkata",
        next_scheduled_run="09:00 AM IST",
        last_run_summary="Initialized with demo simulation baseline (08 Oct 2026)"
    )
    db.add(state)

    # 5. Seed other synthetic patients
    first_names = ["Arun", "Priya", "Rahul", "Neha", "Vikram", "Anjali", "Rohan", "Sneha", "Karthik", "Pooja"]
    last_names = ["Kumar", "Sharma", "Singh", "Patel", "Reddy", "Verma", "Rao", "Das", "Nair", "Iyer"]
    diagnoses = [
        "Acute Myocardial Infarction", "Community-Acquired Pneumonia", "Exacerbation of COPD", 
        "Type 2 Diabetes with Hyperosmolar State", "Post-op Laparoscopic Cholecystectomy", 
        "Ischemic Stroke", "Congestive Heart Failure", "Sepsis secondary to UTI"
    ]
    physicians = ["Dr. Meera Patel", "Dr. Rajesh Mehta", "Dr. S. Menon", "Dr. K. Iyer"]
    
    tasks_types = ['appointment', 'test', 'care-instruction', 'referral']
    statuses = ['completed', 'pending', 'needs-review', 'overdue']
    priority_levels = ['routine', 'high-priority', 'immediate-review']
    
    issue_id_counter = 100
    
    for i in range(10):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        name = f"{fname} {lname}"
        mrn = f"MRN-{1000 + i}"
        
        p_user = models.User(
            email=f"patient{i}@example.com",
            hashed_password=get_password_hash("password"),
            role="patient",
            name=name
        )
        db.add(p_user)
        db.flush()
        
        if i == 0:
            p_user.email = "patient@acentra.com"
            name = "Arun Kumar"
            p_user.name = name
            mrn = "MRN-9281C"
        
        admission = datetime.now() - timedelta(days=random.randint(5, 20))
        discharge = admission + timedelta(days=random.randint(2, 10))
        
        priority = random.choice(priority_levels)
        if i == 0: priority = "immediate-review"
        if i == 1: priority = "high-priority"
        
        pat = models.Patient(
            id=mrn,
            user_id=p_user.id,
            name=name,
            email=p_user.email,
            dob=f"19{random.randint(50, 99)}-0{random.randint(1,9)}-1{random.randint(0,9)}",
            gender=random.choice(["Male", "Female"]),
            primary_diagnosis=random.choice(diagnoses),
            admission_date=admission.strftime("%d %b %Y"),
            discharge_date=discharge.strftime("%d %b %Y"),
            attending_physician=random.choice(physicians),
            contact_phone=f"+91-98765{random.randint(10000, 99999)}",
            preferred_language=random.choice(["English", "Tamil", "Hindi"]),
            priority_level=priority,
            email_consent=True,
            sms_consent=True
        )
        db.add(pat)
        
        # Add sample appointment & test
        appt_sample = models.Appointment(
            id=f"APT-{mrn}",
            patient_id=pat.id,
            appointment_date=date(2026, 10, 15) if i == 0 else (datetime.now() + timedelta(days=random.randint(2, 10))).date(),
            time_str="11:00 AM",
            doctor_name=pat.attending_physician,
            department="Cardiology" if "Infarction" in pat.primary_diagnosis else "Internal Medicine",
            location="Room 302 • Outpatient Pavilion",
            status="scheduled"
        )
        db.add(appt_sample)

        num_tasks = random.randint(3, 5)
        for t in range(num_tasks):
            t_status = random.choice(statuses)
            due = discharge + timedelta(days=random.randint(-2, 14))
            
            days_ov = None
            if t_status == 'overdue':
                days_ov = random.randint(1, 10)
                due = datetime.now() - timedelta(days=days_ov)
            elif due < datetime.now() and t_status != 'completed':
                t_status = 'pending'
                due = datetime.now() + timedelta(days=random.randint(1, 5))
                
            task = models.FollowUpTask(
                id=f"T{i}-{t}",
                patient_id=mrn,
                title=f"Follow-up Task {t+1}",
                due_date=due.strftime("%d %b %Y"),
                status=t_status,
                task_type=random.choice(tasks_types),
                specialty="General Medicine",
                attending=pat.attending_physician,
                source="Discharge Summary",
                source_page=random.randint(1, 4),
                days_overdue=days_ov
            )
            db.add(task)
            
            tl = models.TimelineEvent(
                id=f"TL{i}-{t}",
                patient_id=mrn,
                date_str=due.strftime("%d %b"),
                title=f"Timeline for {task.title}",
                description="Status update",
                status=task.status,
                event_type="appointment"
            )
            db.add(tl)
            
        if priority == "immediate-review" or random.random() > 0.7:
            issue = models.NeedsReviewIssue(
                id=f"NR{issue_id_counter}",
                patient_id=mrn,
                document_id=None,
                category=random.choice(["medication-reconciliation", "scheduling-conflict"]),
                issue="Ambiguous clinical instruction found in text.",
                extracted_text="Review in 3 days vs review in 3 weeks",
                flag_reason="Conflicting timeframes",
                source="Discharge Summary",
                page=2,
                status="active"
            )
            db.add(issue)
            issue_id_counter += 1

    db.commit()
    print("Database seeded with synthetic patients, Ravi Kumar demo core, and DLT SMS templates!")

if __name__ == "__main__":
    seed_data()
