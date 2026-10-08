import random
from datetime import datetime, timedelta
from database import SessionLocal, engine
import models
from auth import get_password_hash

models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_data():
    # Create doctor user
    doctor = models.User(
        email="doctor@acentra.com",
        hashed_password=get_password_hash("password"),
        role="doctor",
        name="Dr. Meera Patel"
    )
    db.add(doctor)
    
    first_names = ["Arun", "Priya", "Rahul", "Neha", "Vikram", "Anjali", "Rohan", "Sneha", "Karthik", "Pooja", "Amit", "Deepa", "Suresh", "Lakshmi", "Raj", "Meena"]
    last_names = ["Kumar", "Sharma", "Singh", "Patel", "Reddy", "Verma", "Rao", "Das", "Nair", "Iyer", "Gupta", "Menon"]
    diagnoses = [
        "Acute Myocardial Infarction", "Community-Acquired Pneumonia", "Exacerbation of COPD", 
        "Type 2 Diabetes with Hyperosmolar State", "Post-op Laparoscopic Cholecystectomy", 
        "Ischemic Stroke", "Congestive Heart Failure", "Sepsis secondary to UTI"
    ]
    physicians = ["Dr. Meera Patel", "Dr. Rajesh Raj", "Dr. S. Menon", "Dr. K. Iyer"]
    
    tasks_types = ['appointment', 'test', 'care-instruction', 'referral']
    statuses = ['completed', 'pending', 'needs-review', 'overdue']
    priority_levels = ['routine', 'high-priority', 'immediate-review']
    
    # Needs review issues tracking
    issue_id_counter = 100
    
    for i in range(15):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        name = f"{fname} {lname}"
        mrn = f"MRN-{1000 + i}"
        
        # Patient User
        p_user = models.User(
            email=f"patient{i}@example.com",
            hashed_password=get_password_hash("password"),
            role="patient",
            name=name
        )
        db.add(p_user)
        db.flush() # get user ID
        
        # For the first patient, match the frontend demo data explicitly if possible via email "patient@acentra.com"
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
            dob=f"19{random.randint(50, 99)}-0{random.randint(1,9)}-1{random.randint(0,9)}",
            gender=random.choice(["Male", "Female"]),
            primary_diagnosis=random.choice(diagnoses),
            admission_date=admission.strftime("%d %b %Y"),
            discharge_date=discharge.strftime("%d %b %Y"),
            attending_physician=random.choice(physicians),
            contact_phone=f"+91-98765{random.randint(10000, 99999)}",
            preferred_language=random.choice(["English", "Tamil", "Hindi"]),
            priority_level=priority
        )
        db.add(pat)
        
        # Follow-up tasks
        num_tasks = random.randint(3, 6)
        for t in range(num_tasks):
            t_status = random.choice(statuses)
            due = discharge + timedelta(days=random.randint(-2, 14))
            
            # Make sure at least someone has overdue tasks
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
            
            # Timeline Event
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
            
        # Review Issues
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
    print("Database seeded with synthetic patients!")

if __name__ == "__main__":
    seed_data()
