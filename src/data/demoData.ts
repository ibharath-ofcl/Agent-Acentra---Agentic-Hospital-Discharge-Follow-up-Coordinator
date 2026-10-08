// ============================================================
// CareFlow AI — Synthetic Demo Data
// All data is fictional, synthetic, and for demonstration purposes only.
// Does NOT represent actual medical diagnosis or medical advice.
// ============================================================

import type {
  Patient,
  Doctor,
  FollowUpTask,
  Appointment,
  MedicationInstruction,
  CareInstruction,
  WarningSign,
  DischargeDocument,
  DashboardStats,
  PatientProgress,
  CareCoordinationPriorityItem,
  NeedsReviewItem,
} from '../types';

// ── Patients ──────────────────────────────────────────────────

export const demoPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Arun Kumar',
    age: 58,
    gender: 'Male',
    contactPhone: '+91 98765 43210',
    contactEmail: 'arun.kumar@example.com',
    preferredLanguage: 'English',
    admissionDate: '2026-09-28',
    dischargeDate: '2026-10-05',
    primaryDiagnosis: 'Acute Myocardial Infarction',
    attendingPhysician: 'Dr. Meera Patel',
  },
  {
    id: 'P002',
    name: 'Priya Sharma',
    age: 42,
    gender: 'Female',
    contactPhone: '+91 87654 32109',
    contactEmail: 'priya.sharma@example.com',
    preferredLanguage: 'Hindi',
    admissionDate: '2026-10-01',
    dischargeDate: '2026-10-06',
    primaryDiagnosis: 'Type 2 Diabetes — Hypoglycemic Episode',
    attendingPhysician: 'Dr. Rajesh Iyer',
  },
  {
    id: 'P003',
    name: 'Rahul Kumar',
    age: 49,
    gender: 'Male',
    contactPhone: '+91 76543 21098',
    contactEmail: 'rahul.k@example.com',
    preferredLanguage: 'Tamil',
    admissionDate: '2026-10-02',
    dischargeDate: '2026-10-07',
    primaryDiagnosis: 'Post-Laparoscopic Cholecystectomy',
    attendingPhysician: 'Dr. Ananya Desai',
  },
  {
    id: 'P004',
    name: 'Ravi Kumar',
    age: 63,
    gender: 'Male',
    contactPhone: '+91 65432 10987',
    contactEmail: 'ravi.kumar@example.com',
    preferredLanguage: 'English',
    admissionDate: '2026-09-25',
    dischargeDate: '2026-10-01',
    primaryDiagnosis: 'Congestive Heart Failure Monitoring',
    attendingPhysician: 'Dr. Meera Patel',
  },
  {
    id: 'P005',
    name: 'Lakshmi Venkatesh',
    age: 73,
    gender: 'Female',
    contactPhone: '+91 54321 09876',
    contactEmail: 'lakshmi.v@example.com',
    preferredLanguage: 'Tamil',
    admissionDate: '2026-09-30',
    dischargeDate: '2026-10-04',
    primaryDiagnosis: 'Hip Fracture — Post-surgical Recovery',
    attendingPhysician: 'Dr. Ananya Desai',
  },
];

// ── Doctors ───────────────────────────────────────────────────

export const demoDoctors: Doctor[] = [
  {
    id: 'D001',
    name: 'Dr. Meera Patel',
    specialization: 'Cardiology',
    department: 'Cardiovascular Care',
    contactPhone: '+91 98700 00001',
    contactEmail: 'meera.patel@careflow.example.com',
  },
  {
    id: 'D002',
    name: 'Dr. Rajesh Iyer',
    specialization: 'Internal Medicine',
    department: 'General Medicine',
    contactPhone: '+91 98700 00002',
    contactEmail: 'rajesh.iyer@careflow.example.com',
  },
  {
    id: 'D003',
    name: 'Dr. Ananya Desai',
    specialization: 'Orthopedics & Surgery',
    department: 'Surgical Recovery',
    contactPhone: '+91 98700 00003',
    contactEmail: 'ananya.desai@careflow.example.com',
  },
];

export const currentPatient = demoPatients[0];

// ── Patient Tasks (Aligned with Arun Kumar's discharge plan) ─

