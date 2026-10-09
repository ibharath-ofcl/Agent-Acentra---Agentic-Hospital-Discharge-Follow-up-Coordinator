# CareFlow AI
> **Agentic Hospital Discharge & Follow-up Coordinator**  
> *"HMS records what happened. CareFlow makes sure what needs to happen next doesn't get missed."*

---

## 1. Overview
CareFlow AI sits on top of hospital management systems (HMS) as an agentic coordination layer. When a patient is discharged, CareFlow extracts, organizes, and coordinates documented instructions—including follow-up appointments, diagnostic tests, specialist referrals, medication schedules, care instructions, and emergency red flags—preventing post-discharge readmissions and missed care.

---

## 2. Secure Architecture

CareFlow AI enforces a **strict zero-exposure server-side architecture** for LLM interactions. The Google Gemini API key resides **exclusively** on the backend server within environment variables and is **never** bundled or exposed in React/Vite/client-side code.

```
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend                    │
│   (Liquid Glass 3D UI • Zero Secrets • Demo Presets)  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/ai/analyze-discharge
                           ▼
┌────────────────────────────────────────────────────────┐
│              CareFlow Backend (FastAPI)                │
│    • Environment Security (.env isolated)             │
│    • Clinical Safety Boundary Engine                   │
│    • Deterministic Fallback & Schema Validation        │
└──────────────────────────┬─────────────────────────────┘
                           │ Secure Server-Side SSL Request
                           ▼
┌────────────────────────────────────────────────────────┐
│               Google Gemini API                        │
│    (gemini-3.5-flash / gemini-flash-latest)           │
└──────────────────────────┬─────────────────────────────┘
                           │ Strict JSON Structured Output
                           ▼
┌────────────────────────────────────────────────────────┐
│             Structured CareFlow Data                   │
│   Appointments • Tests • Meds • Referrals • Reviews    │
└──────────────────────────┬─────────────────────────────┘
                           │ Live UI Synchronization
                           ▼
┌────────────────────────────────────────────────────────┐
│       Doctor Command Center & Patient Care Engine      │
└────────────────────────────────────────────────────────┘
```

---

## 3. Environment Setup & Configuration

### Security Rules (MANDATORY)
- **NEVER** commit `.env`, API keys, tokens, or credentials to GitHub or version control.
- Root and backend `.gitignore` automatically exclude all `.env` files.
- A template `.env.example` is provided for configuration.

### Setup Instructions

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the backend (and root directory):
   ```bash
   cp .env.example .env
   cp .env.example backend/.env
   ```

2. **Add Your Gemini API Key**:
   Edit `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   HOST=0.0.0.0
   ```

