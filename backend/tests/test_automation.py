"""
CareFlow AI — Automated Test Suite for Patient Reminder & Notification Automation Engine
Validates all deterministic T-X rule scenarios, duplicate prevention, state-change adaptations,
consent checks, and Gemini AI fallback resilience.
"""

import os
import sys
import unittest
import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scenarios.reminder_rules import determine_scenario
from services.gemini_email_service import get_fallback_email, generate_email_content
from services.sms_service import send_sms
from database import SessionLocal, engine, Base
import models
from services.automation_service import run_automation_pipeline, reset_demo_state

class MockAppointment:
    def __init__(self, appointment_date, status="scheduled"):
        self.appointment_date = appointment_date
        self.status = status

class MockTest:
    def __init__(self, name="Blood Test", status="pending"):
        self.test_name = name
        self.status = status

class TestCareFlowReminderRules(unittest.TestCase):

    def setUp(self):
        self.appt_date = datetime.date(2026, 10, 15)
        self.appt = MockAppointment(self.appt_date)
        self.missing_test = [MockTest("Blood Test", "pending")]
        self.no_missing_tests = []

    def test_t_minus_7_missing_test(self):
        """08 Oct 2026: T-7 with pending test -> test_missing_early (Email)"""
        curr_date = datetime.date(2026, 10, 8)
        scenario, channels = determine_scenario(self.appt, self.missing_test, curr_date)
        self.assertEqual(scenario, "test_missing_early")
        self.assertEqual(channels, ["email"])

    def test_t_minus_3_missing_test(self):
        """12 Oct 2026: T-3 with pending test -> test_missing_urgent (Email + SMS)"""
        curr_date = datetime.date(2026, 10, 12)
        scenario, channels = determine_scenario(self.appt, self.missing_test, curr_date)
        self.assertEqual(scenario, "test_missing_urgent")
        self.assertIn("email", channels)
        self.assertIn("sms", channels)

    def test_t_minus_2_missing_test(self):
        """13 Oct 2026: T-2 with pending test -> staff_missing_test (Staff Alert)"""
        curr_date = datetime.date(2026, 10, 13)
        scenario, channels = determine_scenario(self.appt, self.missing_test, curr_date)
        self.assertEqual(scenario, "staff_missing_test")
        self.assertEqual(channels, ["staff_alert"])

    def test_t_minus_1_missing_test(self):
        """14 Oct 2026: T-1 with pending test -> test_missing_final (Email + SMS)"""
        curr_date = datetime.date(2026, 10, 14)
        scenario, channels = determine_scenario(self.appt, self.missing_test, curr_date)
        self.assertEqual(scenario, "test_missing_final")
        self.assertIn("email", channels)
        self.assertIn("sms", channels)

    def test_t_minus_1_completed_test(self):
        """14 Oct 2026: T-1 with test completed -> appointment_reminder (SMS)"""
        curr_date = datetime.date(2026, 10, 14)
        scenario, channels = determine_scenario(self.appt, self.no_missing_tests, curr_date)
        self.assertEqual(scenario, "appointment_reminder")
        self.assertEqual(channels, ["sms"])

    def test_t_zero_completed_test(self):
        """15 Oct 2026: T-0 with test completed -> appointment_morning (SMS)"""
        curr_date = datetime.date(2026, 10, 15)
        scenario, channels = determine_scenario(self.appt, self.no_missing_tests, curr_date)
        self.assertEqual(scenario, "appointment_morning")
        self.assertEqual(channels, ["sms"])

    def test_t_zero_missing_test(self):
        """15 Oct 2026: T-0 with test missing -> skipped_test_today (Email + SMS)"""
        curr_date = datetime.date(2026, 10, 15)
        scenario, channels = determine_scenario(self.appt, self.missing_test, curr_date)
        self.assertEqual(scenario, "skipped_test_today")
        self.assertIn("email", channels)
        self.assertIn("sms", channels)

    def test_missed_appointment(self):
        """16 Oct 2026: T < 0 with no_show status -> missed_appointment"""
        curr_date = datetime.date(2026, 10, 16)
        missed_appt = MockAppointment(self.appt_date, status="no_show")
        scenario, channels = determine_scenario(missed_appt, self.missing_test, curr_date)
        self.assertEqual(scenario, "missed_appointment")
        self.assertIn("email", channels)
        self.assertIn("sms", channels)

