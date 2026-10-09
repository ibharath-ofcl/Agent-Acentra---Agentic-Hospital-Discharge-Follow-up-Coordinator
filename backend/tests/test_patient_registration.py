import os
import sys
import unittest
import datetime
import uuid

# Ensure backend directory is on sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, get_db
import models
from auth import create_access_token, get_password_hash

class TestPatientRegistrationAndCentralizedProfile(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        doctor = cls.db.query(models.User).filter(models.User.role == "doctor").first()
        if not doctor:
            doctor = models.User(
                email="doctor_reg_test@careflow.ai",
                hashed_password=get_password_hash("docpass123"),
                role="doctor",
                name="Dr. Test Specialist"
            )
            cls.db.add(doctor)
            cls.db.commit()
            cls.db.refresh(doctor)
            
        cls.doctor_token = create_access_token({"sub": str(doctor.id)})
        cls.auth_headers = {"Authorization": f"Bearer {cls.doctor_token}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_register_new_patient_success_v1(self):
        """Scenario A & B & C: Successfully register a patient via /api/v1/patients and verify MySQL record."""
        run_tag = uuid.uuid4().hex[:6]
        unique_phone = f"+91 99{uuid.uuid4().int % 100000000:08d}"
        unique_email = f"test.doe.{run_tag}@careflow.test"
        patient_name = f"Test Patient {run_tag}"
        
        payload = {
            "name": patient_name,
            "dob": "1985-06-20",
            "gender": "Male",
            "blood_group": "O+",
            "contact_phone": unique_phone,
            "email": unique_email,
            "address": "45 Greenway Boulevard",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600028",
            "department": "Cardiology",
            "attending_physician": "Dr. Rajesh Mehta",
            "emergency_contact_name": "Mary Doe",
            "emergency_contact_phone": "+91 98765 00112",
            "preferred_language": "English",
            "email_consent": True,
            "sms_consent": True,
            "notes": "Post-op cardiology patient, monitor BP daily."
        }

        res = self.client.post("/api/v1/patients", json=payload)
        self.assertEqual(res.status_code, 200, f"Registration failed: {res.text}")
        data = res.json()
        self.assertEqual(data["status"], "success")
        patient_id = data["patientId"]
        self.assertTrue(patient_id.startswith("MRN-"))
        
        # Verify persistence directly from a fresh DB session
        db_session = SessionLocal()
        try:
            db_patient = db_session.query(models.Patient).filter(models.Patient.id == patient_id).first()
            self.assertIsNotNone(db_patient, "Patient not found in DB")
            self.assertEqual(db_patient.name, patient_name)
            self.assertEqual(db_patient.contact_phone, unique_phone)
            self.assertEqual(db_patient.blood_group, "O+")
            self.assertIsNotNone(db_patient.age)
            self.assertGreaterEqual(db_patient.age, 35)

            # Verify Registration Timeline Event
            tl = db_session.query(models.TimelineEvent).filter(
                models.TimelineEvent.patient_id == patient_id,
                models.TimelineEvent.event_type == "registration"
            ).first()
            self.assertIsNotNone(tl, "Registration timeline event was not created.")
        finally:
            db_session.close()

    def test_02_validation_invalid_info(self):
        """Scenario F: Invalid inputs should fail validation."""
        # Empty name
        res = self.client.post("/api/v1/patients", json={
            "name": "",
            "contact_phone": "+91 9876543210"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("name is required", res.json()["detail"].lower())

        # Future DOB
        future_year = datetime.date.today().year + 5
        res = self.client.post("/api/v1/patients", json={
            "name": "Time Traveler",
            "dob": f"{future_year}-01-01",
            "contact_phone": "+91 9876543210"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("future", res.json()["detail"].lower())

        # Short phone
        res = self.client.post("/api/v1/patients", json={
            "name": "Valid Name",
            "contact_phone": "123"
        })
        self.assertEqual(res.status_code, 400)
        self.assertTrue(any(w in res.json()["detail"].lower() for w in ["phone", "mobile"]))

    def test_03_duplicate_detection_and_override(self):
        """Scenario G: Duplicate detection warns doctor and allows verified distinct registration."""
        run_tag = uuid.uuid4().hex[:6]
        phone = f"+91 92{uuid.uuid4().int % 100000000:08d}"
        payload = {
            "name": f"Kavitha Test {run_tag}",
            "contact_phone": phone,
            "email": f"kavitha.{run_tag}@careflow.test",
            "department": "Neurology"
        }

        # 1st Registration -> Success
        res1 = self.client.post("/api/doctor/patients", json=payload, headers=self.auth_headers)
        self.assertEqual(res1.status_code, 200)

        # 2nd Registration with same phone & no allow_duplicate -> Duplicate Warning (409 Conflict)
        res2 = self.client.post("/api/doctor/patients", json=payload, headers=self.auth_headers)
        self.assertEqual(res2.status_code, 409)
        data2 = res2.json()["detail"]
        self.assertEqual(data2.get("status"), "duplicate_warning")
        self.assertIn("Potential duplicate", data2.get("message", ""))

        # 3rd Registration with allow_duplicate=True -> Succeeds with new MRN
        payload_override = dict(payload)
        payload_override["allow_duplicate"] = True
        res3 = self.client.post("/api/doctor/patients", json=payload_override, headers=self.auth_headers)
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        self.assertEqual(data3.get("status"), "success")
        self.assertNotEqual(data3["patientId"], res1.json()["patientId"])

    def test_04_patient_search_and_centralized_profile(self):
        """Scenario E & Centralized Profile: Search and fetch 360 profile."""
        run_tag = uuid.uuid4().hex[:6]
        phone = f"+91 88{uuid.uuid4().int % 100000000:08d}"
        patient_name = f"Suresh Krishnan {run_tag}"
        reg_payload = {
            "name": patient_name,
            "dob": "1992-08-20",
            "gender": "Male",
            "contact_phone": phone,
            "email": f"suresh.{run_tag}@careflow.ai",
            "department": "Orthopedics",
            "notes": "Follow-up for knee arthroscopy"
        }
        res_reg = self.client.post("/api/doctor/patients", json=reg_payload, headers=self.auth_headers)
        self.assertEqual(res_reg.status_code, 200)
        pat_id = res_reg.json()["patientId"]

        # Search by phone digits
        search_res = self.client.get(f"/api/doctor/patients/search?q={phone[-6:]}", headers=self.auth_headers)
        self.assertEqual(search_res.status_code, 200)
        results = search_res.json()
        self.assertTrue(any(p["id"] == pat_id for p in results))

        # Search by name
        search_name_res = self.client.get(f"/api/doctor/patients/search?q={run_tag}", headers=self.auth_headers)
        self.assertEqual(search_name_res.status_code, 200)
        self.assertTrue(any(p["id"] == pat_id for p in search_name_res.json()))

        # Get Centralized Profile
        prof_res = self.client.get(f"/api/doctor/patients/{pat_id}", headers=self.auth_headers)
        self.assertEqual(prof_res.status_code, 200)
        profile = prof_res.json()
        self.assertEqual(profile["id"], pat_id)
        self.assertEqual(profile["name"], patient_name)
        self.assertEqual(profile["department"], "Orthopedics")

        # Order a Required Test for this patient
        test_payload = {
            "test_name": "X-Ray Right Knee AP & Lateral",
            "due_date": "2026-10-25",
            "notes": "Check joint space and recovery"
        }
        order_res = self.client.post(f"/api/doctor/patients/{pat_id}/tests", json=test_payload, headers=self.auth_headers)
        self.assertEqual(order_res.status_code, 200)
        test_obj = order_res.json()["test"]
        self.assertEqual(test_obj["testName"], "X-Ray Right Knee AP & Lateral")
        test_id = test_obj["id"]

        # Complete the test
        complete_res = self.client.post(f"/api/doctor/tests/{test_id}/complete", headers=self.auth_headers)
        self.assertEqual(complete_res.status_code, 200)
        self.assertEqual(complete_res.json()["newStatus"], "completed")

        # Verify profile has updated completed test
        prof_updated = self.client.get(f"/api/doctor/patients/{pat_id}", headers=self.auth_headers).json()
        self.assertTrue(any(t["id"] == test_id and t["status"] == "completed" for t in prof_updated["requiredTests"]))

if __name__ == "__main__":
    unittest.main()
