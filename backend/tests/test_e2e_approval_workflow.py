import urllib.request
import urllib.parse
import json
import os
import sys

BASE_URL = "http://localhost:8000"

def post_json(url, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(url, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def upload_multipart(url, filename, content_bytes, token=None):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
    ).encode("utf-8") + content_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def test_full_approval_workflow():
    print("=== STARTING FULL END-TO-END WORKFLOW TEST ===")
    
    # 1. Login as Doctor
    print("\n[Step 1] Logging in as Doctor...")
    login_res = post_json(f"{BASE_URL}/api/auth/login", {"email": "doctor@acentra.com", "password": "password"})
    doc_token = login_res["access_token"]
    print(f"✓ Doctor Authenticated. Name: {login_res['name']}")

    # 2. Upload synthetic discharge summary with unique MRN
    patient_mrn = "DEMO-CARE-9001"
    doc_text = f"""
===============================================================================
CITY GENERAL HOSPITAL • CLINICAL DISCHARGE SUMMARY
===============================================================================
PATIENT NAME: Arun Kumar                  MRN: {patient_mrn}
DOB: 1968-06-12                          GENDER: Male
ADMISSION DATE: 01 Oct 2026               DISCHARGE DATE: 05 Oct 2026
ATTENDING: Dr. Meera Patel, MD, FACC      DEPT: Cardiovascular Surgery

PRIMARY DIAGNOSIS:
Acute Myocardial Infarction • Status Post Percutaneous Coronary Intervention (PCI)

OUTPATIENT APPOINTMENTS & FOLLOW-UP:
1. Cardiology Specialist Clinic with Dr. Rajesh Mehta
   - Target Date: 2026-10-15 at 10:30 AM
   - Location: Heart Center Suite 204
   - Clinical Objective: Assess post-stent patency and dual-antiplatelet tolerance.

2. Cardiac Rehabilitation Phase II Evaluation
   - Target Date: 2026-10-28 at 02:00 PM
   - Location: Outpatient Therapy Pavilion

DIAGNOSTIC TESTS REQUIRED:
1. Fasting Lipid Profile & Comprehensive Metabolic Panel (CMP)
   - Target Date: 2026-10-14
   - Instructions: 10 to 12 hours overnight fasting required. Water permitted.
   - Note: Required before 15 October Cardiology follow-up visit.

2. Transthoracic Echocardiogram (TTE) Follow-up
   - Target Date: 2026-10-28
   - Instructions: Non-fasting. Wear comfortable clothing.

SPECIALIST REFERRALS:
1. Preventive Nutrition & Dietary Counseling (Registered Dietitian)
   - Target Date: 2026-11-10
   - Objective: Low sodium Mediterranean heart diet education.

POST-DISCHARGE CARE INSTRUCTIONS:
- Wound Care: Keep right groin femoral catheter puncture clean and dry. No soaking in water.
- Activity: Light walking permitted. Strict 10 lb lifting restriction for 4 weeks.
- Medications: Aspirin 81mg daily with breakfast; Clopidogrel 75mg daily with lunch.

EMERGENCY WARNING SIGNS:
- Recurrent chest pressure, shortness of breath at rest, or bleeding at puncture site: Call 911 immediately.
===============================================================================
    """
    
    print(f"\n[Step 2] Uploading discharge summary for {patient_mrn}...")
    upload_res = upload_multipart(
        f"{BASE_URL}/api/doctor/upload",
        f"discharge_summary_{patient_mrn}.txt",
        doc_text.encode("utf-8"),
        token=doc_token
    )
    doc_id = upload_res.get("documentId") or upload_res.get("document_id")
    print(f"✓ Upload successful. Document ID: {doc_id}, Extraction ID: {upload_res.get('extractionId')}")

    # 3. Inspect document extraction
    print(f"\n[Step 3] Fetching document extraction details...")
    detail_res = get_json(f"{BASE_URL}/api/doctor/documents/{doc_id}", token=doc_token)
    ext = detail_res.get("extraction")
    print(f"✓ Document status before approval: {detail_res['status']}")
    print(f"  Extracted patient: {ext.get('patientInfo', {}).get('name')} (MRN: {ext.get('patientInfo', {}).get('mrn')})")
    print(f"  Extracted appointments: {len(ext.get('appointments', []))}")
    print(f"  Extracted tests: {len(ext.get('tests', []))}")

    # 4. Click 'Approve and Activate in MySQL'
    print(f"\n[Step 4] Calling 'Approve & Activate in MySQL' (POST /api/doctor/documents/{doc_id}/approve)...")
    appr_res = post_json(f"{BASE_URL}/api/doctor/documents/{doc_id}/approve", {}, token=doc_token)
    print(f"✓ Approval Result: {appr_res}")
    assert appr_res["status"] == "success", f"Approval failed: {appr_res}"
    assert appr_res["patient_id"] == patient_mrn, f"Expected MRN {patient_mrn}, got {appr_res['patient_id']}"

    # 5. Verify Doctor Dashboard endpoints return newly approved patient & data
    print(f"\n[Step 5] Verifying Doctor Dashboard APIs...")
    
    stats = get_json(f"{BASE_URL}/api/doctor/stats", token=doc_token)
    print(f"✓ Doctor Stats: {stats}")
    assert stats["totalPatients"] >= 2, f"Expected totalPatients >= 2, got {stats['totalPatients']}"

    patients = get_json(f"{BASE_URL}/api/doctor/patients", token=doc_token)
    matched_pts = [p for p in patients if p["id"] == patient_mrn or p.get("patientId") == patient_mrn]
    print(f"✓ Found patient in Doctor Directory: {len(matched_pts)} record(s)")
    assert len(matched_pts) > 0, f"Patient {patient_mrn} not found in Doctor Patients list!"
    print(f"  Patient details: {matched_pts[0]['patientName']} | {matched_pts[0]['primaryDiagnosis']}")

    follow_ups = get_json(f"{BASE_URL}/api/doctor/follow-ups", token=doc_token)
    pt_fus = [f for f in follow_ups if f.get("patientId") == patient_mrn or f.get("mrn") == patient_mrn]
    print(f"✓ Found {len(pt_fus)} follow-up item(s) for {patient_mrn} on Doctor Follow-ups page")
    assert len(pt_fus) > 0, f"Follow-ups for {patient_mrn} not found!"

    tasks = get_json(f"{BASE_URL}/api/doctor/tasks", token=doc_token)
    pt_tasks = [t for t in tasks if t.get("patientId") == patient_mrn]
    print(f"✓ Found {len(pt_tasks)} task(s) for {patient_mrn} in Doctor Tasks queue")
    assert len(pt_tasks) > 0, f"Tasks for {patient_mrn} not found!"

    # 6. Verify Patient Portal Login & View
    print(f"\n[Step 6] Verifying Patient Portal for {patient_mrn}...")
    clean_email = f"{patient_mrn.lower().replace('-', '_')}@careflow.ai"
    pat_login = post_json(f"{BASE_URL}/api/auth/login", {"email": clean_email, "password": "password"})
    pat_token = pat_login["access_token"]
    print(f"✓ Patient Authenticated. Name: {pat_login['name']}, Patient ID: {pat_login['patient_id']}")

    pat_me = get_json(f"{BASE_URL}/api/patient/me", token=pat_token)
    print(f"✓ Patient Profile retrieved: {pat_me['name']} | MRN: {pat_me['id']}")
    assert pat_me["id"] == patient_mrn

    pat_fus = get_json(f"{BASE_URL}/api/patient/follow-ups", token=pat_token)
    print(f"✓ Patient Follow-ups retrieved: {len(pat_fus)} item(s)")
    assert len(pat_fus) > 0

    pat_tests = get_json(f"{BASE_URL}/api/patient/tests", token=pat_token)
    print(f"✓ Patient Required Tests retrieved: {len(pat_tests)} item(s)")
    assert len(pat_tests) > 0

    pat_tl = get_json(f"{BASE_URL}/api/patient/timeline", token=pat_token)
    print(f"✓ Patient Timeline events retrieved: {len(pat_tl)} item(s)")
    assert len(pat_tl) > 0

    # 7. Test Duplicate Prevention (Re-approving document)
    print(f"\n[Step 7] Re-approving document to verify duplicate prevention...")
    appr_res2 = post_json(f"{BASE_URL}/api/doctor/documents/{doc_id}/approve", {}, token=doc_token)
    assert appr_res2["status"] == "success"
    
    patients_after = get_json(f"{BASE_URL}/api/doctor/patients", token=doc_token)
    matched_after = [p for p in patients_after if p["id"] == patient_mrn]
    assert len(matched_after) == 1, f"Expected exactly 1 patient record for {patient_mrn}, found {len(matched_after)}"
    print(f"✓ Duplicate prevention verified: Exactly 1 record exists for {patient_mrn}.")

    print("\n=======================================================")
    print("🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 🎉")
    print("=======================================================")

if __name__ == "__main__":
    test_full_approval_workflow()