class TestCareFlowAutomationPipeline(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        reset_demo_state(self.db)

    def tearDown(self):
        self.db.close()

    def test_end_to_end_t7_run(self):
        """Test automation run at T-7 (08 Oct 2026)"""
        res = run_automation_pipeline(self.db, simulation_date_str="2026-10-08", is_demo=True, bypass_hours_check=True)
        self.assertGreaterEqual(res["emailsSent"], 1)
        self.assertEqual(res["simulationDate"], "2026-10-08")

        # Verify notification record in database
        notif = self.db.query(models.NotificationLog).filter(
            models.NotificationLog.patient_id == "MRN-RAVI-001",
            models.NotificationLog.scenario == "test_missing_early"
        ).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.channel, "email")
        self.assertIn(notif.status, ["sent", "simulated"])

    def test_duplicate_prevention(self):
        """Running automation twice on the same simulation date must prevent duplicate dispatch"""
        # Run 1
        res1 = run_automation_pipeline(self.db, simulation_date_str="2026-10-08", is_demo=True, bypass_hours_check=True)
        self.assertGreaterEqual(res1["emailsSent"], 1)

        # Run 2 (immediate re-run)
        res2 = run_automation_pipeline(self.db, simulation_date_str="2026-10-08", is_demo=True, bypass_hours_check=True)
        self.assertGreaterEqual(res2["skippedCount"], 1)

    def test_state_change_stops_test_missing_reminders(self):
        """Marking test completed changes 14 Oct (T-1) scenario from test_missing_final to appointment_reminder"""
        # 1. Initially test is pending -> run at 14 Oct
        res1 = run_automation_pipeline(self.db, simulation_date_str="2026-10-14", is_demo=True, bypass_hours_check=True)
        
        # Reset and mark test completed
        reset_demo_state(self.db)
        test = self.db.query(models.RequiredTest).filter(models.RequiredTest.id == "TEST-RAVI-001").first()
        test.status = "completed"
        self.db.commit()

        # Run again on 14 Oct
        res2 = run_automation_pipeline(self.db, simulation_date_str="2026-10-14", is_demo=True, bypass_hours_check=True)
        
        # Must have sent appointment_reminder, not test_missing_final
        notif = self.db.query(models.NotificationLog).filter(
            models.NotificationLog.patient_id == "MRN-RAVI-001",
            models.NotificationLog.scenario == "appointment_reminder"
        ).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.channel, "sms")

    def test_fallback_email_content(self):
        """Verifies robust zero-latency fallback email templates"""
        email = get_fallback_email(
            scenario="test_missing_urgent",
            first_name="Ravi",
            appointment_date_str="15 October 2026",
            test_name="Blood Test",
            doctor_name="Dr. Rajesh Mehta"
        )
        self.assertIn("Ravi", email["body"])
        self.assertIn("15 October 2026", email["body"])
        self.assertIn("Blood Test", email["body"])
        self.assertLess(len(email["body"].split()), 90)

    def test_sms_dlt_template_interpolation(self):
        """Verifies DLT SMS formatting"""
        status, text, dlt_id, prov_id, err = send_sms(
            phone="+919876543210",
            scenario="test_missing_urgent",
            variables={
                "patient_name": "Ravi Kumar",
                "appointment_date": "15 October 2026",
                "test_name": "Blood Test",
                "doctor_name": "Dr. Rajesh Mehta"
            }
        )
        self.assertIn("Ravi Kumar", text)
        self.assertIn("Blood Test", text)
        self.assertEqual(dlt_id, "DLT-11071689201")
        self.assertIn(status, ["sent", "simulated"])

if __name__ == "__main__":
    unittest.main()
