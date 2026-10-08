// ============================================================
// CareFlow AI — Core Type Definitions
// Phase 1: Frontend Foundation
// ============================================================

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'needs-review' | 'cancelled';
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