3. **Install Dependencies & Start Backend**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install fastapi uvicorn sqlalchemy pydantic python-multipart passlib bcrypt python-jose[cryptography] python-dotenv certifi
   python3 seed.py
   python3 -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
   ```

4. **Start Frontend Dev Server**:
   ```bash
   npm install
   npm run dev
   # Access http://localhost:5173
   ```

---

## 4. Gemini API Integration & Discharge Intelligence

### Backend Endpoints

#### 1. Discharge Analysis: `POST /api/ai/analyze-discharge`
* **Input**:
  ```json
  {
    "documentText": "Synthetic discharge summary text..."
  }
  ```

* **Output**:
  ```json
  {
    "summary": "Executive overview of post-discharge clinical course",
    "patientInfo": {
      "name": "Arun Kumar",
      "mrn": "MRN-9281C",
      "dob": "1972-04-15",
      "gender": "Male",
      "primaryDiagnosis": "Acute ST-Elevation Myocardial Infarction (STEMI)",
      "admissionDate": "2026-10-06",
      "dischargeDate": "2026-10-10",
      "attendingPhysician": "Dr. Sarah Chen, MD, FACC"
    },
    "appointments": [
      {
        "specialty": "Cardiology Follow-up",
        "doctorName": "Dr. Sarah Chen",
        "date": "2026-10-24",
        "time": "10:00 AM",
        "location": "Cardiology Clinic, Suite 402",
        "reason": "Post-PCI clinical evaluation & resting ECG review",
        "sourceEvidence": "Follow-up with Cardiology in 2 weeks (Oct 24, 2026 at 10:00 AM)",
        "requiresHumanReview": false,
        "reviewReason": ""
      }
    ],
    "tests": [
      {
        "testName": "Fasting Lipid Profile & Metabolic Panel",
        "targetDate": "2026-10-22",
        "instructions": "12-hour overnight fasting required",
        "fastingRequired": true,
        "sourceEvidence": "Fasting blood draw 2 days prior to clinic follow-up",
        "requiresHumanReview": false,
        "reviewReason": ""
      }
    ],
    "referrals": [
      {
        "providerType": "Phase II Cardiac Rehabilitation",
        "reason": "Supervised aerobic endurance training & cardiovascular risk reduction",
        "urgency": "Within 3 weeks",
        "notes": "Initiate outpatient rehab program",
        "sourceEvidence": "Referral to Phase II Cardiac Rehab",
        "requiresHumanReview": false,
        "reviewReason": ""
      }
    ],
    "medicationInstructions": [
      {
        "medicationName": "Aspirin",
        "dosage": "81 mg",
        "frequency": "Once daily",
        "route": "Oral",
        "specialInstructions": "Take with breakfast meal; lifelong therapy",
        "duration": "Indefinite",
        "sourceEvidence": "Aspirin 81mg PO daily with breakfast",
        "requiresHumanReview": false,
        "reviewReason": ""
      }
    ],
    "careInstructions": [
      {
        "category": "Wound Care",
        "instruction": "Inspect right femoral puncture site daily. Keep clean and dry. No soaking in tubs for 7 days.",
        "sourceEvidence": "Incision care: Femoral puncture site clean/dry for 7 days",
        "requiresHumanReview": false,
        "reviewReason": ""
      }
    ],
    "warningSigns": [
      {
        "symptom": "Recurrent or worsening chest pain or radiating pain to arm/jaw",
        "urgency": "Emergency (Call 911 / ED)",
        "actionRequired": "Immediately cease activity, take nitroglycerin as prescribed, and call 911",
        "sourceEvidence": "Call 911 immediately for recurrent chest tightness or left arm pain"
      }
    ],
    "needsReview": [
      {
        "category": "Ambiguity / Medication Safety",
        "item": "Unclear Dosage / Timeframe",
        "issue": "Instruction missing specific date or dosage parameters",
        "reason": "Requires care coordinator confirmation before scheduling",
        "sourceEvidence": "Excerpt from discharge text"
      }
    ],
    "extractedDates": [
      {
        "date": "2026-10-24",
        "label": "Cardiology Follow-up",
        "context": "Outpatient Clinic Visit",
        "isAmbiguous": false
      }
    ],
    "evidence": [
      {
        "key": "Clinical Course & Intervention",
        "snippet": "Patient admitted with acute STEMI, underwent successful PCI with DES to LAD.",
        "pageOrSection": "Hospital Course"
      }
    ]
  }
  ```

#### 2. AI Service Health: `GET /api/ai/status`
Returns real-time status of the Gemini Clinical Intelligence service without leaking API keys.

---

## 5. Clinical Safety Boundaries

CareFlow AI operates under strict clinical boundaries:
1. **Zero Autonomous Diagnoses**: The system extracts documented clinical findings but never infers, generates, or diagnoses conditions.
2. **No Treatment Alterations**: The model never recommends unauthorized treatments or changes medication dosages.
3. **Zero Medical Advice Hallucination**: If a user asks a clinical question or submits ambiguous symptoms, the model flags `requiresHumanReview: true` and routes to human healthcare providers.
4. **Mandatory Human Verification (`needsReview`)**:
   - Vague dates (e.g. "next week", "soon")
   - Ambiguous dosages or unclear frequencies
   - Missing provider contact or location details
   - Conflicting clinical notes
5. **Verbatim Evidence Provenance**: Every extracted item includes an exact `sourceEvidence` snippet for auditability.

---

## 6. Frontend Discharge Intelligence Demo

Located in the **Doctor Command Center** (`/doctor` -> *Discharge Intelligence*):
1. **Synthetic Presets Selector**:
   - `Arun Kumar — Post-MI STEMI Recovery`: Comprehensive cardiology discharge summary with PCI, DAPT, Echo, and Rehab.
   - `Ambiguous Instructions & Dosage Safety Gate`: Triggers human review flags for unclear dosage ranges and patient advice inquiries.
   - `Sunita Sharma — Total Hip Arthroplasty`: Orthopedic recovery plan with anticoagulation, precautions, and home health PT.
2. **Custom Document Textarea & File Upload**: Real-time editor with character counts and file ingestion (`.pdf`, `.docx`, `.txt`).
3. **Analyze with CareFlow AI**: Live animated scanning sequence with step-by-step reasoning indicators.
4. **Structured Results Tabs**: Filter and inspect Appointments, Medications, Labs, Care Instructions, Warning Signs, Human Review Alerts, and Source Evidence.
5. **Sync to Care Plan**: 1-click action connecting extracted tasks into the Care Coordinator Queue.

---

## 7. Demo Credentials
* **Doctor / Coordinator Role**:
  * Username / Email: `doctor` (or `doctor@acentra.com`)
  * Password: `doctor123` (or `password`)
* **Patient Role**:
  * Username / Email: `patient` (or `patient@acentra.com`)
  * Password: `patient123` (or `password`)

---

## 8. Disclaimer
**Synthetic Healthcare Data — Demonstration Only.**  
All clinical scenarios, patient names, medical records (MRNs), medications, and timelines used in CareFlow AI are 100% synthetic demonstrations designed for software evaluation. CareFlow AI coordinates documented instructions and does not replace professional medical judgment.