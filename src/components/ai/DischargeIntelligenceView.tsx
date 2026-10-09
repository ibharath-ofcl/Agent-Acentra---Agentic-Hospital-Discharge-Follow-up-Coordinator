import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, Users, Calendar, Pill, AlertOctagon, CheckCircle2,
  RefreshCw, CheckCheck, Info, FileSearch, HeartPulse, ClipboardCheck,
  ArrowRight, UploadCloud, ClipboardList, FileText, ShieldCheck, AlertTriangle,
  Check, LayoutDashboard, UserPlus, GitCompare, UserCheck, X, Edit3, User,
  Building2, Phone, Stethoscope, Clock
} from 'lucide-react';
import { geminiService } from '../../services/ai/geminiService';
import { 
  doctorService, 
  type DocumentRecord,
  type PatientMatchResponse,
  type MatchedPatientInfo
} from '../../services/api/doctorService';
import type { DischargeAnalysisResult } from '../../types';

export const SYNTHETIC_PRESETS = [
  {
    id: 'arun-cardiac',
    title: 'Arun Kumar — Post-MI STEMI Recovery (Cardiac Care)',
    category: 'Cardiology (STEMI)',
    badgeColor: 'emerald',
    text: `PATIENT DISCHARGE SUMMARY
Hospital: CareFlow Memorial Medical Center | Dept of Cardiology
Patient Name: Arun Kumar | MRN: MRN-9281C | Age: 54 | Gender: Male
Admit Date: 2026-10-06 | Discharge Date: 2026-10-10
Attending Physician: Dr. Sarah Chen, MD, FACC

PRIMARY DIAGNOSIS:
Acute ST-Elevation Myocardial Infarction (STEMI) of anterior wall.
Underwent emergent coronary angiography and successful primary PCI with Drug-Eluting Stent (DES) to proximal Left Anterior Descending (LAD) artery. Post-procedure recovery uncomplicated. Left ventricular ejection fraction (LVEF): 45%.

DISCHARGE MEDICATIONS:
1. Aspirin 81 mg PO daily with morning meal (Lifelong antiplatelet therapy).
2. Ticagrelor (Brilinta) 90 mg PO twice daily (Strict 12-month course - do not discontinue).
3. Atorvastatin 80 mg PO once daily at bedtime (High-intensity lipid-lowering therapy).
4. Metoprolol Succinate ER 25 mg PO daily in the morning (Hold if HR < 55 bpm or SBP < 100 mmHg).
5. Nitroglycerin 0.4 mg SL PRN chest pain (Take 1 tablet sublingually every 5 mins up to 3 doses; call 911 if pain persists).

OUTPATIENT APPOINTMENTS & FOLLOW-UP:
- Cardiology Clinic Follow-up with Dr. Sarah Chen on 2026-10-24 at 10:00 AM (Cardiology Clinic, Suite 402).
- Routine fasting lipid panel and comprehensive metabolic panel on 2026-10-22 (12-hour overnight fasting required).
- Referral initiated to Outpatient Phase II Cardiac Rehabilitation program (Schedule within 3 weeks).
- Repeat Transthoracic Echocardiogram (TTE) in 4 weeks on 2026-11-10 to assess ejection fraction recovery.

WOUND CARE & ACTIVITY RESTRICTIONS:
- Right femoral access puncture site: Inspect daily for hematoma, redness, or discharge. Keep site clean and dry. Showers permitted; avoid soaking in baths or swimming for 7 days.
- Activity: Light walking encouraged. No lifting objects heavier than 10 lbs (4.5 kg) for 1 week. Avoid driving for 48 hours.
- Diet: Strict Mediterranean cardiovascular low-sodium diet (< 2,000 mg sodium per day). Maintain daily blood pressure and morning weight logs.

RED FLAGS / EMERGENCY WARNING SIGNS:
- Call 911 immediately if you experience recurrent or worsening chest tightness, pressure, or radiating pain to the jaw, neck, or left arm.
- If femoral puncture site develops rapid swelling, throbbing pain, or active bleeding, lie flat, apply firm direct pressure, and seek emergency care immediately.
- Notify clinic if sudden weight gain exceeds 3 lbs in 24 hours or if shortness of breath occurs while lying flat.`
  },
  {
    id: 'ambiguous-safety',
    title: 'Ambiguous Instructions & Dosage Safety Gate (Human Review Demo)',
    category: 'Safety Trigger Demo',
    badgeColor: 'amber',
    text: `PATIENT DISCHARGE SUMMARY (AMBIGUOUS CLINICAL INSTRUCTIONS)
Hospital: Community General Hospital
Patient: Synthetic Patient | MRN: MRN-9281C | Date: 2026-10-10
Attending: On-Call Hospitalist

DIAGNOSIS: Hypertensive urgency and recurrent palpitations.

MEDICATIONS:
1. Metoprolol 25-50mg take as needed whenever dizzy or chest feels weird ???
2. Blood pressure pills: Continue previous home doses as tolerated.
3. Aspirin: Maybe take with food if stomach is okay.

FOLLOW-UP & TESTING:
- Follow up with cardiologist next week sometime.
- Blood test: Get labs checked soon.
- Call clinic if feeling unwell or if symptoms worsen.

DISCHARGE QUESTION FROM PATIENT:
Patient inquires: "Can I double my dose of blood pressure medicine if my reading is 150/95 today? Should I stop taking aspirin because my stomach hurts?"`
  },
  {
    id: 'ortho-elderly',
    title: 'Sunita Sharma — Total Hip Arthroplasty (Orthopedic Post-Op)',
    category: 'Orthopedics',
    badgeColor: 'sky',
    text: `PATIENT DISCHARGE SUMMARY
Hospital: CareFlow Orthopedic Specialty Center
Patient Name: Sunita Sharma | MRN: MRN-5542O | Age: 68 | Gender: Female
Admit Date: 2026-10-07 | Discharge Date: 2026-10-10
Attending Surgeon: Dr. Robert Vance, MD (Orthopedic Surgery)

PRIMARY PROCEDURE:
Right Total Hip Arthroplasty (Posterior Approach) for severe end-stage osteoarthritis.

DISCHARGE MEDICATIONS:
1. Enoxaparin (Lovenox) 40 mg SubQ once daily for 21 days for DVT thromboprophylaxis.
2. Acetaminophen 1000 mg PO TID PRN moderate pain.
3. Oxycodone 5 mg PO Q6H PRN breakthrough severe pain only (max 3 days).
4. Docusate Sodium 100 mg PO BID with water.

POST-OP APPOINTMENTS & REHABILITATION:
- Suture / Incision Inspection with Orthopedic Nurse Practitioner on 2026-10-24 at 02:00 PM.
- Home Health Physical Therapy (PT): Scheduled 3 times weekly starting 2026-10-13.
- Post-op Pelvis & Right Hip X-Ray on 2026-11-05 prior to 6-week orthopedic review.

HIP PRECAUTIONS & WOUND CARE:
- Posterior Hip Precautions for 6 weeks: Do not bend hip beyond 90 degrees. Do not cross legs. Use elevated toilet seat and abduction wedge while sleeping.
- Surgical dressing: Waterproof dressing in place. Do not remove until clinic follow-up. Keep dry.
- Weight bearing: Weight bearing as tolerated (WBAT) with standard walker.

WARNING SIGNS / RED FLAGS:
- Calf pain, sudden swelling, or tenderness in either leg (suspected DVT) -> Contact clinic or ER immediately.
- Sudden shortness of breath, sharp pleuritic chest pain -> Call 911 immediately (suspected PE).
- Fever > 101°F (38.3°C), persistent incisional drainage, or spreading erythema around surgical site -> Contact orthopedic triage.`
  }
];

