# CareFlow AI — Agentic Hospital Discharge & Follow-up Coordinator

> **Phase 1: Frontend Foundation & Demo-Ready Refinement**  
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

## 2. Visual Identity & Design System

The application has been polished to reflect an enterprise healthcare aesthetic inspired by the **Acentra Health** visual identity:
- **Primary Brand Shell**: Deep Dark Teal (`#03181b`, `#052429`, `#0a383f`)
- **Primary Accent**: Electric Bright Green (`#00e575`, `#00cb68`)
- **Typography**: Clean, accessible soft-white and dark-slate typography using modern font tokens
- **Healthcare Signals**: Subtle borders, calibrated alert badges (🔴 Immediate Review, 🟠 High Priority, 🟢 Routine), minimal gradients, zero childish illustrations or generic dashboard styling.

---

## 3. Strict Clinical Safety Boundaries

**CareFlow AI is NOT a medical diagnosis system.**

To protect patient safety and adhere to clinical standards:
- It **never** diagnoses medical conditions.
- It **never** recommends treatments or adjusts medications.
- It **never** invents medical instructions or clinical advice.
- It **never** makes autonomous clinical decisions.
- It **never** presents provider matches as guaranteed.
- Whenever information in a discharge summary is missing, conflicting, or clinically ambiguous, it flags the item as **"Needs Review"** and routes it directly to a human care coordinator or attending doctor.
- **Care Coordination Priority** ranks patients based **only** on explicit documented deadlines, overdue tasks, and unresolved instructions—**never** on medical diagnosis or medical severity prediction.

---

## 4. Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 (Custom enterprise healthcare tokens)
- **Routing**: React Router DOM v7
- **Motion & Interactions**: Framer Motion
- **Icons**: Lucide React

---

## 5. Application Routes & Demo Credentials

| Route | Purpose | Access |
|---|---|---|
| `/` | Comprehensive Product Landing Page & Workflow Architecture | Public |
| `/login` | Role-selected demonstration sign-in | Public |
| `/patient` | Patient Recovery & Task Dashboard ("What do I need to do next?") | Patient Portal |
| `/doctor` | Care Coordinator & Doctor Command Center | Doctor Portal |

### Demo Credentials

| Role | Username | Password | Default Redirect |
|---|---|---|---|
| **Patient** | `patient` | `patient123` | `/patient` |
| **Doctor / Coordinator** | `doctor` | `doctor123` | `/doctor` |

*(Quick-fill demo buttons are provided on the `/login` screen for instant testing.)*

---

## 6. Key Features Implemented in Phase 1

### Landing Page (`/`)
- **Visual Workflow**: Full 7-stage pipeline diagram: Discharge Summary → AI Understanding → Validation → Follow-up Plan → Tasks & Timeline → Reminders → Human Review.
- **Direct Demo CTA**: "Try the Demo" button directing users immediately to `/login`.
- **How It Works**: 6-step deep dive into document intake, uncertainty detection, and coordinator escalation.
- **Official Capabilities**: 7 enterprise pillars including Agentic AI, Document Intelligence, Task Orchestration, and Clinical Safety.
- **Closed-Loop Coordination**: Demonstrates continuous cycle: `Understand → Plan → Assign → Remind → Track → Escalate → Complete`.
- **AI Reminder Feature**: Explains informational phone reminders with safety limits and fallback flow.

### Patient Dashboard (`/patient`)
- **Core Question**: *"What do I need to do next?"*
- **Welcome Header**: "Good morning, Arun — Here is your follow-up plan after discharge."
- **NEXT ACTION Card**: Prominently displays *Cardiology follow-up | 15 October 2026 | Pending* with "View Details" inspection modal.
- **Follow-up Progress**: Interactive indicator showing tasks completed (e.g. *2 of 6 tasks completed*) with real-time updates as tasks are toggled.
- **Upcoming Tasks**: Cardiology appointment (15 Oct), Blood test (18 Oct), Wound care check (20 Oct).
- **Completed Tasks**: Discharge medication instructions acknowledged (Completed).
- **Needs Review Section**: Highlights *"Follow-up date is not specified"* with clear note: *"This item has been sent to your care coordinator for review."*
- **Timeline**: Visual milestone track from Discharge → Follow-up created → Reminder scheduled → Appointment upcoming.
- **AI Reminder Simulation**: Details 14 Oct 10:00 AM call with simulated retry & SMS fallback logs.
- **Language Selector**: UI selector for English, Tamil, and Hindi.
- **Red Flag Warnings**: Emergency instructions for immediate 112/911 situations.

### Doctor & Care Coordinator Dashboard (`/doctor`)
- **Core Question**: *"Which patients need my attention?"*
- **Top 5 Statistics**:
  1. Total Patients: 5
  2. Pending Follow-ups: 7
  3. High Priority: 2
  4. Needs Review: 4
  5. Overdue: 1
- **Care Coordination Priority (Prominent Feature)**:
  - 🔴 **Immediate Review**: Arun Kumar ("Documented urgent follow-up / unresolved clinical instruction")
  - 🟠 **High Follow-up Priority**: Priya Sharma ("Follow-up deadline approaching")
  - 🟢 **Routine**: Rahul Kumar ("Upcoming routine follow-up")
  - *Strictly decoupled from medical diagnosis.*
- **Patient Queue Table**: Full cohort listing with columns: Patient, Follow-up, Due Date, Priority, Status, Action. Searchable and filterable by priority and status.
- **Needs Human Review Queue**: Triage tray for missing dates, conflicting instructions, patient medication questions, and clinically sensitive items with interactive **Review** and **Approve** actions.
- **Upcoming & Overdue Sections**: Highlights overdue items (e.g., Ravi Kumar | Cardiology follow-up | Overdue) and upcoming deadlines.
- **Source Evidence Citations**: Transparent provenance tags (*Source: Discharge Summary • Page 2*) with expandable sentence views and OCR confidence metrics.

---

## 7. Running Locally

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

## 8. License & Safety Disclaimer

This project was developed for demonstration and hackathon evaluation purposes. All clinical data presented in Phase 1 is purely **synthetic** and does not represent real protected health information (PHI). Never use this system for real-world medical decision-making without certified clinical integrations and regulatory compliance approval.