export const demoFollowUpTasks: FollowUpTask[] = [
  {
    id: 'FT001',
    patientId: 'P001',
    title: 'Cardiology follow-up',
    description: 'Outpatient clinic visit for post-MI rhythm check, stress review, and echo consultation.',
    category: 'appointment',
    status: 'pending',
    priority: 'urgent',
    dueDate: '15 October 2026',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    assignedTo: 'Dr. Meera Patel',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Post-Discharge Specialist Plan',
      extractedText: 'Patient must be evaluated in Cardiology Outpatient Clinic within 10 days of hospital discharge.',
      confidence: 0.98,
    },
  },
  {
    id: 'FT002',
    patientId: 'P001',
    title: 'Blood test (Fasting Lipid Panel & Renal Function)',
    description: 'Venipuncture lab work to evaluate lipid controls and kidney function post-stent placement.',
    category: 'test',
    status: 'pending',
    priority: 'high',
    dueDate: '18 October 2026',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Required Laboratory Orders',
      extractedText: 'Repeat serum creatinine, electrolytes, and lipid panel at 14 days post-discharge.',
      confidence: 0.94,
    },
  },
  {
    id: 'FT003',
    patientId: 'P001',
    title: 'Wound care check & surgical site inspection',
    description: 'Catheter entry site inspection to ensure clean healing without hematoma.',
    category: 'appointment',
    status: 'pending',
    priority: 'medium',
    dueDate: '20 October 2026',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Puncture Site Instructions',
      extractedText: 'Femoral access site check with primary nurse practitioner at 2 weeks.',
      confidence: 0.91,
    },
  },
  {
    id: 'FT004',
    patientId: 'P001',
    title: 'Follow-up date is not specified',
    description: 'Nephrology consultation recommended for elevated creatinine, but discharge summary omitted target calendar date.',
    category: 'referral',
    status: 'needs-review',
    priority: 'high',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    notes: 'This item has been sent to your care coordinator for review.',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Specialist Referrals',
      extractedText: 'Consider nephrology consultation for serum creatinine 1.4 at discharge. Timing not specified.',
      confidence: 0.69,
    },
  },
  {
    id: 'FT005',
    patientId: 'P001',
    title: 'Discharge medication instructions acknowledged',
    description: 'Reviewed dual-antiplatelet schedule (Aspirin + Clopidogrel) and daily beta-blocker dosing.',
    category: 'medication',
    status: 'completed',
    priority: 'high',
    dueDate: '06 October 2026',
    completedDate: '2026-10-06',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-06',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Medication Reconciliation',
      extractedText: 'Patient and family instructed on uninterrupted antiplatelet therapy for 12 months.',
      confidence: 0.99,
    },
  },
  {
    id: 'FT006',
    patientId: 'P001',
    title: 'Post-discharge baseline vitals recorded',
    description: 'First blood pressure (122/78 mmHg) and pulse (68 bpm) baseline submitted via portal.',
    category: 'monitoring',
    status: 'completed',
    priority: 'medium',
    dueDate: '07 October 2026',
    completedDate: '2026-10-07',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-07',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Home Monitoring Instructions',
      extractedText: 'Record daily AM blood pressure; alert clinic if systolic drops below 100 or exceeds 160.',
      confidence: 0.95,
    },
  },
];

// ── Patient Progress Indicator ────────────────────────────────

export const demoPatientProgress: PatientProgress = {
  total: 6,
  completed: 2,
  pending: 3,
  overdue: 0,
  needsReview: 1,
  percentage: 33, // "2 of 6 tasks completed" (interactive in UI)
};

// ── Patient Recovery Timeline Milestones ─────────────────────

export interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  type: 'discharge' | 'task' | 'appointment' | 'reminder';
}

export const demoTimelineMilestones: TimelineMilestone[] = [
  {
    id: 'TM01',
    date: '05 Oct 2026',
    title: 'Discharged from Hospital',
    description: 'City General Hospital discharge summary finalized and ingested into CareFlow AI.',
    status: 'completed',
    type: 'discharge',
  },
  {
    id: 'TM02',
    date: '06 Oct 2026',
    title: 'Follow-up Plan Generated & Tasks Created',
    description: '6 discrete tasks organized with automated care coordination tracking.',
    status: 'completed',
    type: 'task',
  },
  {
    id: 'TM03',
    date: '14 Oct 2026 • 10:00 AM',
    title: 'Informational Follow-up Reminder Scheduled',
    description: 'Automated 30-sec reminder call scheduled regarding tomorrow\'s cardiology visit.',
    status: 'current',
    type: 'reminder',
  },
  {
    id: 'TM04',
    date: '15 Oct 2026 • 10:30 AM',
    title: 'Cardiology Appointment Upcoming',
    description: 'Dr. Meera Patel • Cardiovascular Care Center, Suite 204.',
    status: 'upcoming',
    type: 'appointment',
  },
];

