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

export interface DocumentDetailResponse extends DocumentRecord {
  extraction: Record<string, any>;
}

export const doctorService = {
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
  }
};
