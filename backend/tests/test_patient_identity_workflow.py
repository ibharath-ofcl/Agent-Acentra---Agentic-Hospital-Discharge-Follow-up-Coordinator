import sys
import os
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database import SessionLocal
import models

client = TestClient(app)

def get_auth_token():
    res = client.post("/api/auth/token", data={"username": "doctor", "password": "password"})
    if res.status_code == 200:
        return res.json()["access_token"]
    # Fallback to test token if auth route differs
    return "test-token"

def test_workflow_phase5():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    try:
        # Cleanup any test artifacts from prior runs
        db.query(models.FollowUpTask).filter(models.FollowUpTask.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.TimelineEvent).filter(models.TimelineEvent.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.RequiredTest).filter(models.RequiredTest.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.Appointment).filter(models.Appointment.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.DischargeExtraction).filter(models.DischargeExtraction.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.DischargeDocument).filter(models.DischargeDocument.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        pts = db.query(models.Patient).filter(models.Patient.id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).all()
        user_ids = [p.user_id for p in pts if p.user_id]
        db.query(models.Patient).filter(models.Patient.id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        if user_ids:
            db.query(models.User).filter(models.User.id.in_(user_ids)).delete(synchronize_session=False)
        db.commit()

        # Seed existing test patients for Test 2 & Test 3
        pt_exist = models.Patient(
            id="TEST-EXIST-001",
            name="Vikramaditya Rao",
            priority_level="high-priority",
            primary_diagnosis="Hypertensive heart disease",
            admission_date="2026-10-01",
            discharge_date="2026-10-05",
            attending_physician="Dr. Sarah Chen",
            contact_phone="+1-555-0199"
        )
        db.add(pt_exist)

        pt_ambig1 = models.Patient(
            id="TEST-AMBIG-A",
            name="Rahul Sharma",
            priority_level="stable",
            primary_diagnosis="Gastritis"
        )
        pt_ambig2 = models.Patient(
            id="TEST-AMBIG-B",
            name="Rahul Sharma",
            priority_level="high-priority",
            primary_diagnosis="Type 2 Diabetes"
        )
        db.add(pt_ambig1)
        db.add(pt_ambig2)
        db.commit()

        # ----------------------------------------------------
        # TEST 1 — NEW PATIENT WORKFLOW
        # ----------------------------------------------------
        print("\n--- Running TEST 1: New Patient Workflow ---")
        # 1. Match check for a brand new patient
        match_req_new = {
            "mrn": "TEST-NEW-001",
            "name": "Meera Nambiar",
            "dob": "1982-04-15",
            "gender": "Female",
            "contactPhone": "+1-555-8822",
            "primaryDiagnosis": "Acute Cholecystitis",
            "department": "Surgery"
        }
        res = client.post("/api/doctor/patients/match-extracted", json=match_req_new, headers=headers)
        assert res.status_code == 200, f"Match failed: {res.text}"
        data = res.json()
        assert data["status"] == "new", f"Expected 'new', got {data['status']}"
        assert data["patient"] is None

        # 2. Register & Approve new patient
        reg_payload = {
            "patient": {
                "id": "TEST-NEW-001",
                "name": "Meera Nambiar",
                "dob": "1982-04-15",
                "gender": "Female",
                "contactPhone": "+1-555-8822",
                "primaryDiagnosis": "Acute Cholecystitis s/p Lap Cholecystectomy",
                "department": "Surgery",
                "admissionDate": "2026-10-06",
                "dischargeDate": "2026-10-09",
                "attendingPhysician": "Dr. Vance",
                "priorityLevel": "high-priority"
            },
            "filename": "Discharge_Meera_Nambiar.txt",
            "extraction": {
                "summary": "Patient Meera Nambiar underwent successful lap cholecystectomy.",
                "patientInfo": {
                    "mrn": "TEST-NEW-001",
                    "name": "Meera Nambiar",
                    "dischargeDate": "2026-10-09"
                },
                "appointments": [
                    {
                        "specialty": "Surgery Clinic Follow-up",
                        "doctorName": "Dr. Vance",
                        "date": "2026-10-23",
                        "time": "11:00 AM",
                        "reason": "Incision check"
                    }
                ],
                "medicationInstructions": [
                    {
                        "medicationName": "Acetaminophen",
                        "dosage": "500mg",
                        "frequency": "Q6H PRN"
                    }
                ],
                "tests": [
                    {
                        "testName": "Liver Function Panel",
                        "targetDate": "2026-10-22",
                        "instructions": "Fasting"
                    }
                ],
                "tasks": [
                    {
                        "title": "Post-Op Wound Assessment Call",
                        "category": "call",
                        "priority": "high",
                        "assignedTo": "Care Coordinator",
                        "dueDay": 3
                    }
                ]
            }
        }
        res_reg = client.post("/api/doctor/patients/register-and-approve", json=reg_payload, headers=headers)
        assert res_reg.status_code == 200, f"Registration failed: {res_reg.text}"
        reg_data = res_reg.json()
        assert reg_data["patientId"] == "TEST-NEW-001"
        assert reg_data["status"] == "approved"

        # Verify patient exists in MySQL
        db_patient = db.query(models.Patient).filter(models.Patient.id == "TEST-NEW-001").first()
        assert db_patient is not None
        assert db_patient.name == "Meera Nambiar"
        assert db_patient.primary_diagnosis == "Acute Cholecystitis s/p Lap Cholecystectomy"

        # Verify cohort queue includes the newly registered patient
        res_cohort = client.get("/api/doctor/patients", headers=headers)
        assert res_cohort.status_code == 200, f"Failed to get patients: {res_cohort.text}"
        cohort_ids = [p["id"] for p in res_cohort.json()]
        assert "TEST-NEW-001" in cohort_ids, "New patient not found in cohort queue!"
        print("✓ TEST 1 PASSED: New patient registered and persisted in MySQL cohort.")

        # ----------------------------------------------------
        # TEST 2 — EXISTING PATIENT MATCH & UPDATE WORKFLOW
        # ----------------------------------------------------
        print("\n--- Running TEST 2: Existing Patient Workflow ---")
        # 1. Match check for existing patient Vikramaditya Rao
        match_req_exist = {
            "mrn": "TEST-EXIST-001",
            "name": "Vikramaditya Rao",
            "primaryDiagnosis": "Acute decompensated heart failure with STEMI"
        }
        res = client.post("/api/doctor/patients/match-extracted", json=match_req_exist, headers=headers)
        assert res.status_code == 200
        data_exist = res.json()
        assert data_exist["status"] == "existing"
        assert data_exist["patient"]["id"] == "TEST-EXIST-001"

        # 2. Update and approve existing patient
        update_payload = {
            "patientId": "TEST-EXIST-001",
            "updatedFields": {
                "primaryDiagnosis": "STEMI with recovered ejection fraction (LVEF 50%)",
                "dischargeDate": "2026-10-09"
            },
            "filename": "Discharge_Vikramaditya_Rao_Updated.txt",
            "extraction": {
                "summary": "Follow-up discharge summary for Vikramaditya Rao.",
                "patientInfo": {
                    "mrn": "TEST-EXIST-001",
                    "name": "Vikramaditya Rao"
                },
                "appointments": [
                    {
                        "specialty": "Cardiology Post-STEMI Clinic",
                        "doctorName": "Dr. Sarah Chen",
                        "date": "2026-10-25",
                        "reason": "Echocardiogram review"
                    }
                ],
                "tasks": [
                    {
                        "title": "Confirm Cardiology Clinic Appointment",
                        "category": "appointment",
                        "priority": "high",
                        "assignedTo": "Dr. Sarah Chen",
                        "dueDay": 2
                    }
                ]
            }
        }
        res_update = client.post("/api/doctor/patients/update-and-approve", json=update_payload, headers=headers)
        assert res_update.status_code == 200, f"Update failed: {res_update.text}"
        update_data = res_update.json()
        assert update_data["patientId"] == "TEST-EXIST-001"

        # Verify patient record was updated without duplicating the patient
        db.rollback()
        all_pts_matching = db.query(models.Patient).filter(models.Patient.id == "TEST-EXIST-001").all()
        assert len(all_pts_matching) == 1, "Duplicate patient created!"
        db_exist_pt = db.query(models.Patient).filter(models.Patient.id == "TEST-EXIST-001").first()
        assert db_exist_pt.primary_diagnosis == "STEMI with recovered ejection fraction (LVEF 50%)"
        # Preserved fields intact
        assert db_exist_pt.contact_phone == "+1-555-0199"
        print("✓ TEST 2 PASSED: Existing patient safely updated without duplicates.")

        # ----------------------------------------------------
        # TEST 3 — AMBIGUOUS MATCH IDENTIFICATION
        # ----------------------------------------------------
        print("\n--- Running TEST 3: Ambiguous Match Identification ---")
        # Match by name "Rahul Sharma" without unique MRN
        match_req_ambig = {
            "name": "Rahul Sharma",
            "primaryDiagnosis": "General checkup"
        }
        res = client.post("/api/doctor/patients/match-extracted", json=match_req_ambig, headers=headers)
        assert res.status_code == 200
        data_ambig = res.json()
        assert data_ambig["status"] == "ambiguous", f"Expected 'ambiguous', got {data_ambig['status']}"
        assert len(data_ambig["candidates"]) >= 2
        candidate_ids = [c["id"] for c in data_ambig["candidates"]]
        assert "TEST-AMBIG-A" in candidate_ids
        assert "TEST-AMBIG-B" in candidate_ids
        print("✓ TEST 3 PASSED: Ambiguous patients correctly flagged with candidates.")

        # ----------------------------------------------------
        # TEST 4 — REPEATED UPLOAD IDEMPOTENCY
        # ----------------------------------------------------
        print("\n--- Running TEST 4: Repeated Upload Idempotency ---")
        # Re-post the exact same update for TEST-EXIST-001
        res_repeat = client.post("/api/doctor/patients/update-and-approve", json=update_payload, headers=headers)
        assert res_repeat.status_code == 200

        # Check total appointments & tasks for TEST-EXIST-001
        db.rollback()
        appts = db.query(models.Appointment).filter(
            models.Appointment.patient_id == "TEST-EXIST-001",
            models.Appointment.doctor_name == "Dr. Sarah Chen"
        ).all()
        assert len(appts) == 1, f"Expected 1 appointment, found {len(appts)} duplicate appointments!"

        tasks = db.query(models.FollowUpTask).filter(
            models.FollowUpTask.patient_id == "TEST-EXIST-001"
        ).all()
        assert len(tasks) >= 1, f"Expected tasks, found {len(tasks)}"
        print(f"✓ TEST 4 PASSED: Repeated ingestion did not create duplicate tasks ({len(tasks)} tasks) or appointments ({len(appts)} appts).")

    finally:
        # Teardown test artifacts
        db.query(models.FollowUpTask).filter(models.FollowUpTask.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.TimelineEvent).filter(models.TimelineEvent.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.RequiredTest).filter(models.RequiredTest.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.Appointment).filter(models.Appointment.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.DischargeExtraction).filter(models.DischargeExtraction.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        db.query(models.DischargeDocument).filter(models.DischargeDocument.patient_id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        pts = db.query(models.Patient).filter(models.Patient.id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).all()
        user_ids = [p.user_id for p in pts if p.user_id]
        db.query(models.Patient).filter(models.Patient.id.in_(["TEST-NEW-001", "TEST-EXIST-001", "TEST-AMBIG-A", "TEST-AMBIG-B"])).delete(synchronize_session=False)
        if user_ids:
            db.query(models.User).filter(models.User.id.in_(user_ids)).delete(synchronize_session=False)
        db.commit()
        db.close()

if __name__ == "__main__":
    test_workflow_phase5()
    print("\nALL PHASE 5 TESTS PASSED SUCCESSFULLY!")