// ── Care Coordination Priority (Doctor Feature) ──────────────
// SAFETY RULE: Ranked purely on documented follow-up deadlines,
// overdue tasks, and flagged instructions — NEVER medical diagnosis.

export const demoCareCoordinationPriorities: CareCoordinationPriorityItem[] = [
  {
    id: 'CCP001',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    level: 'immediate-review',
    reason: 'Documented urgent follow-up / unresolved clinical instruction (Missing Nephrology Date)',
    followUp: 'Cardiology & Nephrology Clarification',
    dueDate: '15 Oct 2026',
    status: 'needs-review',
    actionLabel: 'Review Now',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Specialist Referrals',
      extractedText: 'Consider nephrology consultation for serum creatinine 1.4 at discharge. Timing not specified.',
      confidence: 0.69,
    },
  },
  {
    id: 'CCP002',
    patientId: 'P004',
    patientName: 'Ravi Kumar',
    level: 'immediate-review',
    reason: 'Overdue follow-up task / Missed 07 Oct deadline without recorded visit',
    followUp: 'Cardiology follow-up',
    dueDate: '07 Oct 2026',
    status: 'overdue',
    actionLabel: 'Contact Patient',
    sourceEvidence: {
      documentId: 'DOC004',
      documentName: 'Discharge Summary • Ravi Kumar',
      pageNumber: 2,
      sectionTitle: 'Follow-up Deadlines',
      extractedText: 'Mandatory follow-up within 7 days post-discharge due to congestive history.',
      confidence: 0.96,
    },
  },
  {
    id: 'CCP003',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    level: 'high-priority',
    reason: 'Follow-up deadline approaching (Due 18 Oct) & unconfirmed lab booking',
    followUp: 'Fasting Blood Glucose & HbA1c',
    dueDate: '18 Oct 2026',
    status: 'pending',
    actionLabel: 'Review',
    sourceEvidence: {
      documentId: 'DOC002',
      documentName: 'Discharge Summary • Priya Sharma',
      pageNumber: 2,
      sectionTitle: 'Endocrinology Plan',
      extractedText: 'Repeat blood glucose fasting curve by October 18.',
      confidence: 0.93,
    },
  },
  {
    id: 'CCP004',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    level: 'high-priority',
    reason: 'Conflicting physical therapy weight-bearing instructions flagged in summary notes',
    followUp: 'Orthopedic Surgical Review',
    dueDate: '14 Oct 2026',
    status: 'needs-review',
    actionLabel: 'Review',
    sourceEvidence: {
      documentId: 'DOC005',
      documentName: 'Discharge Summary • Lakshmi Venkatesh',
      pageNumber: 3,
      sectionTitle: 'Rehab Mobility Protocol',
      extractedText: 'Discharge order says non-weight bearing x 4 weeks; PT discharge note says partial weight bearing with walker.',
      confidence: 0.74,
    },
  },
  {
    id: 'CCP005',
    patientId: 'P003',
    patientName: 'Rahul Kumar',
    level: 'routine',
    reason: 'Upcoming routine follow-up on track with confirmed appointment slot',
    followUp: 'Surgical site wound inspection',
    dueDate: '22 Oct 2026',
    status: 'pending',
    actionLabel: 'View',
    sourceEvidence: {
      documentId: 'DOC003',
      documentName: 'Discharge Summary • Rahul Kumar',
      pageNumber: 1,
      sectionTitle: 'Surgical Instructions',
      extractedText: 'Routine post-op follow-up in 2 weeks with Dr. Desai.',
      confidence: 0.97,
    },
  },
];

// ── Needs Human Review Queue (Doctor Feature) ─────────────────


