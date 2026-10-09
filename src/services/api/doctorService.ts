// CareFlow AI - Doctor & Care Coordinator Services
import { fetchJson, BASE_URL } from './client';

export interface DoctorStats {
  totalPatients: number;
  pendingFollowUps: number;
  highPriority: number;
  needsReview: number;
  overdue: number;
}

export interface UploadDocumentResponse {
  message: string;
  documentId: number;
  filename: string;
  fileSize: number;
  needsReview: boolean;
  reason?: string | null;
  patientName?: string | null;
  extractionId?: number | null;
}

export interface DocumentRecord {
  id: number;
  patientId: string | null;
  patientName: string;
  originalFilename: string;
  uploadDate: string;
  status: string;
  needsReview: boolean;
  reviewReason: string | null;
}

export interface MatchedPatientInfo {
  id: string;
  mrn: string;
  name: string;
  dob: string;
  gender: string;
  primaryDiagnosis: string;
  department: string;
  admissionDate: string;
  dischargeDate: string;
  dischargeStatus?: string;
  attendingPhysician: string;
  contactPhone: string;
  priorityLevel: string;
  activeTasksCount: number;
  appointmentsCount: number;
  testsCount: number;
}

export interface PatientMatchResponse {
  status: 'new' | 'existing' | 'ambiguous';
  suggestedMrn?: string;
  extractedDetails?: {
    name?: string;
    dob?: string;
    gender?: string;
    contactPhone?: string;
    primaryDiagnosis?: string;
    department?: string;
  };
  patient?: MatchedPatientInfo;
  candidates?: MatchedPatientInfo[];
}

export interface DocumentDetailResponse extends DocumentRecord {
  extraction: Record<string, any>;
}

