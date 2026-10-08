# CareFlow AI
Agentic Hospital Discharge & Follow-up Coordinator

## Phase 2: Real Data Foundation (Backend + SQLite)
This phase introduces the core Data Foundation using a **FastAPI backend** and a **persistent SQLite relational database**, moving entirely away from frontend mock data to a structured, reliable API-driven architecture.

### Current Architecture
* **Frontend**: React 19, Vite, Tailwind CSS v3, React Router DOM v7
* **Backend**: Python 3.11, FastAPI, Uvicorn 
* **Database**: SQLite (managed via SQLAlchemy ORM)
* **Authentication**: JWT-based protected routes (bcrypt hashed passwords via Passlib)

### Database Setup & Execution
The application now requires the backend to be running to serve synthetic database records.
1. **Initialize Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # Or activate.bat on cmd
   pip install fastapi uvicorn sqlalchemy pydantic python-multipart passlib bcrypt python-jose[cryptography] python-dotenv
   ```
2. **Seed the Relational Database**:
   This script creates the DB schema automatically (patients: 15 rows, users: 16 rows, followup_tasks: 71 rows, timeline_events: 71 rows, needs_review_issues: 11 rows) and populates exactly **15 unique 100% synthetic patients**, complete with tasks and timeline milestones. None of this data is hardcoded in the frontend. 
   ```bash
   python seed.py
   ```
3. **Run the API Server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. **Run the Frontend**:
   ```bash
   npm run dev
   # Access http://localhost:5173
   ```

### Demo Credentials
* **Doctor/Care Coordinator Role**
  * Email: `doctor@acentra.com`
  * Password: `password`
* **Patient Role**
  * Email: `patient@acentra.com` (Or `patient1@example.com`, `patient2@example.com`...)
  * Password: `password`

### Security Enhancements
* Implemented proper **Protected Routes** requiring active API tokens.
* Fixed browser **Back-Button bugs** ensuring completely severed sessions upon User Logout via standard `window.location.replace` history wiping.
* Strong file validation on the Document Upload endpoint.

### Clinical Safety Boundaries 
CareFlow AI operates strictly within operational and administrative bounds. 
* **Zero Diagnostic Capabilities**: The system extracts structured dates and follow-up timelines but **never** infers diagnoses. 
* **Mandatory Human Verification**: AI-identified data discrepancies explicitly flag documents as **"Needs Manual Review"**, halting further processing until user confirmation.


## Phase 3: Real Document Intelligence
### Step 1: Ingestion & Validation Layer
- Implemented native parsing for `.docx`, `.xlsx`, and `.pdf` inside `backend/document_parser.py` using standard libraries to extract plain text footprints.
- Integrated strict patient validation logic prioritizing zero-hallucination policies. Files are uploaded via `POST /api/doctor/upload`.
- Files containing strict identifiable MRNs are mapped directly (storing a `DischargeDocument` reference and generating a `TimelineEvent`).
- **Missing** or **Ambiguous** files immediately flag the workflow, returning a `Needs Human Review` boolean to the UI which renders clear diagnostic warnings.
\n### Step 2: Structured Document Extraction\n- Built DischargeExtraction relational model bridging documents and parsed logic.\n- Added DischargeLLMProvider wrapping OpenAI REST protocols handling dynamic failover without relying on bloated dependencies.\n- Extended extraction_service safely evaluating structured Pydantic representations enforcing clinically sensitive rules (Missing Dates, Ambiguous JSON, Confirmed MRN overlap).\n- Added non-invasive Doctor Dashboard UI gracefully unpacking successful intelligence maps, preventing hallucinated progression.\n