export const demoNeedsReviewQueue: NeedsReviewItem[] = [
  {
    id: 'NR01',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    issue: 'Missing follow-up date for Nephrology referral',
    category: 'missing-date',
    source: 'Discharge Summary • Arun Kumar',
    page: 4,
    priority: 'immediate',
    extractedText: 'Consider nephrology consultation for serum creatinine 1.4 at discharge.',
    flagReason: 'No timeframe, target provider, or urgency window specified in discharge document.',
  },
  {
    id: 'NR02',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    issue: 'Conflicting discharge instructions regarding weight-bearing status',
    category: 'conflicting-instructions',
    source: 'Discharge Summary • Lakshmi Venkatesh',
    page: 3,
    priority: 'immediate',
    extractedText: 'Discharge order: "Strict non-weight bearing 4w". Rehab note: "Partial weight-bearing as tolerated".',
    flagReason: 'Conflicting clinical directives between attending surgeon order and rehab notes.',
  },
  {
    id: 'NR03',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    issue: 'Patient asked a medication question regarding blood thinner interaction',
    category: 'medication-question',
    source: 'Patient Portal Message',
    page: 1,
    priority: 'high',
    extractedText: '"Can I take ibuprofen for headaches while on Aspirin and Clopidogrel?"',
    flagReason: 'System does NOT answer medication questions autonomously. Routed to care team.',
  },
  {
    id: 'NR04',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    issue: 'Clinically sensitive item — Post-discharge hypoglycemic symptoms reported',
    category: 'clinically-sensitive',
    source: 'Vitals Log Note',
    page: 2,
    priority: 'high',
    extractedText: 'Morning blood glucose logged as 62 mg/dL with mild tremor.',
    flagReason: 'Symptom report requires human clinician assessment of insulin/metformin dosing.',
  },
];

// ── Overdue Tasks Section ─────────────────────────────────────

export interface OverdueItem {
  id: string;
  patientId: string;
  patientName: string;
  taskTitle: string;
  dueDate: string;
  attending: string;
  contactPhone: string;
  daysOverdue: number;
}

export const demoOverdueItems: OverdueItem[] = [
  {
    id: 'OD01',
    patientId: 'P004',
    patientName: 'Ravi Kumar',
    taskTitle: 'Cardiology follow-up',
    dueDate: '07 Oct 2026',
    attending: 'Dr. Meera Patel',
    contactPhone: '+91 65432 10987',
    daysOverdue: 1,
  },
];

// ── Upcoming Deadlines Section ────────────────────────────────

export interface UpcomingDeadlineItem {
  id: string;
  patientId: string;
  patientName: string;
  taskTitle: string;
  dueDate: string;
  specialty: string;
  status: 'pending' | 'confirmed';
}

export const demoUpcomingDeadlines: UpcomingDeadlineItem[] = [
  {
    id: 'UD01',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    taskTitle: 'Orthopedic Surgical Review',
    dueDate: '14 Oct 2026',
    specialty: 'Orthopedics',
    status: 'pending',
  },
  {
    id: 'UD02',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    taskTitle: 'Cardiology follow-up',
    dueDate: '15 Oct 2026',
    specialty: 'Cardiology',
    status: 'confirmed',
  },
  {
    id: 'UD03',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    taskTitle: 'Fasting Blood Glucose & HbA1c',
    dueDate: '18 Oct 2026',
    specialty: 'Endocrinology / Labs',
    status: 'pending',
  },
  {
    id: 'UD04',
    patientId: 'P003',
    patientName: 'Rahul Kumar',
    taskTitle: 'Wound care check',
    dueDate: '22 Oct 2026',
    specialty: 'General Surgery',
    status: 'confirmed',
  },
];

// ── AI Reminder Activity Simulation ──────────────────────────

export interface ReminderActivitySimulation {
  patientId: string;
  patientName: string;
  scheduledTime: string;
  purpose: string;
  channel: 'Voice Call' | 'SMS' | 'Portal';
  currentStatus: 'Scheduled' | 'In Progress' | 'Delivered' | 'Unanswered Fallback';
  attempts: {
    attemptNumber: number;
    description: string;
    status: 'Completed' | 'No Answer' | 'Pending' | 'Scheduled';
    timestamp?: string;
  }[];
  smsFallbackStatus: 'Pending' | 'Delivered' | 'Scheduled';
}

export const demoReminderSimulation: ReminderActivitySimulation = {
  patientId: 'P001',
  patientName: 'Arun Kumar',
  scheduledTime: '14 Oct 2026 • 10:00 AM',
  purpose: 'Informational follow-up reminder regarding Cardiology appointment on 15 Oct',
  channel: 'Voice Call',
  currentStatus: 'Scheduled',
  attempts: [
    {
      attemptNumber: 1,
      description: 'Attempt 1 — Automated phone call (Simulated)',
      status: 'No Answer',
      timestamp: '14 Oct • 10:00 AM',
    },
    {
      attemptNumber: 2,
      description: 'Attempt 2 — Automatic retry in 30 minutes',
      status: 'Scheduled',
      timestamp: '14 Oct • 10:30 AM',
    },
  ],
  smsFallbackStatus: 'Pending',
};

// ── Appointments ─────────────────────────────────────────────

