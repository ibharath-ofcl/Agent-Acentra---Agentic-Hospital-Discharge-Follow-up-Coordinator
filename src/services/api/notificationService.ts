// CareFlow AI - Notification & Automation API Service
import { fetchJson } from './client';

export interface NotificationItem {
  id: string;
  patientId: string;
  patientName: string;
  scenario: string;
  channel: 'email' | 'sms' | 'staff_alert';
  status: 'sent' | 'simulated' | 'skipped' | 'failed';
  subject: string;
  message: string;
  providerMessageId?: string;
  errorMessage?: string;
  aiGenerationMode?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  sentAt?: string;
  createdAt?: string;
  simulationDate?: string;
  isDemo?: boolean;
}

export interface NotificationStatsResponse {
  total: number;
  emails: number;
  sms: number;
  staffAlerts: number;
  skipped: number;
  failed: number;
  items: NotificationItem[];
}

export interface DemoStateResponse {
  simulationDate: string;
  currentDateFormatted: string;
  isRunning: boolean;
  timezone: string;
  nextScheduledRun: string;
  lastRunAt: string;
  lastRunSummary: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    preferredLanguage: string;
  };
  appointment?: {
    id: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
  };
  requiredTest?: {
    id: string;
    name: string;
    status: 'pending' | 'completed' | 'in-progress';
    dueDate: string;
    completedAt?: string;
  };
  careInsight: {
    title: string;
    previousState: string;
    currentState: string;
    automationResponse: string;
    nextAction: string;
    ruleInsight: string;
  };
}

export interface RunAutomationResponse {
  simulationDate: string;
  appointmentsChecked: number;
  scenariosDetected: number;
  emailsSent: number;
  smsSent: number;
  staffAlerts: number;
  skippedCount: number;
  failedCount: number;
  durationSeconds: number;
  summary: string;
  items: Array<{
    id: string;
    patientName: string;
    scenario: string;
    channel: string;
    status: string;
    subject?: string;
    reason?: string;
    aiMode?: string;
    providerId?: string;
  }>;
}

export const notificationService = {
  getNotifications: async (params?: { channel?: string; status?: string; search?: string }): Promise<NotificationStatsResponse> => {
    const query = new URLSearchParams();
    if (params?.channel && params.channel !== 'all') query.set('channel', params.channel);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<NotificationStatsResponse>(`/api/notifications${qs}`);
  },

  getNotificationDetail: async (id: string): Promise<NotificationItem> => {
    return fetchJson<NotificationItem>(`/api/notifications/${id}`);
  },

  getDemoState: async (): Promise<DemoStateResponse> => {
    return fetchJson<DemoStateResponse>('/api/demo/state');
  },

  runAutomation: async (simulationDate?: string, isDemo = true): Promise<RunAutomationResponse> => {
    return fetchJson<RunAutomationResponse>('/api/automation/run', {
      method: 'POST',
      body: JSON.stringify({ simulationDate, isDemo, bypassHoursCheck: true })
    });
  },

  resetDemo: async (): Promise<any> => {
    return fetchJson<any>('/api/demo/reset', {
      method: 'POST'
    });
  },

  completeTest: async (testId: string = 'TEST-RAVI-001'): Promise<any> => {
    return fetchJson<any>(`/api/tests/${testId}/complete`, {
      method: 'POST'
    });
  },

  revertTest: async (testId: string = 'TEST-RAVI-001'): Promise<any> => {
    return fetchJson<any>(`/api/tests/${testId}/revert`, {
      method: 'POST'
    });
  },

  getPatientReminders: async (patientId: string): Promise<NotificationItem[]> => {
    return fetchJson<NotificationItem[]>(`/api/patients/${patientId}/reminders`);
  },

  getPatientTimeline: async (patientId: string): Promise<any[]> => {
    return fetchJson<any[]>(`/api/patients/${patientId}/timeline`);
  }
};
