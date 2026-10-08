// ============================================================
// CareFlow AI — Synthetic Demo Data
// All data is fictional and for demonstration purposes only.
// ============================================================

import type {
  Patient,
  Doctor,
  FollowUpTask,
  Appointment,
  Referral,
  Test,
  MedicationInstruction,
  CareInstruction,
  WarningSign,
  Escalation,
  ReminderAttempt,
  DischargeDocument,
  DashboardStats,
  PatientProgress,
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
    name: 'Mohammed Faiz',
    age: 67,
    gender: 'Male',
    contactPhone: '+91 76543 21098',
    contactEmail: 'mohammed.faiz@example.com',
    preferredLanguage: 'Urdu',
    admissionDate: '2026-10-02',
    dischargeDate: '2026-10-07',
    primaryDiagnosis: 'COPD Exacerbation',
    attendingPhysician: 'Dr. Meera Patel',
  },
  {
    id: 'P004',
    name: 'Lakshmi Venkatesh',
    age: 73,
    gender: 'Female',
    contactPhone: '+91 65432 10987',
    contactEmail: 'lakshmi.v@example.com',
    preferredLanguage: 'Tamil',
    admissionDate: '2026-09-30',
    dischargeDate: '2026-10-04',
    primaryDiagnosis: 'Hip Fracture — Post-surgical Recovery',
    attendingPhysician: 'Dr. Ananya Desai',
  },
  {
    id: 'P005',
    name: 'Ravi Krishnan',
    age: 35,
    gender: 'Male',
    contactPhone: '+91 54321 09876',
    contactEmail: 'ravi.k@example.com',
    preferredLanguage: 'English',
    admissionDate: '2026-10-03',
    dischargeDate: '2026-10-06',
    primaryDiagnosis: 'Appendectomy — Post-operative',
    attendingPhysician: 'Dr. Rajesh Iyer',
  },
];

// ── Doctors ───────────────────────────────────────────────────

export const demoDoctors: Doctor[] = [
  {
    id: 'D001',
    name: 'Dr. Meera Patel',
    specialization: 'Cardiology',
    department: 'Cardiac Care',
    contactPhone: '+91 98700 00001',
    contactEmail: 'meera.patel@hospital.example.com',
  },
  {
    id: 'D002',
    name: 'Dr. Rajesh Iyer',
    specialization: 'Internal Medicine',
    department: 'General Medicine',
    contactPhone: '+91 98700 00002',
    contactEmail: 'rajesh.iyer@hospital.example.com',
  },
  {
    id: 'D003',
    name: 'Dr. Ananya Desai',
    specialization: 'Orthopedics',
    department: 'Orthopedic Surgery',
    contactPhone: '+91 98700 00003',
    contactEmail: 'ananya.desai@hospital.example.com',
  },
];

// ── Current Patient (for patient dashboard demo) ────────────

export const currentPatient = demoPatients[0];

// ── Follow-up Tasks ─────────────────────────────────────────