export const demoAppointments: Appointment[] = [
  {
    id: 'APT001',
    patientId: 'P001',
    doctorId: 'D001',
    doctorName: 'Dr. Meera Patel',
    specialization: 'Cardiology',
    date: '15 October 2026',
    time: '10:30 AM',
    location: 'Cardiovascular Care Center, Suite 204',
    status: 'pending',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Post-Discharge Specialist Plan',
      extractedText: 'Cardiology outpatient visit scheduled for Oct 15 at 10:30 AM with Dr. Patel.',
      confidence: 0.98,
    },
  },
];

// ── Medications ──────────────────────────────────────────────

export const demoMedications: MedicationInstruction[] = [
  {
    id: 'MED001',
    patientId: 'P001',
    medicationName: 'Aspirin',
    dosage: '81 mg',
    frequency: 'Once daily with breakfast',
    duration: '12 months',
    instructions: 'Take with food to minimize stomach upset. Do not skip doses.',
    warnings: ['Do not stop taking without consulting your cardiologist.'],
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Discharge Prescriptions',
      extractedText: 'Aspirin 81 mg daily PO with meals.',
      confidence: 0.99,
    },
  },
  {
    id: 'MED002',
    patientId: 'P001',
    medicationName: 'Atorvastatin',
    dosage: '40 mg',
    frequency: 'Once daily at bedtime',
    duration: 'Ongoing',
    instructions: 'Take at bedtime. Avoid grapefruit and grapefruit juice.',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Discharge Prescriptions',
      extractedText: 'Atorvastatin 40 mg PO QHS.',
      confidence: 0.99,
    },
  },
  {
    id: 'MED003',
    patientId: 'P001',
    medicationName: 'Metoprolol Tartrate',
    dosage: '25 mg',
    frequency: 'Twice daily with meals',
    duration: 'As instructed by cardiologist',
    instructions: 'Take with or immediately after food. Check pulse prior to taking.',
    warnings: ['May cause lightheadedness if standing up quickly.'],
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Discharge Prescriptions',
      extractedText: 'Metoprolol tartrate 25 mg PO BID.',
      confidence: 0.98,
    },
  },
];

// ── Care Instructions ────────────────────────────────────────

export const demoCareInstructions: CareInstruction[] = [
  {
    id: 'CI001',
    patientId: 'P001',
    category: 'Activity Guidelines',
    title: 'Gradual recovery and walking routine',
    description: 'Walk on flat surfaces 10–15 minutes daily. Do not lift anything heavier than 10 lbs (4.5 kg) for 4 weeks.',
    importance: 'high',
  },
  {
    id: 'CI002',
    patientId: 'P001',
    category: 'Heart-Healthy Nutrition',
    title: 'Low sodium and heart-smart diet',
    description: 'Keep sodium below 2,000 mg/day. Prioritize vegetables, lean poultry, and whole grains. Avoid processed deli meats.',
    importance: 'medium',
  },
];

// ── Warning Signs ────────────────────────────────────────────

export const demoWarnings: WarningSign[] = [
  {
    id: 'WS001',
    patientId: 'P001',
    symptom: 'Chest pressure, tightness, or pain spreading to arm or jaw',
    action: 'Call Emergency Services (112 / 911) immediately. Do not drive yourself.',
    severity: 'emergency',
  },
  {
    id: 'WS002',
    patientId: 'P001',
    symptom: 'Sudden shortness of breath while resting or lying flat',
    action: 'Call Emergency Services (112 / 911) immediately.',
    severity: 'emergency',
  },
  {
    id: 'WS003',
    patientId: 'P001',
    symptom: 'Swelling, redness, or warmth at femoral puncture site',
    action: 'Contact cardiovascular clinic coordinator within 2 hours.',
    severity: 'warning',
  },
];

// ── Discharge Document ───────────────────────────────────────

export const demoDocuments: DischargeDocument[] = [
  {
    id: 'DOC001',
    patientId: 'P001',
    type: 'discharge-summary',
    fileName: 'Discharge_Summary_Arun_Kumar_Oct2026.pdf',
    uploadedAt: '2026-10-05T14:30:00',
    processedAt: '2026-10-05T14:32:00',
    status: 'processed',
    pageCount: 5,
  },
];

// ── Dashboard Statistics (Doctor) ────────────────────────────

export const demoDashboardStats: DashboardStats = {
  totalPatients: 5,
  pendingFollowUps: 7,
  upcomingDeadlines: 4,
  overdueItems: 1,
  needsReview: 3,
  escalations: 4,
  completedToday: 2,
};
