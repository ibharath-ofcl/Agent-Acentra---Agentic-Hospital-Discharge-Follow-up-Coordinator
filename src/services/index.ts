// CareFlow AI - Unified Services Entrypoint
import { doctorService } from './api/doctorService';
import { patientService } from './api/patientService';
import { notificationService } from './api/notificationService';
import { geminiService } from './ai/geminiService';

export * from './api/client';
export * from './api/doctorService';
export * from './api/patientService';
export * from './api/notificationService';
export * from './ai/geminiService';

export const api = {
  // Doctor Ops
  getDoctorStats: doctorService.getStats,
  getDoctorPatients: doctorService.getPatients,
  getNeedsReview: doctorService.getNeedsReview,
  getOverdue: doctorService.getOverdue,
  getExtraction: doctorService.getExtraction,
  uploadDoc: doctorService.uploadDocument,

  // Notification Automation & Demo Controls
  getNotifications: notificationService.getNotifications,
  getNotificationDetail: notificationService.getNotificationDetail,
  getDemoState: notificationService.getDemoState,
  runAutomation: notificationService.runAutomation,
  resetDemo: notificationService.resetDemo,
  completeTest: notificationService.completeTest,
  revertTest: notificationService.revertTest,

  // Patient Ops
  getPatientMe: patientService.getProfile,
  getPatientTasks: patientService.getTasks,
  getPatientTimeline: patientService.getTimeline,
  getPatientReminders: notificationService.getPatientReminders,

  // Gemini AI Discharge Intelligence
  analyzeDischarge: geminiService.analyzeDischarge,
  getAiStatus: geminiService.getAiStatus
};

export default api;
