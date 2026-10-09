import unittest
import os
import io
import sys
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import get_db, SessionLocal
from models import User, DischargeDocument, FollowUpTask, Appointment, RequiredTest
from auth import create_access_token, get_password_hash

class TestDocumentUploadAndApproval(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

        # Ensure test doctor user
        doctor = self.db.query(User).filter(User.role == "doctor").first()
        if not doctor:
            doctor = User(
                email="test_doctor@careflow.ai",
                hashed_password=get_password_hash("docpass123"),
                role="doctor",
                name="Dr. Test Specialist"
            )
            self.db.add(doctor)
            self.db.commit()
            self.db.refresh(doctor)
        self.doctor_token = create_access_token({"sub": str(doctor.id)})

        # Ensure test patient user
        patient_user = self.db.query(User).filter(User.role == "patient").first()
        if not patient_user:
            patient_user = User(
                email="test_patient@careflow.ai",
                hashed_password=get_password_hash("patpass123"),
                role="patient",
                name="Arun Kumar"
            )
            self.db.add(patient_user)
            self.db.commit()
            self.db.refresh(patient_user)
        self.patient_token = create_access_token({"sub": str(patient_user.id)})

    def tearDown(self):
        self.db.close()

    def test_unauthorized_upload_rejected(self):
        """Verify unauthenticated requests are strictly rejected with 401."""
        file_data = io.BytesIO(b"Unauthorized text")
        response = self.client.post(
            "/api/doctor/upload",
            files={"file": ("unauth.txt", file_data, "text/plain")}
        )
        self.assertEqual(response.status_code, 401)

    def test_upload_text_file_and_extraction(self):
        """Test uploading a text discharge summary with doctor auth and validating database record creation."""
        sample_text = b"""PATIENT DISCHARGE SUMMARY
Hospital: City Medical Center
Patient Name: Arun Kumar | MRN: P001 | Age: 58 | Gender: Male
Admit Date: 2026-10-01 | Discharge Date: 2026-10-05
Attending: Dr. Rajesh Mehta

DIAGNOSIS: Acute Inferior STEMI status post PCI to RCA.

MEDICATIONS:
1. Aspirin 81 mg daily with breakfast.
2. Clopidogrel 75 mg daily.
3. Atorvastatin 40 mg at bedtime.

APPOINTMENTS:
- Cardiology Clinic Follow-up with Dr. Rajesh Mehta on 2026-10-15 at 10:30 AM.
- Fasting lipid and renal blood panel on 2026-10-14 at 08:00 AM.
"""
        file_data = io.BytesIO(sample_text)
        response = self.client.post(
            "/api/doctor/upload",
            headers={"Authorization": f"Bearer {self.doctor_token}"},
            files={"file": ("discharge_arun.txt", file_data, "text/plain")}
        )
        self.assertEqual(response.status_code, 200, f"Upload failed: {response.text}")
        data = response.json()
        self.assertIn("document_id", data)
        doc_id = data["document_id"]

        # Open a fresh session to read freshly committed record from MySQL
        with SessionLocal() as db_check:
            doc = db_check.query(DischargeDocument).filter(DischargeDocument.id == doc_id).first()
            self.assertIsNotNone(doc)
            self.assertEqual(doc.original_filename, "discharge_arun.txt")

        # Test document detail API
        detail_resp = self.client.get(
            f"/api/doctor/documents/{doc_id}",
            headers={"Authorization": f"Bearer {self.doctor_token}"}
        )
        self.assertEqual(detail_resp.status_code, 200)
        detail_data = detail_resp.json()
        self.assertIn("extraction", detail_data)

        # Test Human Review Approval Gate
        approve_resp = self.client.post(
            f"/api/doctor/documents/{doc_id}/approve",
            headers={"Authorization": f"Bearer {self.doctor_token}"}
        )
        self.assertEqual(approve_resp.status_code, 200)
        approve_data = approve_resp.json()
        self.assertEqual(approve_data["status"], "success")

        # Re-query document to check updated status in fresh session
        with SessionLocal() as db_check2:
            doc_updated = db_check2.query(DischargeDocument).filter(DischargeDocument.id == doc_id).first()
            self.assertEqual(doc_updated.status, "approved")

    def test_upload_invalid_file_type(self):
        """Test uploading an unsupported file extension."""
        file_data = io.BytesIO(b"fake binary content")
        response = self.client.post(
            "/api/doctor/upload",
            headers={"Authorization": f"Bearer {self.doctor_token}"},
            files={"file": ("malicious.exe", file_data, "application/octet-stream")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file format", response.json()["detail"])

    def test_upload_patient_endpoint(self):
        """Test patient portal upload endpoint."""
        file_data = io.BytesIO(b"Patient discharge note text content for self-upload.")
        response = self.client.post(
            "/api/patient/upload",
            headers={"Authorization": f"Bearer {self.patient_token}"},
            files={"file": ("patient_note.txt", file_data, "text/plain")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("document_id", data)
        self.assertEqual(data["status"], "success")

if __name__ == "__main__":
    unittest.main()
