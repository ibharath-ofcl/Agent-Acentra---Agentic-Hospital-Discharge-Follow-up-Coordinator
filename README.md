# CareFlow AI — Agentic Hospital Discharge & Follow-up Coordinator

> **Phase 1: Frontend Foundation & Architecture**  
> *Acentra Agentic Healthcare Hackathon Initiative*

---

## 1. Project Purpose & Problem Statement

### The Problem
Hospital discharge instructions are notoriously complex, dense, and difficult for recovering patients to navigate. Crucial instructions—such as timing for specialist follow-ups, diagnostic lab orders, medication reconciliation, and warning signs—often get lost in multipage PDF summaries. This lack of follow-up coordination leads to avoidable hospital readmissions, medication non-adherence, and missed appointments.

### The CareFlow AI Solution
**CareFlow AI** is an agentic hospital discharge and follow-up coordination system that bridges the gap between inpatient discharge and outpatient recovery. It is designed to automatically ingest discharge summaries, extract structured follow-up tasks, detect ambiguities or missing dates, and establish a closed-loop tracking workflow—keeping human clinicians firmly in the loop whenever uncertainty or clinical risk is detected.

```
Hospital Discharge Summary
        ↓
Document Intelligence (Extraction)
        ↓
Structured Extraction (Appointments, Labs, Meds)
        ↓
Validation + Safety Check (Human Review when uncertain)
        ↓
Follow-up Plan (Timeline & Deadlines)
        ↓
Tasks & Patient-Friendly Instructions
        ↓
Reminders (Informational Multi-channel)
        ↓
Patient / Doctor Closed-Loop Coordination
        ↓
Task Completion & Recovery Verification
```

> ⚠️ **Important Phase Notice:**  
> **Phase 1 currently contains frontend/demo functionality.** Backend, database, AI extraction, provider matching, notifications, and voice calling will be implemented in later phases.

---

## 2. Strict Clinical Safety Boundaries

**CareFlow AI is NOT a medical diagnosis system.**

To protect patient safety and adhere to clinical standards:
- It **never** diagnoses medical conditions.
- It **never** recommends treatments or adjusts medications.
- It **never** invents medical instructions or clinical advice.
- It **never** makes autonomous clinical decisions.
- It **never** presents provider matches as guaranteed.
- Whenever information in a discharge summary is missing, conflicting, or clinically ambiguous, it flags the item as **"Needs Review"** and routes it directly to a human care coordinator or attending doctor.

---

## 3. Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 (Modern HSL-tuned healthcare design tokens)
- **Routing**: React Router DOM v7
- **Motion & Interactions**: Framer Motion
- **Icons**: Lucide React

---

## 4. Frontend Architecture

The codebase follows a modular, scalable architecture designed for seamless backend integration in subsequent phases:

```
src/
├── components/
│   ├── common/              # Reusable UI primitives (StatusBadge, SourceEvidenceTag)
│   ├── landing/             # Landing page sections (Hero, HowItWorks, Capabilities,
│   │                        # ClosedLoop, Reminders, Safety, Experiences, Footer)
├── data/
│   └── demoData.ts          # Dedicated synthetic data layer (Patients, Tasks, Labs, Docs)
├── hooks/
│   └── useAuth.ts           # Demo authentication hook (session storage based)
├── pages/
│   ├── LandingPage.tsx      # Comprehensive product showcase & clinical safety
│   ├── LoginPage.tsx        # Role-based demo login (Patient vs. Doctor)
│   ├── PatientDashboard.tsx # "What do I need to do next?" patient experience
│   └── DoctorDashboard.tsx  # Clinical command center & "Needs Review" triage
├── types/
│   └── index.ts             # Strongly-typed TypeScript interfaces (15+ core domain models)
├── App.tsx                  # Main route declaration
├── index.css                # Healthcare design system tokens & animation keyframes
└── main.tsx                 # Root React entry point
```

---

## 5. Application Routes & Demo Credentials

| Route | Purpose | Access |
|---|---|---|
| `/` | Comprehensive Product Landing Page | Public |
| `/login` | Role-selected demonstration sign-in | Public |
| `/patient` | Patient Recovery & Task Dashboard | Demo Authenticated / Direct |
| `/doctor` | Care Coordinator & Doctor Command Center | Demo Authenticated / Direct |