interface DischargeIntelligenceViewProps {
  onShowToast?: (message: string) => void;
  aiStatus?: any;
  onApproved?: (res: any) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DischargeIntelligenceView: React.FC<DischargeIntelligenceViewProps> = React.memo(({
  onShowToast,
  aiStatus,
  onApproved,
  onNavigateTab
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('arun-cardiac');
  const [dischargeText, setDischargeText] = useState(SYNTHETIC_PRESETS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DischargeAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'calling-gemini' | 'evaluating-safety' | 'structuring-tasks' | 'complete'>('idle');
  const [activeSectionFilter, setActiveSectionFilter] = useState<'all' | 'appointments' | 'meds' | 'tests' | 'referrals' | 'care' | 'warning' | 'review' | 'evidence'>('all');
  const [syncedToCarePlan, setSyncedToCarePlan] = useState(false);
  
  // Document Upload & Database Persistence State
  const [uploadedDocId, setUploadedDocId] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'approving' | 'approved' | 'rejected'>('idle');
  const [documentsList, setDocumentsList] = useState<DocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Patient Identification & Matching Gate State
  const [patientMatch, setPatientMatch] = useState<PatientMatchResponse | null>(null);
  const [isMatchingPatient, setIsMatchingPatient] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchedPatientInfo | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);

  // Registration Form State (Case A)
  const [registerForm, setRegisterForm] = useState({
    id: '',
    name: '',
    dob: '',
    gender: 'Male',
    contactPhone: '',
    primaryDiagnosis: '',
    department: 'Cardiology',
    admissionDate: '',
    dischargeDate: '',
    attendingPhysician: '',
    priorityLevel: 'high-priority'
  });

  // Diff / Update Field Approval State (Case B)
  const [approvedDiffFields, setApprovedDiffFields] = useState<Record<string, boolean>>({
    primaryDiagnosis: true,
    department: true,
    dischargeDate: true,
    attendingPhysician: true,
    contactPhone: true,
    priorityLevel: true
  });

  const loadDocumentsList = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await doctorService.getDocuments();
      if (Array.isArray(docs)) {
        setDocumentsList(docs);
      }
    } catch (e) {
      console.warn('Failed to load documents list:', e);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadDocumentsList();
  }, [loadDocumentsList]);

  const runPatientMatch = useCallback(async (result: DischargeAnalysisResult) => {
    setIsMatchingPatient(true);
    try {
      const pInfo = result.patientInfo || {};
      const match = await doctorService.matchExtractedPatient({
        mrn: pInfo.mrn,
        name: pInfo.name,
        dob: pInfo.dob,
        gender: pInfo.gender,
        contactPhone: (pInfo as any).contactPhone,
        primaryDiagnosis: pInfo.primaryDiagnosis,
        department: (pInfo as any).department
      });
      setPatientMatch(match);
      if (match.status === 'existing' && match.patient) {
        setSelectedCandidate(match.patient);
      } else if (match.status === 'new') {
        setSelectedCandidate(null);
        setRegisterForm({
          id: match.suggestedMrn || pInfo.mrn || `MRN-${Math.floor(1000 + Math.random() * 9000)}`,
          name: pInfo.name || '',
          dob: pInfo.dob || '',
          gender: pInfo.gender || 'Male',
          contactPhone: (pInfo as any).contactPhone || '',
          primaryDiagnosis: pInfo.primaryDiagnosis || '',
          department: (pInfo as any).department || 'Cardiology',
          admissionDate: pInfo.admissionDate || '',
          dischargeDate: pInfo.dischargeDate || new Date().toISOString().split('T')[0],
          attendingPhysician: pInfo.attendingPhysician || '',
          priorityLevel: (result.needsReview && result.needsReview.length > 0) ? 'immediate-review' : 'high-priority'
        });
      } else if (match.status === 'ambiguous' && match.candidates && match.candidates.length > 0) {
        setSelectedCandidate(null);
      }
    } catch (err: any) {
      console.warn('Patient match query failed:', err);
    } finally {
      setIsMatchingPatient(false);
    }
  }, []);

  const handleSelectPreset = useCallback((preset: typeof SYNTHETIC_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setDischargeText(preset.text);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSyncedToCarePlan(false);
    setUploadedFileName(null);
    setUploadedDocId(null);
    setApprovalStatus('idle');
    setPatientMatch(null);
    setSelectedCandidate(null);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.txt'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setAnalysisError(`Unsupported file format. Please upload PDF, PNG, JPG, JPEG, DOCX, or TXT.`);
      return;
    }

    // Validate size (< 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setAnalysisError(`File size exceeds 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setIsUploading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);
    setApprovalStatus('idle');
    setPatientMatch(null);
    setSelectedCandidate(null);
    setAnalysisStep('calling-gemini');

    try {
      const resp = await doctorService.uploadDocument(file);
      setUploadedDocId(resp.document_id || resp.documentId);
      
      // Fetch the structured extraction
      const detail = await doctorService.getDocumentDetail(resp.document_id || resp.documentId);
      if (detail && detail.extraction) {
        const ext = detail.extraction as any;
        setAnalysisResult(ext);
        setAnalysisStep('complete');
        onShowToast?.(`✓ Document uploaded & parsed with Gemini: ${file.name}`);
        runPatientMatch(ext);
      } else {
        // Fallback to local text if text file
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) setDischargeText(content);
        };
        reader.readAsText(file);
        setAnalysisStep('idle');
      }
      loadDocumentsList();
    } catch (err: any) {
      setAnalysisError(err.message || 'File upload and extraction failed.');
      setAnalysisStep('idle');
    } finally {
      setIsUploading(false);
    }
  }, [loadDocumentsList, onShowToast, runPatientMatch]);

  const handleSelectExistingDoc = useCallback(async (docId: number) => {
    setUploadedDocId(docId);
    setAnalysisError(null);
    setIsAnalyzing(true);
    try {
      const detail = await doctorService.getDocumentDetail(docId);
      if (detail) {
        setUploadedFileName(detail.originalFilename);
        const ext = detail.extraction as any;
        setAnalysisResult(ext);
        setApprovalStatus(detail.status === 'approved' ? 'approved' : detail.status === 'rejected' ? 'rejected' : 'idle');
        onShowToast?.(`Loaded extraction record for ${detail.originalFilename}`);
        if (ext) runPatientMatch(ext);
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to load document extraction');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onShowToast, runPatientMatch]);

  const handleSyncToCarePlan = useCallback(() => {
    if (!analysisResult) return;
    setSyncedToCarePlan(true);
    const apptCount = analysisResult.appointments?.length || 0;
    const medCount = analysisResult.medicationInstructions?.length || 0;
    const testCount = analysisResult.tests?.length || 0;
    onShowToast?.(`✓ Synced ${apptCount} appointment(s), ${medCount} medication(s), and ${testCount} lab test(s) to Care Coordinator Queue.`);
  }, [analysisResult, onShowToast]);

  const handleConfirmRegistration = useCallback(async () => {
    if (!registerForm.name.trim() || !registerForm.id.trim()) {
      setAnalysisError('Patient ID (MRN) and Patient Name are required for registration.');
      return;
    }
    setApprovalStatus('approving');
    try {
      const res = await doctorService.registerAndApprovePatient({
        patient: registerForm,
        documentId: uploadedDocId,
        filename: uploadedFileName || `Discharge_Summary_${registerForm.id}.txt`,
        extraction: analysisResult
      });
      setShowRegisterModal(false);
      setApprovalStatus('approved');
      setSyncedToCarePlan(true);
      onShowToast?.(`✓ Registered & Activated in MySQL! Patient ${registerForm.name} (${registerForm.id}) created.`);
      loadDocumentsList();
      onApproved?.(res);
    } catch (err: any) {
      setAnalysisError(err.message || 'Registration failed.');
      setApprovalStatus('idle');
    }
  }, [registerForm, uploadedDocId, uploadedFileName, analysisResult, onShowToast, loadDocumentsList, onApproved]);

  const handleConfirmExistingUpdate = useCallback(async () => {
    const targetPt = selectedCandidate || patientMatch?.patient;
    if (!targetPt) return;

    const pInfo = analysisResult?.patientInfo || {};
    const updatedFields: Record<string, any> = {};

    if (approvedDiffFields.primaryDiagnosis && pInfo.primaryDiagnosis) {
      updatedFields.primaryDiagnosis = pInfo.primaryDiagnosis;
    }
    if (approvedDiffFields.department && (pInfo as any).department) {
      updatedFields.department = (pInfo as any).department;
    }
    if (approvedDiffFields.dischargeDate && pInfo.dischargeDate) {
      updatedFields.dischargeDate = pInfo.dischargeDate;
    }
    if (approvedDiffFields.attendingPhysician && pInfo.attendingPhysician) {
      updatedFields.attendingPhysician = pInfo.attendingPhysician;
    }
    if (approvedDiffFields.contactPhone && (pInfo as any).contactPhone) {
      updatedFields.contactPhone = (pInfo as any).contactPhone;
    }
    if (approvedDiffFields.priorityLevel) {
      updatedFields.priorityLevel = (analysisResult?.needsReview && analysisResult.needsReview.length > 0) ? 'immediate-review' : 'high-priority';
    }

    setApprovalStatus('approving');
    try {
      const res = await doctorService.updateAndApprovePatient({
        patientId: targetPt.id,
        updatedFields,
        documentId: uploadedDocId,
        filename: uploadedFileName || `Discharge_Summary_${targetPt.id}.txt`,
        extraction: analysisResult
      });
      setShowDiffModal(false);
      setApprovalStatus('approved');
      setSyncedToCarePlan(true);
      onShowToast?.(`✓ Updated & Synced to MySQL! Existing Patient ${targetPt.name} (${targetPt.id}) updated.`);
      loadDocumentsList();
      onApproved?.(res);
    } catch (err: any) {
      setAnalysisError(err.message || 'Update failed.');
      setApprovalStatus('idle');
    }
  }, [selectedCandidate, patientMatch, analysisResult, approvedDiffFields, uploadedDocId, uploadedFileName, onShowToast, loadDocumentsList, onApproved]);

  const handleApproveDocument = useCallback(async () => {
    if (patientMatch?.status === 'new') {
      setShowRegisterModal(true);
      return;
    }
    if (patientMatch?.status === 'existing') {
      setShowDiffModal(true);
      return;
    }
    if (patientMatch?.status === 'ambiguous') {
      onShowToast?.('Please manually select or register a patient to proceed.');
      return;
    }

    setApprovalStatus('approving');
    try {
      let res;
      if (uploadedDocId) {
        res = await doctorService.approveDocument(uploadedDocId);
      } else if (analysisResult) {
        res = await doctorService.approveExtraction(analysisResult, uploadedFileName || 'Synthetic_Discharge_Summary.txt');
        if (res.documentId) setUploadedDocId(res.documentId);
      } else {
        handleSyncToCarePlan();
        setApprovalStatus('idle');
        return;
      }
      setApprovalStatus('approved');
      setSyncedToCarePlan(true);
      onShowToast?.(`✓ Approved & persisted to MySQL! Created ${res.tasks_created || res.createdTasksCount || 0} tasks, ${res.appointments_created || 0} appointments.`);
      loadDocumentsList();
      onApproved?.(res);
    } catch (err: any) {
      setAnalysisError(err.message || 'Approval failed.');
      setApprovalStatus('idle');
    }
  }, [patientMatch, uploadedDocId, analysisResult, uploadedFileName, handleSyncToCarePlan, loadDocumentsList, onShowToast, onApproved]);

  const handleRejectDocument = useCallback(async () => {
    if (!uploadedDocId) return;
    try {
      await doctorService.rejectDocument(uploadedDocId, 'Flagged by Doctor / Care Coordinator');
      setApprovalStatus('rejected');
      onShowToast?.('Document flagged for manual review.');
      loadDocumentsList();
    } catch (err: any) {
      setAnalysisError(err.message || 'Reject failed.');
    }
  }, [uploadedDocId, loadDocumentsList, onShowToast]);

  const handleAnalyzeDischarge = useCallback(async () => {
    if (!dischargeText.trim()) {
      setAnalysisError('Please enter or select a synthetic discharge summary.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSyncedToCarePlan(false);
    setApprovalStatus('idle');
    setPatientMatch(null);
    setSelectedCandidate(null);
    setAnalysisStep('calling-gemini');

    const stepTimer1 = setTimeout(() => setAnalysisStep('evaluating-safety'), 600);
    const stepTimer2 = setTimeout(() => setAnalysisStep('structuring-tasks'), 1300);

    try {
      const result = await geminiService.analyzeDischarge(dischargeText);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAnalysisResult(result);
      setAnalysisStep('complete');
      onShowToast?.('✓ Discharge Intelligence extracted with Google Gemini API.');
      runPatientMatch(result);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAnalysisError(err.message || 'Discharge extraction failed.');
      setAnalysisStep('idle');
    } finally {
      setIsAnalyzing(false);
    }
  }, [dischargeText, onShowToast, runPatientMatch]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto mt-4">
      {/* TOP HEADER & ENGINE STATUS BAR */}
      <div className="bg-gradient-to-r from-[#0a2e35] via-[#0d3b44] to-[#0a2e35] text-white rounded-2xl p-6 shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-[#00e575] flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0 text-[#052429]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight">Discharge Intelligence Engine</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/30 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Powered by Google Gemini API
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-1 max-w-2xl">
                Extracts, structures, and coordinates documented clinical instructions into actionable timelines without medical hallucination.
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap md:flex-col items-end gap-1.5 shrink-0 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-900/60 border border-teal-500/30 text-teal-200">
              <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
              <span>Gemini Service: <strong>{aiStatus?.configured ? 'Online (Gemini 3.5 Flash)' : 'Active (Safe Fallback Mode)'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-200/70">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Zero Clinical Diagnosis / Safe Extraction Only</span>
            </div>
          </div>
        </div>

        {/* Synthetic Data Disclaimer Banner */}
        <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between gap-2 text-[11px] text-teal-200/80">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span><strong>Synthetic Healthcare Data — Demonstration Only.</strong> Clinical decisions must always be confirmed by licensed providers.</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] text-teal-300/60">API Endpoint: POST /api/ai/analyze-discharge</span>
        </div>
      </div>

      {/* PRESET SELECTOR & WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Input & Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Synthetic Preset Pills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-teal-700" /> Synthetic Clinical Presets
              </span>
              <span className="text-[10px] text-slate-500">1-Click Load</span>
            </div>

            <div className="space-y-2">
              {SYNTHETIC_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-600 shadow-xs ring-1 ring-teal-600/30'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{preset.title.split('—')[0]}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        preset.badgeColor === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800'
                          : preset.badgeColor === 'amber'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {preset.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{preset.title.split('—')[1] || preset.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Document Textarea */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-700" /> Discharge Summary Text
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {dischargeText.length} chars
                </span>
                <button
                  onClick={() => setDischargeText('')}
                  className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              value={dischargeText}
              onChange={(e) => setDischargeText(e.target.value)}
              rows={12}
              placeholder="Paste or edit synthetic clinical discharge summary text here..."
              className="w-full font-mono text-[11px] text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-teal-600 focus:outline-hidden transition-colors resize-y leading-relaxed"
            />

            {/* Real File Upload Dropzone */}
            <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/70 transition-all flex flex-col items-center justify-center text-center">
              <UploadCloud className="w-8 h-8 text-teal-700 mb-1.5" />
              <span className="text-xs font-bold text-slate-800">Upload Discharge Document</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports PDF, PNG, JPG, JPEG, DOCX, TXT (Max 15MB)
              </p>
              
              <label className="mt-2.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5">
                <span>Browse Local File</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  disabled={isUploading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {uploadedFileName && (
                <div className="mt-3 w-full p-2 bg-white rounded-lg border border-teal-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-mono text-slate-800 font-semibold truncate">{uploadedFileName}</span>
                  </div>
                  {uploadedFileSize && (
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {(uploadedFileSize / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* CTA Action Button */}
            <button
              onClick={handleAnalyzeDischarge}
              disabled={isAnalyzing}
              className={`mt-4 w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAnalyzing
                  ? 'bg-teal-700 text-teal-100 cursor-wait'
                  : 'bg-gradient-to-r from-[#00e575] to-[#00cb68] hover:from-[#00cb68] hover:to-[#00b05a] text-[#052429] shadow-teal-500/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Reasoning & Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with CareFlow AI</span>
                </>
              )}
            </button>

            {/* Progress Step Indicator */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center gap-2 text-teal-900 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                  <span>
                    {analysisStep === 'calling-gemini' && '1/3 Calling Gemini AI API...'}
                    {analysisStep === 'evaluating-safety' && '2/3 Enforcing Safety Gate & Review Checks...'}
                    {analysisStep === 'structuring-tasks' && '3/3 Building Care Timelines & Provenance...'}
                  </span>
                </div>
                <div className="w-full bg-teal-200 rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="bg-teal-700 h-1 rounded-full"
                    initial={{ width: '15%' }}
                    animate={{
                      width:
                        analysisStep === 'calling-gemini'
                          ? '40%'
                          : analysisStep === 'evaluating-safety'
                          ? '75%'
                          : '95%',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Error Notification */}
            {analysisError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Extraction Error:</strong> {analysisError}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Structured Extraction Results (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {!analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4 text-teal-800">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ready to Analyze Discharge Document</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1.5">
                Select any synthetic preset on the left or paste a discharge note, then click <strong>"Analyze with CareFlow AI"</strong> to generate structured recovery tasks.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleSelectPreset(SYNTHETIC_PRESETS[0])}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Try Arun Kumar (Post-MI)
                </button>
                <button
                  onClick={() => handleSelectPreset(SYNTHETIC_PRESETS[1])}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Try Ambiguity / Safety Gate
                </button>
              </div>
            </div>
          )}

          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* EXECUTIVE SUMMARY CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-700" />
                    <h3 className="text-sm font-bold text-slate-900">Extraction Summary</h3>
                  </div>
                  <span className="text-[11px] font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    Structured CareFlow JSON
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mt-3">
                  {analysisResult.summary}
                </p>

                {/* Patient Demographics Bar */}
                {analysisResult.patientInfo && (analysisResult.patientInfo.name || analysisResult.patientInfo.mrn) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Patient</span>
                      <strong className="text-slate-900">{analysisResult.patientInfo.name || 'Synthetic Patient'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">MRN</span>
                      <strong className="text-teal-800 font-mono">{analysisResult.patientInfo.mrn || 'MRN-9281C'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Discharged</span>
                      <strong className="text-slate-900">{analysisResult.patientInfo.dischargeDate || '2026-10-10'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Attending</span>
                      <strong className="text-slate-900 truncate block">{analysisResult.patientInfo.attendingPhysician || 'Dr. Sarah Chen'}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* PATIENT IDENTIFICATION & VERIFICATION GATE (PHASE 2) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-teal-700" />
                    <h3 className="text-sm font-bold text-slate-900">Patient Identity & Record Matching Gate</h3>
                  </div>
                  {isMatchingPatient && (
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse border border-teal-200">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Querying MySQL Database...
                    </span>
                  )}
                </div>

                {/* CASE A: NEW PATIENT */}
                {patientMatch?.status === 'new' && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-blue-900">No existing patient record found. Create a new patient record to continue.</h4>
                          <p className="text-xs text-blue-800 mt-0.5">
                            Extracted details do not match any existing patient in MySQL. Register this patient manually or confirm extracted details to create their record.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase shrink-0">
                        Case A: New Patient
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Suggested ID</span>
                        <strong className="font-mono text-blue-900">{patientMatch.suggestedMrn || registerForm.id}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Extracted Name</span>
                        <strong className="text-slate-900">{analysisResult.patientInfo?.name || 'Unspecified'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Department</span>
                        <strong className="text-slate-900">{registerForm.department}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Discharge Date</span>
                        <strong className="text-slate-900">{registerForm.dischargeDate}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setPatientMatch(null);
                          onShowToast?.('Patient registration cancelled.');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>NEW PATIENT</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE B: EXISTING PATIENT */}
                {patientMatch?.status === 'existing' && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-emerald-900">Existing patient record found.</h4>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Authoritative match established in MySQL. Link this discharge document to the patient and update supported care records without duplicates.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase shrink-0">
                        Case B: Existing Match
                      </span>
                    </div>

                    {/* Matched Patient Info Card */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/80 p-3 rounded-lg border border-emerald-100">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Patient ID</span>
                        <strong className="font-mono text-emerald-900 font-bold">{patientMatch.patient?.id}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Patient Name</span>
                        <strong className="text-slate-900">{patientMatch.patient?.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Department</span>
                        <strong className="text-slate-900">{patientMatch.patient?.department || 'Cardiology'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Discharge Status</span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                          {patientMatch.patient?.dischargeStatus || 'Discharged'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setPatientMatch(null);
                          onShowToast?.('Patient link cancelled.');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCandidate(patientMatch.patient || null);
                          setShowDiffModal(true);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>EXISTING PATIENT</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE C: AMBIGUOUS OR MULTIPLE MATCHES */}
                {patientMatch?.status === 'ambiguous' && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-amber-900">Multiple possible patient matches found. Manual verification required.</h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Safety Gate: System will never automatically select or merge records when ambiguous candidates exist. Select the verified patient below or register as a new record.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] uppercase shrink-0">
                        Case C: Ambiguous Match
                      </span>
                    </div>

                    {/* Candidate selection list */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-amber-900 block">Candidate Records Found in MySQL:</span>
                      {patientMatch.candidates?.map((cand) => (
                        <div key={cand.id} className="p-3 bg-white rounded-lg border border-amber-200 flex items-center justify-between gap-3">
                          <div className="grid grid-cols-3 gap-3 text-xs flex-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">MRN / ID</span>
                              <strong className="font-mono text-slate-800">{cand.id}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Name</span>
                              <strong className="text-slate-900">{cand.name}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Department</span>
                              <span className="text-slate-700">{cand.department || 'General'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCandidate(cand);
                              setShowDiffModal(true);
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
                          >
                            Select Patient
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs">
                      <span className="text-amber-800 text-[11px]">None of these match?</span>
                      <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register as New Distinct Patient</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION TABS FILTER BAR */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'appointments', label: `Appointments (${analysisResult.appointments?.length || 0})` },
                  { id: 'meds', label: `Medications (${analysisResult.medicationInstructions?.length || 0})` },
                  { id: 'tests', label: `Labs / Tests (${analysisResult.tests?.length || 0})` },
                  { id: 'referrals', label: `Referrals (${analysisResult.referrals?.length || 0})` },
                  { id: 'care', label: `Care Instructions (${analysisResult.careInstructions?.length || 0})` },
                  { id: 'warning', label: `Warning Signs (${analysisResult.warningSigns?.length || 0})` },
                  {
                    id: 'review',
                    label: `Needs Review (${analysisResult.needsReview?.length || 0})`,
                    alert: (analysisResult.needsReview?.length || 0) > 0,
                  },
                  { id: 'evidence', label: `Evidence (${analysisResult.evidence?.length || 0})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSectionFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                      activeSectionFilter === tab.id
                        ? 'bg-teal-800 text-white shadow-xs'
                        : tab.alert
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* HUMAN REVIEW SAFETY ALERT BOX (If triggers present) */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'review') &&
                analysisResult.needsReview &&
                analysisResult.needsReview.length > 0 && (
                  <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Clinical Review Required ({analysisResult.needsReview.length} item{analysisResult.needsReview.length > 1 ? 's' : ''})</span>
                    </div>
                    <p className="text-xs text-amber-900">
                      The CareFlow Clinical Safety Boundary flagged the following items for human coordinator verification instead of making autonomous clinical assumptions:
                    </p>

                    <div className="space-y-2.5">
                      {analysisResult.needsReview.map((nr, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-3.5 border border-amber-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">{nr.item}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              {nr.category}
                            </span>
                          </div>
                          <div className="text-slate-800 font-medium">
                            <strong>Issue:</strong> {nr.issue}
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            <strong>Review Reason:</strong> {nr.reason}
                          </div>
                          {nr.sourceEvidence && (
                            <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] text-slate-700">
                              "{nr.sourceEvidence}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* APPOINTMENTS SECTION */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'appointments') &&
                analysisResult.appointments &&
                analysisResult.appointments.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-teal-700" /> Follow-up Appointments
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500">{analysisResult.appointments.length} Scheduled</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {analysisResult.appointments.map((appt, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-slate-900 text-sm">{appt.specialty}</span>
                              {appt.doctorName && <span className="text-slate-600 block text-[11px]">Provider: {appt.doctorName}</span>}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded text-[11px]">
                                {appt.date}
                              </span>
                              {appt.time && <span className="text-[10px] text-slate-500 block mt-0.5">{appt.time}</span>}
                            </div>
                          </div>

                          <p className="text-slate-700 text-xs">
                            <strong>Reason:</strong> {appt.reason}
                          </p>
                          {appt.location && (
                            <div className="text-[11px] text-slate-500">
                              <strong>Location:</strong> {appt.location}
                            </div>
                          )}
                          {appt.sourceEvidence && (
                            <div className="text-[10px] text-slate-500 font-mono italic bg-white p-1.5 rounded border border-slate-200">
                              "{appt.sourceEvidence}"
                            </div>
                          )}
                          {appt.requiresHumanReview && (
                            <div className="text-[10px] font-semibold text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                              ⚠️ Needs Review: {appt.reviewReason || 'Ambiguous date or provider'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* MEDICATIONS SECTION */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'meds') &&
                analysisResult.medicationInstructions &&
                analysisResult.medicationInstructions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-700" /> Medication Instructions
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500">{analysisResult.medicationInstructions.length} Prescribed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysisResult.medicationInstructions.map((med, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between gap-1.5">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">{med.medicationName}</span>
                              {med.dosage && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-teal-800 border border-slate-200">
                                   {med.dosage}
                                </span>
                              )}
                            </div>
                            <div className="text-teal-900 font-medium text-xs mt-1">
                              {med.frequency} {med.route ? `• ${med.route}` : ''}
                            </div>
                            {med.specialInstructions && (
                              <p className="text-slate-600 text-[11px] mt-1 leading-snug">
                                {med.specialInstructions}
                              </p>
                            )}
                          </div>

                          {med.sourceEvidence && (
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              Src: "{med.sourceEvidence}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* LAB & IMAGING TESTS */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'tests') &&
                analysisResult.tests &&
                analysisResult.tests.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-teal-700" /> Diagnostic Tests & Labs
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500">{analysisResult.tests.length} Orders</span>
                    </div>

                    <div className="space-y-2">
                      {analysisResult.tests.map((test, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{test.testName}</span>
                            <p className="text-slate-600 text-xs mt-0.5">{test.instructions}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                              {test.targetDate}
                            </span>
                            {test.fastingRequired && (
                              <span className="block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 border border-amber-200">
                                Fasting Required
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SPECIALIST REFERRALS */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'referrals') &&
                analysisResult.referrals &&
                analysisResult.referrals.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Users className="w-4 h-4 text-teal-700" /> Specialist Referrals
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.referrals.map((ref, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-slate-900">{ref.providerType}</span>
                            <p className="text-slate-600 text-xs mt-0.5"><strong>Purpose:</strong> {ref.reason}</p>
                            {ref.notes && <p className="text-slate-500 text-[11px] mt-0.5">{ref.notes}</p>}
                          </div>
                          {ref.urgency && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                              {ref.urgency}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* CARE & WOUND INSTRUCTIONS */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'care') &&
                analysisResult.careInstructions &&
                analysisResult.careInstructions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <ClipboardCheck className="w-4 h-4 text-teal-700" /> Care & Recovery Instructions
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.careInstructions.map((care, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {care.category}
                          </span>
                          <p className="text-slate-800 text-xs leading-relaxed pt-1">
                            {care.instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* RED FLAG WARNING SIGNS */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'warning') &&
                analysisResult.warningSigns &&
                analysisResult.warningSigns.length > 0 && (
                  <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-red-200">
                      <AlertOctagon className="w-4 h-4 text-red-600" /> Emergency Warning Signs & Red Flags
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.warningSigns.map((ws, idx) => {
                        const isObj = typeof ws === 'object' && ws !== null;
                        const symptom = isObj ? (ws as any).symptom : ws;
                        const urgency = isObj ? (ws as any).urgency : 'Emergency';
                        const action = isObj ? (ws as any).actionRequired : 'Call 911 / Go to ED';

                        return (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-red-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-red-950">{symptom}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                                {urgency}
                              </span>
                            </div>
                            {action && (
                              <p className="text-slate-700 text-xs font-medium">
                                <strong>Required Action:</strong> {action}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* SOURCE EVIDENCE EXPLORER */}
              {(activeSectionFilter === 'all' || activeSectionFilter === 'evidence') &&
                analysisResult.evidence &&
                analysisResult.evidence.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <FileSearch className="w-4 h-4 text-teal-700" /> Document Provenance & Evidence Snippets
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.evidence.map((ev, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{ev.key}</span>
                            {ev.pageOrSection && (
                              <span className="text-[10px] font-mono text-slate-500">{ev.pageOrSection}</span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                            "{ev.snippet}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* HUMAN APPROVAL & SYNC TO CARE PLAN ACTION BAR */}
              <div className="bg-gradient-to-r from-teal-900 to-[#0d3b44] rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-teal-500/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00e575]" />
                    <span className="font-bold text-sm">Human Review & Approval Gate</span>
                    {approvalStatus === 'approved' && (
                      <span className="text-[10px] font-bold bg-[#00e575] text-[#052429] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Live in MySQL
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-teal-200/80 max-w-xl">
                    {approvalStatus === 'approved'
                      ? 'Care plan and patient records are live in MySQL database. All coordinator dashboards and patient recovery portals have been updated.'
                      : 'Clinical safety rule: Tasks are not activated in the patient care plan until approved by an authorized Doctor or Care Coordinator.'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {uploadedDocId && approvalStatus !== 'approved' && (
                    <button
                      onClick={handleRejectDocument}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-red-400/40 text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      Flag / Reject
                    </button>
                  )}

                  {approvalStatus === 'approved' && onNavigateTab && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigateTab('patients')}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5 text-[#00e575]" /> View Patient Queue
                      </button>
                      <button
                        onClick={() => onNavigateTab('dashboard')}
                        className="px-3.5 py-2 rounded-xl bg-[#00e575] hover:bg-[#00cb68] text-[#052429] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard
                      </button>
                    </div>
                  )}

                  {approvalStatus !== 'approved' && (
                    <button
                      onClick={handleApproveDocument}
                      disabled={approvalStatus === 'approving'}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                        approvalStatus === 'approving'
                          ? 'bg-teal-700 text-teal-200 cursor-wait'
                          : 'bg-[#00e575] hover:bg-[#00cb68] text-[#052429]'
                      }`}
                    >
                      {approvalStatus === 'approving' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Persisting Tasks to DB...</span>
                        </>
                      ) : patientMatch?.status === 'new' ? (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>NEW PATIENT & Activate</span>
                        </>
                      ) : patientMatch?.status === 'existing' ? (
                        <>
                          <GitCompare className="w-4 h-4" />
                          <span>EXISTING PATIENT & Update</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Approve & Activate in MySQL</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* REGISTRATION MODAL (CASE A: NEW PATIENT) */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-base font-bold">Register New Patient in MySQL</h3>
                    <p className="text-xs text-blue-200">Pre-filled with extracted clinical data. Review & confirm fields below.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Patient ID (MRN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registerForm.id}
                      onChange={(e) => setRegisterForm({ ...registerForm, id: e.target.value })}
                      placeholder="e.g. MRN-9281C"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="e.g. Arun Kumar"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={registerForm.dob}
                      onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={registerForm.contactPhone}
                      onChange={(e) => setRegisterForm({ ...registerForm, contactPhone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={registerForm.department}
                      onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden bg-white"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Pulmonology">Pulmonology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Priority Risk Level</label>
                    <select
                      value={registerForm.priorityLevel}
                      onChange={(e) => setRegisterForm({ ...registerForm, priorityLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden bg-white"
                    >
                      <option value="stable">Stable / Standard Care</option>
                      <option value="high-priority">High Priority</option>
                      <option value="immediate-review">Immediate Review Required</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis</label>
                  <textarea
                    rows={2}
                    value={registerForm.primaryDiagnosis}
                    onChange={(e) => setRegisterForm({ ...registerForm, primaryDiagnosis: e.target.value })}
                    placeholder="Enter confirmed diagnosis..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Discharge Date</label>
                    <input
                      type="date"
                      value={registerForm.dischargeDate}
                      onChange={(e) => setRegisterForm({ ...registerForm, dischargeDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Attending Physician</label>
                    <input
                      type="text"
                      value={registerForm.attendingPhysician}
                      onChange={(e) => setRegisterForm({ ...registerForm, attendingPhysician: e.target.value })}
                      placeholder="e.g. Dr. Sarah Chen, MD"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Creating patient in MySQL will automatically link this discharge document and its care tasks.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRegistration}
                    disabled={approvalStatus === 'approving'}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {approvalStatus === 'approving' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering in MySQL...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Registration & Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIFF & UPDATE COMPARISON MODAL (CASE B: EXISTING PATIENT) */}
      <AnimatePresence>
        {showDiffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-900 to-emerald-950 text-white">
                <div className="flex items-center gap-2.5">
                  <GitCompare className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold">Review & Update Existing Patient Record</h3>
                    <p className="text-xs text-teal-200">
                      Comparing MySQL Patient <strong>{selectedCandidate?.name || patientMatch?.patient?.name}</strong> ({selectedCandidate?.id || patientMatch?.patient?.id}) with new document data.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDiffModal(false)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                  <ShieldCheck className="w-4 h-4 inline-block mr-1.5 text-emerald-600" />
                  <strong>Zero-Data-Loss Rule:</strong> Verified existing patient details are preserved. Unchecked fields will remain untouched in MySQL. No duplicate appointments or tasks will be created.
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
                      <th className="py-2.5 px-3 text-left w-12">Update?</th>
                      <th className="py-2.5 px-3 text-left w-36">Field</th>
                      <th className="py-2.5 px-3 text-left">Current Database Value</th>
                      <th className="py-2.5 px-3 text-left">New Document Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={approvedDiffFields.primaryDiagnosis}
                          onChange={(e) => setApprovedDiffFields({ ...approvedDiffFields, primaryDiagnosis: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Primary Diagnosis</td>
                      <td className="py-3 px-3 text-slate-500">{selectedCandidate?.primaryDiagnosis || patientMatch?.patient?.primaryDiagnosis || '—'}</td>
                      <td className="py-3 px-3 font-medium text-teal-900 bg-teal-50/50">{analysisResult?.patientInfo?.primaryDiagnosis || '—'}</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={approvedDiffFields.department}
                          onChange={(e) => setApprovedDiffFields({ ...approvedDiffFields, department: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Department</td>
                      <td className="py-3 px-3 text-slate-500">{selectedCandidate?.department || patientMatch?.patient?.department || '—'}</td>
                      <td className="py-3 px-3 font-medium text-teal-900 bg-teal-50/50">{(analysisResult?.patientInfo as any)?.department || 'Cardiology'}</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={approvedDiffFields.dischargeDate}
                          onChange={(e) => setApprovedDiffFields({ ...approvedDiffFields, dischargeDate: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Discharge Date</td>
                      <td className="py-3 px-3 text-slate-500">{selectedCandidate?.dischargeDate || patientMatch?.patient?.dischargeDate || '—'}</td>
                      <td className="py-3 px-3 font-medium text-teal-900 bg-teal-50/50">{analysisResult?.patientInfo?.dischargeDate || '—'}</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={approvedDiffFields.attendingPhysician}
                          onChange={(e) => setApprovedDiffFields({ ...approvedDiffFields, attendingPhysician: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Attending Physician</td>
                      <td className="py-3 px-3 text-slate-500">{selectedCandidate?.attendingPhysician || patientMatch?.patient?.attendingPhysician || '—'}</td>
                      <td className="py-3 px-3 font-medium text-teal-900 bg-teal-50/50">{analysisResult?.patientInfo?.attendingPhysician || '—'}</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={approvedDiffFields.contactPhone}
                          onChange={(e) => setApprovedDiffFields({ ...approvedDiffFields, contactPhone: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Contact Phone</td>
                      <td className="py-3 px-3 text-slate-500">{selectedCandidate?.contactPhone || patientMatch?.patient?.contactPhone || '—'}</td>
                      <td className="py-3 px-3 font-medium text-teal-900 bg-teal-50/50">{(analysisResult?.patientInfo as any)?.contactPhone || selectedCandidate?.contactPhone || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Approved care plan tasks and tests will be linked directly to {selectedCandidate?.id || patientMatch?.patient?.id}.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDiffModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmExistingUpdate}
                    disabled={approvalStatus === 'approving'}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {approvalStatus === 'approving' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating MySQL...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Updates & Sync</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOADED DOCUMENTS REGISTRY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mt-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Uploaded Discharge Documents & MySQL Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audit log of all uploaded discharge summaries, Gemini extraction state, and coordinator approvals.</p>
            </div>
          </div>
          <button
            onClick={loadDocumentsList}
            disabled={isLoadingDocs}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {documentsList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No discharge documents uploaded yet. Use the upload box above to upload a PDF or image.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-2.5 px-3">Document ID</th>
                  <th className="py-2.5 px-3">Original Filename</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Upload Date</th>
                  <th className="py-2.5 px-3">Extraction Status</th>
                  <th className="py-2.5 px-3">Safety Review</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documentsList.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-teal-800 font-semibold">DOC-{doc.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{doc.originalFilename}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{doc.patientName || 'Arun Kumar'}</td>
                    <td className="py-3 px-3 text-slate-500">{doc.uploadDate || 'Today'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {doc.needsReview ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          Needs Review
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          Passed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleSelectExistingDoc(doc.id)}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Inspect / Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

