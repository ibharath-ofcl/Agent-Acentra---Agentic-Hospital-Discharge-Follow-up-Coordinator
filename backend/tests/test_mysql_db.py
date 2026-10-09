import unittest
import os
import sys
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text, inspect
from database import engine, SessionLocal, get_db
import models

class TestMySQLDatabaseConnectivity(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_engine_dialect_and_connectivity(self):
        """Verify engine connects to MySQL and executes basic queries."""
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1 AS ping, DATABASE() AS current_db, VERSION() AS mysql_ver"))
            row = result.fetchone()
            self.assertIsNotNone(row)
            self.assertEqual(row[0], 1)
            self.assertIn("careflow_db", str(row[1]))
            print(f"\n[PASS] MySQL Connection Active: DB={row[1]}, Version={row[2]}")

    def test_02_required_tables_exist(self):
        """Verify all required tables exist in the schema."""
        inspector = inspect(engine)
        tables = inspector.get_table_names() + inspector.get_view_names()
        
        required_tables = [
            "patients",
            "appointments",
            "required_tests",
            "notification_logs",
            "sms_templates",
            "automation_state",
            "users",
            "followup_tasks",
            "timeline_events"
        ]
        
        for table in required_tables:
            self.assertIn(table, tables, f"Table '{table}' not found in database tables: {tables}")
            print(f"[PASS] Table '{table}' verified.")

    def test_03_read_seeded_data(self):
        """Verify reading patients, appointments, tests, and templates from MySQL."""
        patients = self.db.query(models.Patient).all()
        self.assertGreater(len(patients), 0, "No patients found in database.")
        
        # Verify core demo patient Ravi Kumar
        ravi = self.db.query(models.Patient).filter(models.Patient.id == "MRN-RAVI-001").first()
        self.assertIsNotNone(ravi, "Patient Ravi Kumar (MRN-RAVI-001) not found.")
        self.assertEqual(ravi.name, "Ravi Kumar")
        self.assertEqual(ravi.email, "ravi@example.com")
        
        # Verify appointment
        appt = self.db.query(models.Appointment).filter(models.Appointment.patient_id == "MRN-RAVI-001").first()
        self.assertIsNotNone(appt, "Appointment for Ravi Kumar not found.")
        self.assertEqual(appt.doctor_name, "Dr. Rajesh Mehta")
        
        # Verify required test
        req_test = self.db.query(models.RequiredTest).filter(models.RequiredTest.patient_id == "MRN-RAVI-001").first()
        self.assertIsNotNone(req_test, "Required test for Ravi Kumar not found.")
        self.assertIn(req_test.status, ["pending", "completed"])
        
        # Verify SMS templates
        templates = self.db.query(models.SMSTemplate).all()
        self.assertGreaterEqual(len(templates), 6, "Expected at least 6 DLT templates.")
        
        print(f"[PASS] Data Read Verified: {len(patients)} Patients, Ravi Kumar MRN={ravi.id}, {len(templates)} SMS Templates.")

    def test_04_safe_write_and_read_back(self):
        """Perform a safe write, verify retrieval, and clean up."""
        test_notif_id = f"NOTIF-TEST-SAFE-WRITE-{int(datetime.datetime.utcnow().timestamp())}"
        
        test_notif = models.NotificationLog(
            id=test_notif_id,
            patient_id="MRN-RAVI-001",
            appointment_id="APT-RAVI-001",
            test_id="TEST-RAVI-001",
            scenario="test_missing_early",
            channel="email",
            status="simulated",
            subject="MySQL Connectivity Audit Test Notification",
            message="CareFlow AI automated database verification payload.",
            provider_message_id="AUDIT-PROV-12345",
            ai_generation_mode="audit_test",
            recipient_email="ravi@example.com",
            is_demo=True,
            simulation_date="2026-10-08"
        )
        
        # Write
        self.db.add(test_notif)
        self.db.commit()
        
        # Read back in fresh query
        retrieved = self.db.query(models.NotificationLog).filter(models.NotificationLog.id == test_notif_id).first()
        self.assertIsNotNone(retrieved, "Failed to retrieve written record.")
        self.assertEqual(retrieved.subject, "MySQL Connectivity Audit Test Notification")
        self.assertEqual(retrieved.status, "simulated")
        self.assertEqual(retrieved.provider_message_id, "AUDIT-PROV-12345")
        
        # Clean up
        self.db.delete(retrieved)
        self.db.commit()
        
        deleted_check = self.db.query(models.NotificationLog).filter(models.NotificationLog.id == test_notif_id).first()
        self.assertIsNone(deleted_check, "Failed to delete test record during teardown.")
        
        print(f"[PASS] Safe Write / Read / Teardown verified successfully in MySQL.")

if __name__ == "__main__":
    unittest.main()
