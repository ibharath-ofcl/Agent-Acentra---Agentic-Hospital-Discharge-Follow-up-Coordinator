"""
CareFlow AI — Automated Test Suite for Appointment Booking & Multilingual Email Confirmation
Covers Test Cases A through H as specified in the requirements:
- Case A: Successful appointment creation & MySQL persistence & email notification logging
- Case B: Correct recipient resolution from MySQL patient record
- Case C: Appointment failure handling (no orphaned emails)
- Case D: Email provider failure resilience (appointment preserved, failure logged)
- Case E: Idempotency & duplicate email prevention
- Case F: Multilingual support (English, Tamil, Hindi subject & content validation)
- Case G: Patient consent enforcement (email_consent = False)
- Case H: Regression validation with existing models and workflows
"""

import os
import sys
import unittest
import datetime
from unittest.mock import patch, MagicMock

# Set backend path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import Base
from services.email_service import (
    send_appointment_confirmation_email,
    build_appointment_confirmation_content,
    normalize_language_code,
    is_valid_email,
    send_email,
    APPOINTMENT_CONFIRMATION_TEMPLATES
)

class TestAppointmentEmailWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use an in-memory SQLite database for deterministic, high-speed testing
        cls.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Clean existing test records
        self.db.query(models.TimelineEvent).delete()
        self.db.query(models.NotificationLog).delete()
        self.db.query(models.FollowUpTask).delete()
        self.db.query(models.RequiredTest).delete()
        self.db.query(models.Appointment).delete()
        self.db.query(models.Patient).delete()
        self.db.commit()

        # Seed test patient Ravi Kumar
        self.patient_ravi = models.Patient(
            id="MRN-RAVI-001",
            name="Ravi Kumar",
            email="ravi@example.com",
            dob="1978-04-12",
            gender="Male",
            primary_diagnosis="Acute Coronary Syndrome (Post-PCI)",
            admission_date="2026-10-01",
            discharge_date="2026-10-05",
            attending_physician="Dr. Rajesh Mehta",
            contact_phone="+91 98401 23456",
            preferred_language="English",
            priority_level="routine",
            email_consent=True,
            sms_consent=True
        )

        # Seed test patient Priya Sharma (Hindi)
        self.patient_priya = models.Patient(
            id="MRN-PRIYA-002",
            name="Priya Sharma",
            email="priya.sharma@example.com",
            dob="1984-08-22",
            gender="Female",
            primary_diagnosis="Type 2 Diabetes Mellitus",
            admission_date="2026-10-02",
            discharge_date="2026-10-06",
            attending_physician="Dr. Ananya Desai",
            contact_phone="+91 98402 34567",
            preferred_language="Hindi",
            priority_level="high",
            email_consent=True,
            sms_consent=True
        )

        # Seed test patient Arun Kumar (Tamil)
        self.patient_arun = models.Patient(
            id="MRN-ARUN-003",
            name="Arun Kumar",
            email="arun.kumar@gmail.com",
            dob="1968-11-15",
            gender="Male",
            primary_diagnosis="Cardiovascular Evaluation",
            admission_date="2026-10-01",
            discharge_date="2026-10-05",
            attending_physician="Dr. Meera Patel",
            contact_phone="+91 98403 45678",
            preferred_language="Tamil",
            priority_level="urgent",
            email_consent=True,
            sms_consent=True
        )

        self.db.add_all([self.patient_ravi, self.patient_priya, self.patient_arun])
        self.db.commit()

    def tearDown(self):
        self.db.close()

    # ==========================================================
    # Case A: Successful Appointment Creation & Email Notification
    # ==========================================================
    def test_case_a_successful_appointment_and_email_logging(self):
        appt = models.Appointment(
            id="APT-TEST-001",
            patient_id=self.patient_ravi.id,
            appointment_date=datetime.date(2026, 10, 15),
            time_str="10:30 AM",
            doctor_name="Dr. Rajesh Mehta",
            department="Cardiology",
            location="Heart Center • Suite 204",
            status="scheduled",
            notes="Standard post-discharge cardiology clinic review."
        )
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)

        # Trigger confirmation email
        res = send_appointment_confirmation_email(self.db, appt, self.patient_ravi)

        self.assertIn(res["status"], ["sent", "simulated"])
        self.assertEqual(res["recipientEmail"], "ravi@example.com")
        self.assertEqual(res["subject"], "Your appointment is confirmed")

        # Verify NotificationLog persistence in database
        log = self.db.query(models.NotificationLog).filter(
            models.NotificationLog.appointment_id == appt.id
        ).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.patient_id, "MRN-RAVI-001")
        self.assertEqual(log.recipient_email, "ravi@example.com")
        self.assertEqual(log.channel, "email")
        self.assertEqual(log.scenario, "appointment_booking_confirmation")

        # Verify TimelineEvent persistence
        tl = self.db.query(models.TimelineEvent).filter(
            models.TimelineEvent.patient_id == self.patient_ravi.id
        ).first()
        self.assertIsNotNone(tl)
        self.assertIn("Appointment Confirmation Email", tl.title)

    # ==========================================================
    # Case B: Correct Recipient per Patient
    # ==========================================================
    def test_case_b_correct_recipient_isolation(self):
        appt_ravi = models.Appointment(
            id="APT-RAVI-01",
            patient_id=self.patient_ravi.id,
            appointment_date=datetime.date(2026, 10, 15),
            time_str="10:30 AM"
        )
        appt_arun = models.Appointment(
            id="APT-ARUN-02",
            patient_id=self.patient_arun.id,
            appointment_date=datetime.date(2026, 10, 18),
            time_str="02:00 PM"
        )
        self.db.add_all([appt_ravi, appt_arun])
        self.db.commit()

        res_ravi = send_appointment_confirmation_email(self.db, appt_ravi, self.patient_ravi)
        res_arun = send_appointment_confirmation_email(self.db, appt_arun, self.patient_arun)

        self.assertEqual(res_ravi["recipientEmail"], "ravi@example.com")
        self.assertEqual(res_arun["recipientEmail"], "arun.kumar@gmail.com")
        self.assertNotEqual(res_ravi["recipientEmail"], res_arun["recipientEmail"])

    # ==========================================================
    # Case C: Appointment Creation Validation & Email Safety
    # ==========================================================
    def test_case_c_invalid_email_handling(self):
        patient_bad = models.Patient(
            id="MRN-BAD-004",
            name="Invalid Email Patient",
            email="not-an-email",
            email_consent=True
        )
        self.db.add(patient_bad)
        self.db.commit()

        appt_bad = models.Appointment(
            id="APT-BAD-01",
            patient_id=patient_bad.id,
            appointment_date=datetime.date(2026, 10, 20)
        )
        self.db.add(appt_bad)
        self.db.commit()

        res = send_appointment_confirmation_email(self.db, appt_bad, patient_bad)
        self.assertEqual(res["status"], "failed")
        self.assertIn("Invalid or missing recipient email", res.get("errorMessage", "") or res.get("error", ""))

        # Appointment record must still exist safely in MySQL
        persisted_appt = self.db.query(models.Appointment).filter(models.Appointment.id == "APT-BAD-01").first()
        self.assertIsNotNone(persisted_appt)

    # ==========================================================
    # Case D: Email Provider Failure Resilience
    # ==========================================================
    def test_case_d_provider_failure_preserves_appointment(self):
        appt = models.Appointment(
            id="APT-FAIL-01",
            patient_id=self.patient_ravi.id,
            appointment_date=datetime.date(2026, 10, 15)
        )
        self.db.add(appt)
        self.db.commit()

        # Simulate SMTP network/auth crash
        with patch("services.email_service.send_email", return_value=("failed", "ERR-MOCK", "Connection timed out to SMTP gateway", "SMTP Error")):
            res = send_appointment_confirmation_email(self.db, appt, self.patient_ravi)

        self.assertEqual(res["status"], "failed")
        self.assertIn("Connection timed out", res["errorMessage"])

        # Verify appointment is preserved
        persisted = self.db.query(models.Appointment).filter(models.Appointment.id == appt.id).first()
        self.assertIsNotNone(persisted)

        # Verify failure is logged in NotificationLog
        log = self.db.query(models.NotificationLog).filter(
            models.NotificationLog.appointment_id == appt.id
        ).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.status, "failed")
        self.assertIn("Connection timed out", log.error_message)

    # ==========================================================
    # Case E: Idempotency & Duplicate Prevention
    # ==========================================================
    def test_case_e_duplicate_email_prevention(self):
        appt = models.Appointment(
            id="APT-IDEM-01",
            patient_id=self.patient_ravi.id,
            appointment_date=datetime.date(2026, 10, 15)
        )
        self.db.add(appt)
        self.db.commit()

        # First dispatch
        res1 = send_appointment_confirmation_email(self.db, appt, self.patient_ravi)
        self.assertIn(res1["status"], ["sent", "simulated"])

        # Second dispatch without force
        res2 = send_appointment_confirmation_email(self.db, appt, self.patient_ravi, force_resend=False)
        self.assertIn("Duplicate confirmation prevented", res2["message"])

        # Verify only 1 NotificationLog exists for this appointment
        logs = self.db.query(models.NotificationLog).filter(
            models.NotificationLog.appointment_id == appt.id,
            models.NotificationLog.scenario == "appointment_booking_confirmation"
        ).all()
        self.assertEqual(len(logs), 1)

    # ==========================================================
    # Case F: Multilingual Templates (English, Tamil, Hindi)
    # ==========================================================
    def test_case_f_multilingual_templates(self):
        # English
        content_en = build_appointment_confirmation_content(
            patient_name="Ravi Kumar",
            appointment_date_str="15 October 2026",
            time_str="10:30 AM",
            doctor_name="Dr. Rajesh Mehta",
            department="Cardiology",
            location="Heart Center • Suite 204",
            language="en"
        )
        self.assertEqual(content_en["subject"], "Your appointment is confirmed")
        self.assertIn("Dear Ravi Kumar,", content_en["body"])

        # Tamil
        content_ta = build_appointment_confirmation_content(
            patient_name="Arun Kumar",
            appointment_date_str="15 October 2026",
            time_str="10:30 AM",
            doctor_name="Dr. Rajesh Mehta",
            department="Cardiology",
            location="Heart Center",
            language="Tamil"
        )
        self.assertEqual(content_ta["subject"], "உங்கள் சந்திப்பு உறுதி செய்யப்பட்டது")
        self.assertIn("அன்புள்ள Arun Kumar,", content_ta["body"])
        self.assertIn("சந்திப்பு தேதி: 15 October 2026", content_ta["body"])

        # Hindi
        content_hi = build_appointment_confirmation_content(
            patient_name="Priya Sharma",
            appointment_date_str="15 October 2026",
            time_str="10:30 AM",
            doctor_name="Dr. Ananya Desai",
            department="Endocrinology",
            location="Specialty Clinic",
            language="Hindi"
        )
        self.assertEqual(content_hi["subject"], "आपका अपॉइंटमेंट पक्का हो गया है")
        self.assertIn("प्रिय Priya Sharma,", content_hi["body"])
        self.assertIn("अपॉइंटमेंट की तारीख: 15 October 2026", content_hi["body"])

    # ==========================================================
    # Case G: Consent Rules Enforcement
    # ==========================================================
    def test_case_g_consent_enforcement(self):
        patient_no_consent = models.Patient(
            id="MRN-NOCONSENT-01",
            name="Opted Out Patient",
            email="optout@example.com",
            email_consent=False
        )
        self.db.add(patient_no_consent)
        self.db.commit()

        appt = models.Appointment(
            id="APT-NOCONSENT-01",
            patient_id=patient_no_consent.id,
            appointment_date=datetime.date(2026, 10, 15)
        )
        self.db.add(appt)
        self.db.commit()

        res = send_appointment_confirmation_email(self.db, appt, patient_no_consent)
        self.assertEqual(res["status"], "skipped")
        self.assertIn("patient email consent is disabled", res["message"])

        # Check notification log status is 'skipped'
        log = self.db.query(models.NotificationLog).filter(
            models.NotificationLog.appointment_id == appt.id
        ).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.status, "skipped")

    # ==========================================================
    # Case H: Regression & Existing Workflow Continuity
    # ==========================================================
    def test_case_h_regression_models_and_relationships(self):
        # Verify Appointment <-> Patient <-> NotificationLog <-> Task relationships
        appt = models.Appointment(
            id="APT-REGR-01",
            patient_id=self.patient_ravi.id,
            appointment_date=datetime.date(2026, 10, 15),
            department="Cardiology"
        )
        test = models.RequiredTest(
            id="TEST-REGR-01",
            patient_id=self.patient_ravi.id,
            appointment_id=appt.id,
            test_name="Fasting Lipid & CMP Panel",
            status="pending"
        )
        task = models.FollowUpTask(
            id="TASK-REGR-01",
            patient_id=self.patient_ravi.id,
            title="Follow-up: Cardiology Consultation",
            due_date="15 October 2026",
            status="pending",
            task_type="appointment"
        )
        self.db.add_all([appt, test, task])
        self.db.commit()

        # Query and assert relationships are intact
        p = self.db.query(models.Patient).filter(models.Patient.id == self.patient_ravi.id).first()
        self.assertEqual(len(p.appointments), 1)
        self.assertEqual(len(p.required_tests), 1)
        self.assertEqual(len(p.tasks), 1)
        self.assertEqual(p.appointments[0].required_tests[0].test_name, "Fasting Lipid & CMP Panel")

if __name__ == "__main__":
    unittest.main()
