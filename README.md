# CareFlow AI
Agentic Hospital Discharge & Follow-up Coordinator

## 1. Project overview
CareFlow AI is an intelligent discharge coordination platform that bridges the gap between inpatient care and outpatient recovery.

## 2. Problem statement
Hospital discharge instructions are notoriously complex, dense, and difficult for recovering patients to navigate. Crucial instructions—such as timing for specialist follow-ups, diagnostic lab orders, medication reconciliation, and warning signs—often get lost in multipage PDF summaries. This lack of follow-up coordination leads to avoidable hospital readmissions, medication non-adherence, and missed appointments.

## 3. Core concept
CareFlow AI automatically ingests discharge summaries, extracts structured follow-up tasks, detects ambiguities, and establishes a closed-loop tracking workflow to keep human clinicians firmly in the loop whenever uncertainty or clinical risk is detected.

## 4. Key differentiator
Unlike static patient portals, CareFlow AI treats post-discharge recovery as an active, state-aware workflow. It proactively organizes tasks based on urgency, identifies missing information for human review, and maps out explicit dependencies between clinical milestones.

## 5. Care Dependency Intelligence
A critical differentiating feature of CareFlow AI is its ability to understand task dependencies rather than treating every reminder independently. For example:
```
X-Ray
   ↓
Required Before
   ↓
Orthopedic Follow-up
```
If the X-Ray becomes overdue, the Orthopedic Follow-up is flagged as "AT RISK" due to a workflow dependency. This is explicitly labeled as a dependency risk, not a medical deterioration.

## 6. Agentic workflow concept
```text
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

## 7. Patient experience
The primary question for the patient is: **"What do I need to do next?"**
The premium patient dashboard provides:
- A welcoming "Next Action" prominently displayed.
- Clear progress tracking visualization.
- Upcoming and completed tasks lists.
- Items currently needing review by the care team.
- A visual timeline of the recovery plan.
- Mock AI reminder history logs.

## 8. Doctor/Care Coordinator experience
The primary question for the doctor is: **"Which patients need my attention?"**
The command center provides:
- Top-level operational statistics.
- **Care Coordination Priority**: Categorizes patients by *Immediate Review*, *High Follow-up Priority*, and *Routine* based solely on documented urgency, deadlines, and unresolved instructions.
- Dedicated queues for Priority routing, Needs Review, and Escalations.
- Interactive source-evidence visualization.

## 9. Clinical safety boundaries
CareFlow organizes and explains existing instructions. It does not diagnose, prescribe, change medications, or recommend treatment.
- "Needs Human Review" workflows trigger for missing information, ambiguous instructions, conflicting data, medication questions, and new symptoms.
- The system never makes autonomous clinical decisions.
- "Care Coordination Priority" is explicitly described as a workflow priority, NOT medical severity.

## 10. Technology stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 11. Frontend architecture
The application is structured as a robust SPA with distinct, role-based controller components:
- `PatientDashboard`: State-managed view for patient milestones.
- `DoctorDashboard`: State-managed view for cohort triage.
- Reusable UI Components: `StatusBadge`, `SourceEvidenceTag`, `DocumentIntelligenceView`, `TaskDependencyGraph`.
- Responsive layout using modern CSS techniques and hide-scrollbar utilities.

## 12. Routes
| Route | Purpose |
|---|---|
| `/` | Comprehensive Product Landing Page & Workflow Architecture |
| `/login` | Role-selected demonstration sign-in |
| `/patient` | Patient Recovery & Task Dashboard |
| `/doctor` | Care Coordinator Command Center |

## 13. Demo credentials
| Role | Username | Password |
|---|---|---|
| Patient | `patient` | `patient123` |
| Doctor | `doctor` | `doctor123` |

## 14. Current Phase
"Phase 1 currently contains frontend/demo functionality. Backend, database, AI extraction, provider matching, notifications and voice calling will be implemented in later phases."

## 15. Implemented Phase 1 features
- Landing page with complete product narrative.
- Role-based authentication simulation.
- Patient dashboard with tasks, timeline, and demo verification.
- Doctor command center with priority queue and needs-review flows.
- Care Dependency Intelligence mock visualization.
- Document Intelligence source evidence mock UI.
- Voice Follow-up Simulation UI logs.
- Fully responsive, accessible, premium healthcare aesthetic.

## 16. Future Phase 2 features
- Backend API
- Database
- Document Intelligence
- Agent orchestration
- Care Dependency Engine
- Provider Matching
- Notifications
- Programmable Voice
- Human Review workflow
- Real authentication

## 17. Future AI/agent capabilities
Agents will eventually handle extracting structured data from unformatted discharge PDFs, orchestrating dynamic outbound phone calls (via Twilio/similar) for reminders, and intelligently mapping clinical synonyms to standard coding systems—all while maintaining the strict human-in-the-loop review boundary for any ambiguous outputs.

## 18. Local setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Build for production: `npm run build`

## 19. Environment variables section
Currently, no `.env` configuration is required for Phase 1 as all data is mocked in the frontend. Future phases will require keys for database access, AI APIs, and voice programmable services.

## 20. Safety disclaimer
This project was developed for demonstration purposes. All clinical data presented in Phase 1 is purely synthetic and does not represent real protected health information (PHI). Never use this system for real-world medical decision-making. CareFlow AI organizes and explains existing instructions; it does not diagnose, prescribe, change medication, or recommend treatment.