export const demoFollowUpTasks: FollowUpTask[] = [
  {
    id: 'FT001',
    patientId: 'P001',
    title: 'Cardiology follow-up appointment',
    description: 'Follow-up with cardiology for post-MI monitoring and stress test evaluation.',
    category: 'appointment',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-10-15',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Follow-up Instructions',
      extractedText: 'Patient to follow up with cardiology within 10 days of discharge.',
      confidence: 0.95,
    },
  },
  {
    id: 'FT002',
    patientId: 'P001',
    title: 'Complete blood test — Lipid panel',
    description: 'Fasting lipid panel to monitor cholesterol levels post-discharge.',
    category: 'test',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-10-08',
    completedDate: '2026-10-08',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-08',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Lab Orders',
      extractedText: 'Fasting lipid panel within 3 days of discharge.',
      confidence: 0.92,
    },
  },
  {
    id: 'FT003',
    patientId: 'P001',
    title: 'Echocardiogram',
    description: 'Echocardiogram to assess cardiac function.',
    category: 'test',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-10-20',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Diagnostic Follow-up',
      extractedText: 'Echocardiogram within 2 weeks.',
      confidence: 0.90,
    },
  },
  {
    id: 'FT004',
    patientId: 'P001',
    title: 'Nephrology referral follow-up date',
    description: 'Referral to nephrology was mentioned but no date specified.',
    category: 'referral',
    status: 'needs-review',
    priority: 'medium',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Referrals',
      extractedText: 'Consider nephrology referral for elevated creatinine.',
      confidence: 0.72,
    },
  },
  {
    id: 'FT005',
    patientId: 'P001',
    title: 'Cardiac rehabilitation enrollment',
    description: 'Enroll in phase II cardiac rehabilitation program.',
    category: 'referral',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-10-22',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Rehabilitation',
      extractedText: 'Cardiac rehab phase II, begin within 2–3 weeks post-discharge.',
      confidence: 0.88,
    },
  },
  {
    id: 'FT006',
    patientId: 'P002',
    title: 'Endocrinology follow-up',
    description: 'Follow-up with endocrinology for diabetes management adjustment.',
    category: 'appointment',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-10-13',
    createdAt: '2026-10-06',
    updatedAt: '2026-10-06',
  },
  {
    id: 'FT007',
    patientId: 'P002',
    title: 'Follow-up date not specified',
    description: 'Dietitian consultation was recommended but no timeline provided.',
    category: 'referral',
    status: 'needs-review',
    priority: 'medium',
    createdAt: '2026-10-06',
    updatedAt: '2026-10-06',
  },
  {
    id: 'FT008',
    patientId: 'P003',
    title: 'Pulmonology follow-up',
    description: 'Follow-up with pulmonology for COPD management.',
    category: 'appointment',
    status: 'overdue',
    priority: 'high',
    dueDate: '2026-10-07',
    createdAt: '2026-10-07',
    updatedAt: '2026-10-07',
  },
  {
    id: 'FT009',
    patientId: 'P004',
    title: 'Orthopedic follow-up — X-ray review',
    description: 'Post-operative X-ray review with orthopedics.',
    category: 'appointment',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-10-14',
    createdAt: '2026-10-04',
    updatedAt: '2026-10-04',
  },
  {
    id: 'FT010',
    patientId: 'P004',
    title: 'Physical therapy sessions',
    description: 'Begin outpatient physical therapy for hip mobility.',
    category: 'referral',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-18',
    createdAt: '2026-10-04',
    updatedAt: '2026-10-06',
  },
];

// ── Appointments ─────────────────────────────────────────────

export const demoAppointments: Appointment[] = [
  {
    id: 'APT001',
    patientId: 'P001',
    doctorId: 'D001',
    doctorName: 'Dr. Meera Patel',
    specialization: 'Cardiology',
    date: '2026-10-15',
    time: '10:30 AM',
    location: 'Cardiac Care Center, Room 204',
    status: 'pending',
  },
  {
    id: 'APT002',
    patientId: 'P001',
    doctorName: 'Dr. Sanjay Gupta',
    specialization: 'Nephrology',
    date: '',
    status: 'needs-review',
    notes: 'Referral mentioned but no appointment date specified.',
  },
];

// ── Referrals ────────────────────────────────────────────────

export const demoReferrals: Referral[] = [
  {
    id: 'REF001',
    patientId: 'P001',
    specialization: 'Nephrology',
    reason: 'Elevated creatinine levels observed during admission.',
    referredBy: 'Dr. Meera Patel',
    status: 'needs-review',
    priority: 'medium',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Referrals',
      extractedText: 'Consider nephrology referral for elevated creatinine.',
      confidence: 0.72,
    },
  },
  {
    id: 'REF002',
    patientId: 'P001',
    specialization: 'Cardiac Rehabilitation',
    reason: 'Post-MI cardiac rehabilitation program.',
    referredBy: 'Dr. Meera Patel',
    referredTo: 'City Cardiac Rehab Center',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-10-22',
  },
];

