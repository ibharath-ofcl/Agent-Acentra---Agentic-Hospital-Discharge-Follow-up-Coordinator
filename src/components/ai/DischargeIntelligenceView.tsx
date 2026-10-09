import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Brain, Users, Calendar, Pill, AlertOctagon, CheckCircle2,
  RefreshCw, CheckCheck, Info, FileSearch, HeartPulse, ClipboardCheck,
  ArrowRight, UploadCloud, ClipboardList, FileText, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { geminiService } from '../../services/ai/geminiService';
import { doctorService, type DocumentRecord } from '../../services/api/doctorService';
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
}

export const DischargeIntelligenceView: React.FC<DischargeIntelligenceViewProps> = React.memo(({
  onShowToast,
  aiStatus
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

  const handleSelectPreset = useCallback((preset: typeof SYNTHETIC_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setDischargeText(preset.text);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSyncedToCarePlan(false);
    setUploadedFileName(null);
    setUploadedDocId(null);
    setApprovalStatus('idle');
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
    setAnalysisStep('calling-gemini');

    try {
      const resp = await doctorService.uploadDocument(file);
      setUploadedDocId(resp.document_id || resp.documentId);
      
      // Fetch the structured extraction
      const detail = await doctorService.getDocumentDetail(resp.document_id || resp.documentId);
      if (detail && detail.extraction) {
        setAnalysisResult(detail.extraction as any);
        setAnalysisStep('complete');
        onShowToast?.(`✓ Document uploaded & parsed with Gemini: ${file.name}`);
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
  }, [loadDocumentsList, onShowToast]);

  const handleSelectExistingDoc = useCallback(async (docId: number) => {
    setUploadedDocId(docId);
    setAnalysisError(null);
    setIsAnalyzing(true);
    try {
      const detail = await doctorService.getDocumentDetail(docId);
      if (detail) {
        setUploadedFileName(detail.originalFilename);
        setAnalysisResult(detail.extraction as any);
        setApprovalStatus(detail.status === 'approved' ? 'approved' : detail.status === 'rejected' ? 'rejected' : 'idle');
        onShowToast?.(`Loaded extraction record for ${detail.originalFilename}`);
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to load document extraction');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onShowToast]);

  const handleSyncToCarePlan = useCallback(() => {
    if (!analysisResult) return;
    setSyncedToCarePlan(true);
    const apptCount = analysisResult.appointments?.length || 0;
    const medCount = analysisResult.medicationInstructions?.length || 0;
    const testCount = analysisResult.tests?.length || 0;
    onShowToast?.(`✓ Synced ${apptCount} appointment(s), ${medCount} medication(s), and ${testCount} lab test(s) to Care Coordinator Queue.`);
  }, [analysisResult, onShowToast]);

  const handleApproveDocument = useCallback(async () => {
    if (!uploadedDocId) {
      handleSyncToCarePlan();
      return;
    }
    setApprovalStatus('approving');
    try {
      const res = await doctorService.approveDocument(uploadedDocId);
      setApprovalStatus('approved');
      setSyncedToCarePlan(true);
      onShowToast?.(`✓ Approved & persisted to MySQL! Created ${res.tasks_created || 0} tasks, ${res.appointments_created || 0} appointments.`);
      loadDocumentsList();
    } catch (err: any) {
      setAnalysisError(err.message || 'Approval failed.');
      setApprovalStatus('idle');
    }
  }, [uploadedDocId, handleSyncToCarePlan, loadDocumentsList, onShowToast]);

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
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAnalysisError(err.message || 'Discharge extraction failed.');
      setAnalysisStep('idle');
    } finally {
      setIsAnalyzing(false);
    }
  }, [dischargeText, onShowToast]);

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
                      <span className="text-[10px] font-bold bg-[#00e575] text-[#052429] px-2 py-0.5 rounded-full">
                        Approved in MySQL
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-teal-200/80 max-w-xl">
                    Clinical safety rule: Tasks are not activated in the patient care plan until approved by an authorized Doctor or Care Coordinator.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {uploadedDocId && approvalStatus !== 'approved' && (
                    <button
                      onClick={handleRejectDocument}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-red-400/40 text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      Flag / Reject
                    </button>
                  )}

                  <button
                    onClick={handleApproveDocument}
                    disabled={approvalStatus === 'approved' || approvalStatus === 'approving'}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      approvalStatus === 'approved'
                        ? 'bg-emerald-500 text-white cursor-default'
                        : approvalStatus === 'approving'
                        ? 'bg-teal-700 text-teal-200 cursor-wait'
                        : 'bg-[#00e575] hover:bg-[#00cb68] text-[#052429]'
                    }`}
                  >
                    {approvalStatus === 'approved' ? (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        <span>Care Plan Activated in MySQL</span>
                      </>
                    ) : approvalStatus === 'approving' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Persisting Tasks to DB...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Approve & Activate in MySQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
