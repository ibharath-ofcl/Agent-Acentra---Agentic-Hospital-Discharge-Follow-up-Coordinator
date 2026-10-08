import {
  demoDashboardStats,
  demoPatients,
  demoNeedsReviewQueue,
  demoOverdueItems,
  currentPatient,
  demoFollowUpTasks,
  demoTimelineMilestones
} from './data/demoData';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
  getExtraction: async (docId: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/doctor/extraction/" + docId, {
        headers: { ...getHeaders() }
      });
      if (!response.ok) throw new Error("Failed");
      return await response.json();
    } catch {
      return null;
    }
  },

  // Doctor Ops
  getDoctorStats: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/doctor/stats', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && !data.detail) return data;
      }
    } catch {}
    return demoDashboardStats;
  },

  getDoctorPatients: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/doctor/patients', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return demoPatients;
  },

  getNeedsReview: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/doctor/reviews', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return demoNeedsReviewQueue;
  },

  getOverdue: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/doctor/overdue', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return demoOverdueItems;
  },

  uploadDoc: async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:8000/api/doctor/upload', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Patient Ops
  getPatientMe: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/patient/me', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && !data.detail) return data;
      }
    } catch {}
    return currentPatient;
  },

  getPatientTasks: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/patient/tasks', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return demoFollowUpTasks;
  },

  getPatientTimeline: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/patient/timeline', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return demoTimelineMilestones;
  }
};
