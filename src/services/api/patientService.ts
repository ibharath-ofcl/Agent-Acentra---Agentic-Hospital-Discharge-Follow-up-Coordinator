// CareFlow AI - Patient Portal Services
import { fetchJson, BASE_URL } from './client';

export interface PatientProfile {
  id: string;
  name: string;
  email: string | null;
  dob: string;
  gender: string;
  primaryDiagnosis: string;
  admissionDate: string;
  dischargeDate: string;
  attendingPhysician: string;
  contactPhone: string;
  preferredLanguage: string;
  priority_level: string;
}

export interface PatientTask {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  type: string;
  specialty?: string;
  attending?: string;
  source?: string;
  sourcePage?: number;
}

export interface PatientFollowUp {
  id: string;
  title: string;
  type: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  location: string;
  status: string;
  notes?: string;
}

export interface PatientTest {
  id: string;
  name: string;
  dueDate: string;
  status: string;
  completedAt?: string | null;
  source?: string;
  notes?: string;
}

export interface PatientTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: string;
  type: string;
}

export const patientService = {
  getProfile: async (): Promise<PatientProfile> => {
    return await fetchJson<PatientProfile>('/api/patient/me');
  },

  getTasks: async (): Promise<PatientTask[]> => {
    return await fetchJson<PatientTask[]>('/api/patient/tasks');
  },

  completeTask: async (taskId: string): Promise<any> => {
    return await fetchJson<any>(`/api/patient/tasks/${taskId}/complete`, {
      method: 'PUT'
    });
  },

  getFollowUps: async (): Promise<PatientFollowUp[]> => {
    return await fetchJson<PatientFollowUp[]>('/api/patient/follow-ups');
  },

  getTests: async (): Promise<PatientTest[]> => {
    return await fetchJson<PatientTest[]>('/api/patient/tests');
  },

  reportTest: async (testId: string): Promise<any> => {
    return await fetchJson<any>(`/api/patient/tests/${testId}/report`, {
      method: 'PUT'
    });
  },

  reportReferral: async (referralId: string): Promise<any> => {
    return await fetchJson<any>(`/api/patient/referrals/${referralId}/report`, {
      method: 'PUT'
    });
  },

  getTimeline: async (): Promise<PatientTimelineEvent[]> => {
    return await fetchJson<PatientTimelineEvent[]>('/api/patient/timeline');
  },

  getReminders: async (patientId: string = 'MRN-RAVI-001'): Promise<any> => {
    return await fetchJson<any>(`/api/patients/${patientId}/reminders`);
  },

  uploadDischargeSummary: async (file: File): Promise<any> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/patient/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      let errMsg = 'Discharge summary upload failed';
      try {
        const errJson = await res.json();
        errMsg = errJson.detail || errJson.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  bookAppointment: async (payload: {
    appointment_date: string;
    time_str?: string;
    department?: string;
    doctor_name?: string;
    preferred_language?: string;
    notes?: string;
  }): Promise<any> => {
    return await fetchJson<any>('/api/patient/appointments/book', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