export const doctorService = {
  matchExtractedPatient: async (query: {
    mrn?: string | null;
    name?: string | null;
    dob?: string | null;
    gender?: string | null;
    contactPhone?: string | null;
    primaryDiagnosis?: string | null;
    department?: string | null;
  }): Promise<PatientMatchResponse> => {
    return await fetchJson<PatientMatchResponse>('/api/doctor/patients/match-extracted', {
      method: 'POST',
      body: JSON.stringify(query)
    });
  },

  registerAndApprovePatient: async (payload: {
    patient: {
      id: string;
      name: string;
      dob?: string;
      gender?: string;
      contactPhone?: string;
      primaryDiagnosis?: string;
      admissionDate?: string;
      dischargeDate?: string;
      attendingPhysician?: string;
      priorityLevel?: string;
    };
    documentId?: number | null;
    filename?: string;
    extraction: any;
  }): Promise<any> => {
    return await fetchJson<any>('/api/doctor/patients/register-and-approve', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateAndApprovePatient: async (payload: {
    patientId: string;
    updatedFields: Record<string, any>;
    documentId?: number | null;
    filename?: string;
    extraction: any;
  }): Promise<any> => {
    return await fetchJson<any>('/api/doctor/patients/update-and-approve', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getStats: async (): Promise<DoctorStats> => {
    return await fetchJson<DoctorStats>('/api/doctor/stats');
  },

  getPatients: async (): Promise<any[]> => {
    return await fetchJson<any[]>('/api/doctor/patients');
  },

  getFollowUps: async (): Promise<any[]> => {
    return await fetchJson<any[]>('/api/doctor/follow-ups');
  },

  getTasks: async (): Promise<any[]> => {
    return await fetchJson<any[]>('/api/doctor/tasks');
  },

  createTask: async (task: { patientId: string; title: string; dueDate: string; taskType?: string; specialty?: string; attending?: string; source?: string }): Promise<any> => {
    return await fetchJson<any>('/api/doctor/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  updateTaskStatus: async (taskId: string, status: string): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  getCareInstructions: async (): Promise<any[]> => {
    return await fetchJson<any[]>('/api/doctor/care-instructions');
  },

  getNeedsReview: async (): Promise<any[]> => {
    return await fetchJson<any[]>('/api/doctor/reviews');
  },

  getOverdue: async (): Promise<any[]> => {
    return await fetchJson<any[]>('/api/doctor/overdue');
  },

  getDocuments: async (): Promise<DocumentRecord[]> => {
    return await fetchJson<DocumentRecord[]>('/api/doctor/documents');
  },

  getDocumentDetail: async (docId: number): Promise<DocumentDetailResponse> => {
    return await fetchJson<DocumentDetailResponse>(`/api/doctor/documents/${docId}`);
  },

  approveDocument: async (docId: number): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/documents/${docId}/approve`, {
      method: 'POST'
    });
  },

  approveExtraction: async (extraction: Record<string, any>, filename?: string): Promise<any> => {
    return await fetchJson<any>('/api/doctor/documents/approve-extraction', {
      method: 'POST',
      body: JSON.stringify({ extraction, filename: filename || "Discharge_Summary.txt" })
    });
  },

  rejectDocument: async (docId: number, reason?: string): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/documents/${docId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || "Manual entry required" })
    });
  },

  getExtraction: async (docId: number): Promise<any> => {
    try {
      return await fetchJson<any>(`/api/doctor/extraction/${docId}`);
    } catch {
      return null;
    }
  },

  uploadDocument: async (file: File): Promise<UploadDocumentResponse & { document_id: number; file_size: number }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/doctor/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      let errMsg = 'Upload failed';
      try {
        const errJson = await res.json();
        errMsg = errJson.detail || errJson.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    const raw = await res.json();
    return {
      ...raw,
      documentId: raw.document_id || raw.documentId,
      document_id: raw.document_id || raw.documentId,
      fileSize: raw.file_size || raw.fileSize,
      file_size: raw.file_size || raw.fileSize,
      needsReview: raw.needs_review !== undefined ? raw.needs_review : raw.needsReview,
      patientName: raw.patient_name || raw.patientName,
      extractionId: raw.extraction_id || raw.extractionId
    };
  },

  getAppointments: async (patientId?: string): Promise<any[]> => {
    const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : '';
    return await fetchJson<any[]>(`/api/doctor/appointments${query}`);
  },

  createAppointment: async (payload: {
    patient_id: string;
    appointment_date: string;
    time_str?: string;
    doctor_name?: string;
    department?: string;
    location?: string;
    notes?: string;
    send_confirmation_email?: boolean;
    patient_email?: string;
    recipient_email?: string;
    status?: string;
  }): Promise<any> => {
    return await fetchJson<any>('/api/doctor/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  confirmAppointment: async (apptId: string): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/appointments/${apptId}/confirm`, {
      method: 'POST'
    });
  },

  getNotifications: async (params?: { scenario?: string; patient_id?: string; channel?: string }): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params?.scenario) searchParams.append('scenario', params.scenario);
    if (params?.patient_id) searchParams.append('patient_id', params.patient_id);
    if (params?.channel) searchParams.append('channel', params.channel);
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return await fetchJson<any[]>(`/api/doctor/notifications${queryStr}`);
  },

  registerPatient: async (payload: {
    name: string;
    dob?: string;
    age?: number;
    gender?: string;
    blood_group?: string;
    contact_phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    department?: string;
    attending_physician?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    preferred_language?: string;
    email_consent?: boolean;
    sms_consent?: boolean;
    notes?: string;
    allow_duplicate?: boolean;
  }): Promise<any> => {
    return await fetchJson<any>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  searchPatients: async (query: string): Promise<any[]> => {
    return await fetchJson<any[]>(`/api/doctor/patients/search?q=${encodeURIComponent(query)}`);
  },

  getPatientProfile: async (patientId: string): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/patients/${encodeURIComponent(patientId)}`);
  },

  updatePatient: async (patientId: string, payload: {
    name?: string;
    dob?: string;
    age?: number;
    gender?: string;
    blood_group?: string;
    contact_phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    department?: string;
    attending_physician?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    preferred_language?: string;
    email_consent?: boolean;
    sms_consent?: boolean;
    notes?: string;
  }): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/patients/${encodeURIComponent(patientId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  addPatientTest: async (patientId: string, payload: {
    test_name: string;
    due_date?: string;
    appointment_id?: string;
    notes?: string;
  }): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/patients/${encodeURIComponent(patientId)}/tests`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  completePatientTest: async (testId: string): Promise<any> => {
    return await fetchJson<any>(`/api/doctor/tests/${encodeURIComponent(testId)}/complete`, {
      method: 'POST'
    });
  }
};