// ── Tests ────────────────────────────────────────────────────

export const demoTests: Test[] = [
  {
    id: 'TST001',
    patientId: 'P001',
    testName: 'Fasting Lipid Panel',
    category: 'Blood Test',
    status: 'completed',
    scheduledDate: '2026-10-08',
    completedDate: '2026-10-08',
    results: 'Total Cholesterol: 210 mg/dL, LDL: 130 mg/dL, HDL: 45 mg/dL',
  },
  {
    id: 'TST002',
    patientId: 'P001',
    testName: 'Echocardiogram',
    category: 'Cardiac Imaging',
    status: 'pending',
    scheduledDate: '2026-10-20',
  },
  {
    id: 'TST003',
    patientId: 'P001',
    testName: 'HbA1c',
    category: 'Blood Test',
    status: 'pending',
    scheduledDate: '2026-10-15',
  },
];

// ── Medications ──────────────────────────────────────────────

export const demoMedications: MedicationInstruction[] = [
  {
    id: 'MED001',
    patientId: 'P001',
    medicationName: 'Aspirin',
    dosage: '75 mg',
    frequency: 'Once daily',
    duration: 'Ongoing',
    instructions: 'Take with food in the morning.',
    warnings: ['Do not take with other blood thinners without consulting your doctor.'],
  },
  {
    id: 'MED002',
    patientId: 'P001',
    medicationName: 'Atorvastatin',
    dosage: '40 mg',
    frequency: 'Once daily at bedtime',
    duration: 'Ongoing',
    instructions: 'Take at bedtime. Avoid grapefruit juice.',
  },
  {
    id: 'MED003',
    patientId: 'P001',
    medicationName: 'Metoprolol',
    dosage: '25 mg',
    frequency: 'Twice daily',
    duration: 'As directed by cardiologist',
    instructions: 'Take with meals. Do not stop abruptly.',
    warnings: ['May cause dizziness. Avoid sudden position changes.'],
  },
];

// ── Care Instructions ────────────────────────────────────────

export const demoCareInstructions: CareInstruction[] = [
  {
    id: 'CI001',
    patientId: 'P001',
    category: 'Diet',
    title: 'Heart-healthy diet',
    description: 'Follow a low-sodium, low-fat diet. Increase fruits, vegetables, and whole grains. Limit processed foods and red meat.',
    importance: 'high',
  },
  {
    id: 'CI002',
    patientId: 'P001',
    category: 'Activity',
    title: 'Gradual activity increase',
    description: 'Begin with light walking (10–15 minutes). Gradually increase activity as tolerated. Avoid heavy lifting (>10 lbs) for 4 weeks.',
    importance: 'high',
  },
  {
    id: 'CI003',
    patientId: 'P001',
    category: 'Monitoring',
    title: 'Daily vitals monitoring',
    description: 'Check blood pressure and heart rate daily. Record readings and bring to next appointment.',
    importance: 'medium',
  },
];

// ── Warning Signs ────────────────────────────────────────────

export const demoWarnings: WarningSign[] = [
  {
    id: 'WS001',
    patientId: 'P001',
    symptom: 'Chest pain or pressure',
    action: 'Call emergency services (112) immediately.',
    severity: 'emergency',
  },
  {
    id: 'WS002',
    patientId: 'P001',
    symptom: 'Shortness of breath at rest',
    action: 'Call emergency services (112) immediately.',
    severity: 'emergency',
  },
  {
    id: 'WS003',
    patientId: 'P001',
    symptom: 'Unusual swelling in legs or ankles',
    action: 'Contact your doctor within 24 hours.',
    severity: 'warning',
  },
  {
    id: 'WS004',
    patientId: 'P001',
    symptom: 'Persistent dizziness or lightheadedness',
    action: 'Contact your doctor within 24 hours.',
    severity: 'warning',
  },
];

