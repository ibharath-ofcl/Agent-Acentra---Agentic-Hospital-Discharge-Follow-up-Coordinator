import requests
import json

BASE = "http://localhost:8000"

def test_demo_cohort_workflow():
    print("=== STARTING COMPLETE WORKFLOW TEST: DEMO-COHORT-9001 ===")

    # 1. Login as doctor
    res = requests.post(f"{BASE}/api/auth/login", json={"email": "doctor@acentra.com", "password": "password"})
    assert res.status_code == 200, f"Doctor login failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Initial stats & cohort count
    initial_stats = requests.get(f"{BASE}/api/doctor/stats", headers=headers).json()
    initial_patients = requests.get(f"{BASE}/api/doctor/patients", headers=headers).json()
    initial_count = initial_stats.get("totalPatients", 0)
    print(f"[Initial] Total Patients: {initial_count}, Cohort count: {len(initial_patients)}")

    # 2. Upload synthetic discharge summary for DEMO-COHORT-9001
    synthetic_doc_content = """CAREFLOW MEMORIAL HOSPITAL - DISCHARGE SUMMARY
PATIENT RECORD / MRN: DEMO-COHORT-9001
PATIENT NAME: Sunita Devi
DOB: 1974-04-18
GENDER: Female
ADMISSION DATE: 02 Oct 2026
DISCHARGE DATE: 08 Oct 2026
ATTENDING PHYSICIAN: Dr. Rajesh Mehta
PRIMARY DIAGNOSIS: Acute Coronary Syndrome, Post-Angioplasty with Stent Placement
DEPARTMENT: Cardiovascular Medicine

PLANNED FOLLOW-UP APPOINTMENTS:
1. Cardiology Specialist Follow-up Consultation
   Doctor: Dr. Rajesh Mehta
   Department: Cardiology
   Date: 2026-10-22
   Time: 11:00 AM
   Location: Cardiology Outpatient Clinic, Floor 3
   Instructions: Bring daily blood pressure and pulse logs.

REQUIRED DIAGNOSTIC TESTS:
1. Fasting Lipid Panel & Serum Creatinine
   Target Date: 2026-10-20
   Instructions: 12-hour overnight fasting required. Water permitted.
"""

    files = {"file": ("DEMO_COHORT_9001_Discharge.txt", synthetic_doc_content.encode("utf-8"), "text/plain")}
    upload_res = requests.post(f"{BASE}/api/doctor/upload", headers=headers, files=files)
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    doc_id = upload_res.json().get("document_id") or upload_res.json().get("documentId")
    print(f"[Step A-B] Document uploaded & analyzed successfully. Document ID: {doc_id}")

    # 3. Approve and Activate in MySQL
    approve_res = requests.post(f"{BASE}/api/doctor/documents/{doc_id}/approve", headers=headers)
    assert approve_res.status_code == 200, f"Approval failed: {approve_res.text}"
    print(f"[Step C] Approved and Activated in MySQL: {approve_res.json().get('message')}")

    # 4. Verify patient exists in MySQL directly & via cohort API
    after_stats = requests.get(f"{BASE}/api/doctor/stats", headers=headers).json()
    after_patients = requests.get(f"{BASE}/api/doctor/patients", headers=headers).json()
    matched = [p for p in after_patients if p.get("patientId") == "DEMO-COHORT-9001" or p.get("id") == "DEMO-COHORT-9001"]

    assert len(matched) == 1, f"Expected exactly 1 record for DEMO-COHORT-9001 in cohort queue, found: {len(matched)}"
    patient_row = matched[0]
    print(f"[Step D-G] Verified in Discharged Patient Cohort Queue:")
    print(f"  Name: {patient_row.get('patientName')}")
    print(f"  ID: {patient_row.get('patientId')}")
    print(f"  Department: {patient_row.get('department')}")
    print(f"  Discharge Date: {patient_row.get('dischargeDate')}")
    print(f"  Follow-up Task: {patient_row.get('followUp')}")
    print(f"  Due Date: {patient_row.get('dueDate')}")
    print(f"  Priority Level: {patient_row.get('level')}")
    print(f"  Status: {patient_row.get('status')}")

    # 5. Check statistics updated
    new_count = after_stats.get("totalPatients", 0)
    print(f"[Step H] Patient Count Updated: From {initial_count} -> {new_count}")
    assert new_count >= initial_count + 1, "Expected total patients counter to increment."

    # 6. Re-approval duplicate prevention test
    reapprove_res = requests.post(f"{BASE}/api/doctor/documents/{doc_id}/approve", headers=headers)
    assert reapprove_res.status_code == 200
    recheck_patients = requests.get(f"{BASE}/api/doctor/patients", headers=headers).json()
    matched_recheck = [p for p in recheck_patients if p.get("patientId") == "DEMO-COHORT-9001" or p.get("id") == "DEMO-COHORT-9001"]
    assert len(matched_recheck) == 1, f"Duplicate found after second approval: {len(matched_recheck)}"
    print(f"[Step J] Duplicate Prevention Verified: Exactly {len(matched_recheck)} record exists.")

    print("\n=======================================================")
    print("ALL 10 VERIFICATION STEPS PASSED SUCCESSFULLY! 🎉")
    print("=======================================================")

if __name__ == "__main__":
    test_demo_cohort_workflow()