### Demo Credentials

| Role | Username | Password | Default Redirect |
|---|---|---|---|
| **Patient** | `patient` | `patient123` | `/patient` |
| **Doctor / Coordinator** | `doctor` | `doctor123` | `/doctor` |

*(Quick-fill demo buttons are provided on the `/login` screen for fast testing.)*

---

## 6. Key Features (Phase 1 Implemented)

### Landing Page
- **Hero Section**: Communicates value proposition with visual 6-stage workflow pipeline.
- **How CareFlow AI Works**: 6-step interactive workflow detailing extraction through escalation.
- **Official Capabilities**: 7 core capabilities (Agentic AI, Document Intelligence, Task Orchestration, Healthcare Workflow, Multilingual AI, Provider Matching, Clinical Safety).
- **Closed-Loop Coordination**: Demonstrates the continuous `Understand → Plan → Assign → Remind → Track → Escalate → Complete` lifecycle.
- **AI Reminder Feature**: Explains informational-only follow-up calls with explicit safety limits and fallback flow.
- **Clinical Safety & Human-in-the-Loop**: High-trust section detailing escalation triggers (missing info, ambiguities, conflicting instructions).
- **Patient & Doctor Experience Showcases**: Detailed previews of both portal perspectives.

### Patient Dashboard (`/patient`)
- **"What do I need to do next?" Hero**: Highlights the single next high-priority action with target date and clinician.
- **Discharge Plan Progress**: Real-time progress bar tracking completed, pending, and reviewed tasks.
- **Follow-up Tasks & Timeline**: Filterable by Appointments, Diagnostics & Labs, Medications, and Red Flag Signs.
- **Needs Review Alerts**: Explains why an item was flagged and shows coordinator follow-up status.
- **Source Evidence Provenance**: Document name, page number, and confidence score for every extracted instruction.
- **Language Selector**: UI support for English, Hindi, Spanish, and Tamil.
- **Emergency Red Flag Warnings**: Clear 911/112 protocols for severe symptoms.

### Doctor & Care Coordinator Dashboard (`/doctor`)
- **Triage Command Center**: Metric cards for Total Patients, Pending Follow-ups, Upcoming Deadlines, Overdue Items, Needs Review, and Open Escalations.
- **Needs Review Queue**: Immediate triage tray with interactive **Approve** and **Inspect Source** actions.
- **Overdue Items Tray**: Prioritizes missed deadlines and unacknowledged reminders.
- **Patient Cohort Queue**: Tabular view of discharged patients with search by name or diagnosis, and full modal detail views.
- **Automated Reminder Logs**: Channel tracking (Voice Call, SMS) with retry counters.
- **Escalation Tickets**: Level-based categorization (Missing Info, Conflicting, Clinical).

---

## 7. Roadmap: Future Phases

- **Phase 2**: Document Intelligence & OCR Pipeline (PDF parsing, FHIR/HL7 integration, structured JSON extraction).
- **Phase 3**: LLM Multi-Agent Orchestrator (LangChain / Gemini SDK agents with validation tools and confidence scoring).
- **Phase 4**: Provider Matching Engine (Specialist registry, location/NPI lookup, in-network insurance matching).
- **Phase 5**: Twilio Voice & Multi-Channel Reminder Service (Automated informational call trees, SMS fallback, retry scheduling).
- **Phase 6**: HIPAA-Compliant Authentication & Database Persistence (PostgreSQL, Supabase / Firebase, audit logging).

---

## 8. Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ibharath-ofcl/Agent-Acentra---Agentic-Hospital-Discharge-Follow-up-Coordinator.git
   cd Agent-Acentra---Agentic-Hospital-Discharge-Follow-up-Coordinator
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` to explore the landing page and portals.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 9. License & Safety Disclaimer

This project was developed for demonstration and hackathon evaluation purposes. All clinical data presented in Phase 1 is purely **synthetic** and does not represent real protected health information (PHI). Never use this system for real-world medical decision-making without certified clinical integrations and regulatory compliance approval.