// ── Escalations ──────────────────────────────────────────────

export const demoEscalations: Escalation[] = [
  {
    id: 'ESC001',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    reason: 'Nephrology referral — no follow-up date specified in discharge summary.',
    category: 'missing-info',
    level: 'medium',
    status: 'open',
    createdAt: '2026-10-05',
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary — Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Referrals',
      extractedText: 'Consider nephrology referral for elevated creatinine.',
      confidence: 0.72,
    },
  },
  {
    id: 'ESC002',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    reason: 'Dietitian consultation recommended but no timeline provided.',
    category: 'missing-info',
    level: 'low',
    status: 'open',
    createdAt: '2026-10-06',
  },
  {
    id: 'ESC003',
    patientId: 'P003',
    patientName: 'Mohammed Faiz',
    reason: 'Pulmonology follow-up is overdue. Patient has not responded to reminder calls.',
    category: 'clinical',
    level: 'high',
    status: 'open',
    createdAt: '2026-10-08',
  },
  {
    id: 'ESC004',
    patientId: 'P004',
    patientName: 'Lakshmi Venkatesh',
    reason: 'Conflicting instructions on weight-bearing activity between orthopedics and physical therapy notes.',
    category: 'conflicting',
    level: 'high',
    status: 'in-review',
    assignedTo: 'Dr. Ananya Desai',
    createdAt: '2026-10-07',
  },
];

// ── Reminders ────────────────────────────────────────────────

export const demoReminders: ReminderAttempt[] = [
  {
    id: 'REM001',
    patientId: 'P001',
    taskId: 'FT001',
    taskTitle: 'Cardiology follow-up appointment',
    channel: 'phone',
    status: 'delivered',
    scheduledAt: '2026-10-08T09:00:00',
    attemptedAt: '2026-10-08T09:00:00',
    responseAt: '2026-10-08T09:02:00',
    retryCount: 0,
    maxRetries: 3,
    notes: 'Patient acknowledged the reminder.',
  },
  {
    id: 'REM002',
    patientId: 'P001',
    taskId: 'FT003',
    taskTitle: 'Echocardiogram',
    channel: 'sms',
    status: 'sent',
    scheduledAt: '2026-10-10T10:00:00',
    attemptedAt: '2026-10-10T10:00:00',
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'REM003',
    patientId: 'P003',
    taskId: 'FT008',
    taskTitle: 'Pulmonology follow-up',
    channel: 'phone',
    status: 'unanswered',
    scheduledAt: '2026-10-07T14:00:00',
    attemptedAt: '2026-10-07T14:00:00',
    retryCount: 2,
    maxRetries: 3,
    notes: 'No answer after 2 attempts. SMS fallback sent.',
  },
];

// ── Discharge Documents ──────────────────────────────────────

export const demoDocuments: DischargeDocument[] = [
  {
    id: 'DOC001',
    patientId: 'P001',
    type: 'discharge-summary',
    fileName: 'Discharge_Summary_Arun_Kumar.pdf',
    uploadedAt: '2026-10-05T14:30:00',
    processedAt: '2026-10-05T14:32:00',
    status: 'processed',
    pageCount: 6,
  },
];

// ── Dashboard Stats (Doctor) ─────────────────────────────────

export const demoDashboardStats: DashboardStats = {
  totalPatients: 5,
  pendingFollowUps: 7,
  upcomingDeadlines: 4,
  overdueItems: 1,
  needsReview: 3,
  escalations: 4,
  completedToday: 2,
};

// ── Patient Progress ─────────────────────────────────────────

export const demoPatientProgress: PatientProgress = {
  total: 5,
  completed: 1,
  pending: 2,
  overdue: 0,
  needsReview: 1,
  percentage: 20,
};
