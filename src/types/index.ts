// ============================================================
// CareFlow AI — Core Type Definitions
// Phase 1: Frontend Foundation
// ============================================================

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'needs-review' | 'cancelled' | 'at-risk';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'patient' | 'doctor' | 'coordinator';
export type EscalationLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReminderChannel = 'phone' | 'sms' | 'email' | 'in-app';
export type ReminderStatus = 'scheduled' | 'sent' | 'delivered' | 'answered' | 'unanswered' | 'failed';
export type DocumentType = 'discharge-summary' | 'lab-report' | 'prescription' | 'referral' | 'imaging';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contactPhone: string;
  contactEmail: string;
  preferredLanguage: string;
  admissionDate: string;
  dischargeDate: string;
  primaryDiagnosis: string;
  attendingPhysician: string;
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  contactPhone: string;
  contactEmail: string;
  availableSlots?: string[];
  avatarUrl?: string;
}

export interface DischargeDocument {
  id: string;
  patientId: string;
  type: DocumentType;
  fileName: string;
  uploadedAt: string;
  processedAt?: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  extractedData?: Record<string, unknown>;
  pageCount?: number;
}

export interface SourceEvidence {
  documentId: string;
  documentName: string;
  pageNumber: number;
  sectionTitle?: string;
  extractedText: string;
  confidence: number;
}

export interface FollowUpTask {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: 'appointment' | 'test' | 'medication' | 'referral' | 'lifestyle' | 'monitoring';
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedDate?: string;
  assignedTo?: string;
  sourceEvidence?: SourceEvidence;
  dependencyLinks?: { type: 'required-before' | 'depends-on'; targetTaskId: string; }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName: string;
  specialization: string;
  date: string;
  time?: string;
  location?: string;
  status: TaskStatus;
  sourceEvidence?: SourceEvidence;
  notes?: string;
}

export interface Referral {
  id: string;
  patientId: string;
  specialization: string;
  reason: string;
  referredBy: string;
  referredTo?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  sourceEvidence?: SourceEvidence;
}

export interface Test {
  id: string;
  patientId: string;
  testName: string;
  category: string;
  status: TaskStatus;
  scheduledDate?: string;
  completedDate?: string;
  results?: string;
  sourceEvidence?: SourceEvidence;
}

export interface MedicationInstruction {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions: string;
  warnings?: string[];
  sourceEvidence?: SourceEvidence;
}

export interface CareInstruction {
  id: string;
  patientId: string;
  category: string;
  title: string;
  description: string;
  importance: TaskPriority;
  sourceEvidence?: SourceEvidence;
}

export interface WarningSign {
  id: string;
  patientId: string;
  symptom: string;
  action: string;
  severity: 'warning' | 'emergency';
  sourceEvidence?: SourceEvidence;
}

export interface Escalation {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  category: 'missing-info' | 'ambiguous' | 'conflicting' | 'medication' | 'new-symptom' | 'clinical';
  level: EscalationLevel;
  status: 'open' | 'in-review' | 'resolved' | 'dismissed';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
  sourceEvidence?: SourceEvidence;
}

export interface ReminderAttempt {
  id: string;
  patientId: string;
  taskId: string;
  taskTitle: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  scheduledAt: string;
  attemptedAt?: string;
  responseAt?: string;
  retryCount: number;
  maxRetries: number;
  notes?: string;
}

export interface Provider {
  id: string;
  name: string;
  specialization: string;
  facility: string;
  address: string;
  phone: string;
  availability: string;
  acceptsInsurance: string[];
  rating?: number;
  distance?: string;
}

export interface DashboardStats {
  totalPatients: number;
  pendingFollowUps: number;
  upcomingDeadlines: number;
  overdueItems: number;
  needsReview: number;
  escalations: number;
  completedToday: number;
}

export interface PatientProgress {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  needsReview: number;
  percentage: number;
}

export type CareCoordinationPriorityLevel = 'immediate-review' | 'high-priority' | 'routine';

export interface CareCoordinationPriorityItem {
  id: string;
  patientId: string;
  patientName: string;
  level: CareCoordinationPriorityLevel;
  reason: string;
  followUp: string;
  dueDate: string;
  status: TaskStatus;
  actionLabel: string;
  sourceEvidence?: SourceEvidence;
}

export interface NeedsReviewItem {
  id: string;
  patientId: string;
  patientName: string;
  issue: string;
  category: 'missing-date' | 'conflicting-instructions' | 'medication-question' | 'clinically-sensitive';
  source: string;
  page: number;
  priority: 'immediate' | 'high' | 'routine';
  extractedText: string;
  flagReason: string;
}

export interface AuthUser {
  id?: string;
  username?: string;
  role: UserRole;
  name: string;
  email?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token?: string | null;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  role?: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, preferredRole?: UserRole) => Promise<LoginResult>;
  logout: () => void;
}

export const DEMO_CREDENTIALS = {
  patient: {
    username: 'patient',
    password: 'patient123',
    role: 'patient' as UserRole,
    name: 'Arun Kumar',
  },
  doctor: {
    username: 'doctor',
    password: 'doctor123',
    role: 'doctor' as UserRole,
    name: 'Dr. Meera Patel',
  },
};

// ============================================================
// Gemini AI Discharge Intelligence Types
// ============================================================

export interface ExtractedAppointment {
  specialty: string;
  doctorName?: string;
  date: string;
  time?: string;
  location?: string;
  reason: string;
  sourceEvidence: string;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

export interface ExtractedLabTest {
  testName: string;
  targetDate: string;
  instructions: string;
  fastingRequired?: boolean;
  sourceEvidence: string;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

export interface ExtractedReferral {
  providerType: string;
  reason: string;
  urgency?: string;
  notes?: string;
  sourceEvidence: string;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

export interface ExtractedMedication {
  medicationName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  specialInstructions?: string;
  duration?: string;
  sourceEvidence: string;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

export interface ExtractedCareInstruction {
  category: string;
  instruction: string;
  sourceEvidence: string;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

export interface ExtractedWarningSign {
  symptom: string;
  urgency?: string;
  actionRequired?: string;
  sourceEvidence: string;
}

export interface ExtractedNeedsReviewItem {
  category: string;
  item: string;
  issue: string;
  reason: string;
  sourceEvidence?: string;
}

export interface ExtractedDateItem {
  date: string;
  label: string;
  context?: string;
  isAmbiguous?: boolean;
}

export interface ExtractedEvidenceItem {
  key: string;
  snippet: string;
  pageOrSection?: string;
}

export interface DischargeAnalysisResult {
  summary: string;
  patientInfo?: {
    name?: string;
    mrn?: string;
    dob?: string;
    gender?: string;
    primaryDiagnosis?: string;
    admissionDate?: string;
    dischargeDate?: string;
    attendingPhysician?: string;
  };
  appointments: ExtractedAppointment[];
  tests: ExtractedLabTest[];
  referrals: ExtractedReferral[];
  medicationInstructions: ExtractedMedication[];
  careInstructions: ExtractedCareInstruction[];
  warningSigns: (ExtractedWarningSign | string)[];
  needsReview: ExtractedNeedsReviewItem[];
  extractedDates: ExtractedDateItem[];
  evidence: ExtractedEvidenceItem[];
  patient_mrn?: string;
  patient_name?: string;
  discharge_date?: string;
  follow_ups?: Array<{ specialty: string; appointment_date: string; instruction: string }>;
  medication_instructions?: Array<{ medication_name: string; instruction: string }>;
  care_instructions?: Array<Record<string, string>>;
  warning_signs?: string[];
  source_evidence?: Array<{ extracted_text: string; page?: number }>;
}



