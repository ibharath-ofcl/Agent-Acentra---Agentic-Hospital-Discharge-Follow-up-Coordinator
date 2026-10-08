import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  Layers, 
  Network, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSceneStore } from '../../three/useSceneStore';

const STORY_STAGES = [
  {
    step: '01',
    title: 'Discharge Summary Ingestion',
    icon: FileText,
    category: 'EHR Intake',
    desc: 'Unstructured hospital summaries, scanned PDFs, and doctor discharge orders are ingested without requiring complex manual data entry.',
    evidenceSnippet: 'Discharge Note #881: "Patient Arun Kumar, 58M, Post-PCI with drug eluting stent..."'
  },
  {
    step: '02',
    title: 'Document Intelligence & Extraction',
    icon: Brain,
    category: 'AI Multimodal Extraction',
    desc: 'The Coordinator Agent parses medicines, lab tests, diagnostic orders, clinical consultations, and red flag warnings, pinning exact line evidence to every task.',
    evidenceSnippet: 'Extracted: Tab. Ticagrelor 90mg BD (Evidence: Section 4.2 Rx Table)'
  },
  {
    step: '03',
    title: 'Structured Care Plan Synthesis',
    icon: Layers,
    category: 'Task State Machine',
    desc: 'Transforms clinical text into actionable tasks categorized by responsible roles (Patient, Nurse, Radiology, Doctor) with status flows: Pending, Completed, Needs Review.',
    evidenceSnippet: 'State Machine: 6 Recovery Milestones initialized with countdown timers'
  },
  {
    step: '04',
    title: 'Care Dependency Intelligence Engine',
    icon: Network,
    category: 'Second Brain Logic',
    desc: 'Discovers prerequisite links across actions (e.g. X-Ray must be verified before Orthopedic follow-up). If a prerequisite slips, dependent tasks flag At-Risk automatically.',
    evidenceSnippet: 'Constraint: Task [FT-XRAY] --(Required Before)--> Task [FT-ORTHO]'
  },
  {
    step: '05',
    title: 'Coordinator Agent + 7 Deterministic Engines',
    icon: Bot,
    category: 'Hybrid Architecture',
    desc: 'AI provides natural language understanding and multilingual rewriting (English, தமிழ், हिन्दी), while deterministic engines govern temporal dates, escalation, and rules.',
    evidenceSnippet: 'Separation of Concerns: Generative translation + Deterministic rule safety'
  },
  {
    step: '06',
    title: 'Human-in-the-Loop & Verification Gate',
    icon: ShieldCheck,
    category: 'Clinical Safety',
    desc: 'When patients report task completion, it is held in "Patient Reported" state until authorized hospital or lab results verify the record into full "COMPLETED" status.',
    evidenceSnippet: 'Anti-Hallucination: Radiology PACS confirmation unlocks official closure'
  },
  {
    step: '07',
    title: 'Closed-Loop Coordination',
    icon: CheckCircle2,
    category: '30-Day Protection',
    desc: 'Multi-channel reminders (Voice, SMS) keep the patient on schedule. If an appointment is missed, the care coordinator is alerted instantly to prevent readmission.',
    evidenceSnippet: 'Zero Leakage: Automated escalation resolves uncompleted post-op steps'
  }
];

export function ScrollStorySection() {
  const [activeStage, setActiveStage] = useState(0);
  const { setCurrentSection } = useSceneStore();

  return (
    <section id="how-it-works" className="py-20 bg-[#03181b] text-white relative border-b border-[#0a383f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00e575] bg-[#072d33] px-3 py-1 rounded-full border border-[#0e4851]">
            7-Stage Coordination Engine
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            How CareFlow Coordinates the Next Step
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            A comprehensive journey from raw hospital discharge records to verified 30-day patient recovery.
          </p>
        </div>

        {/* 7 Interactive Stage Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Stage Selector Column */}
          <div className="lg:col-span-5 space-y-2.5">
            {STORY_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = activeStage === idx;

              return (
                <button
                  key={stage.step}
                  onClick={() => {
                    setActiveStage(idx);
                    setCurrentSection('story');
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#052429] border-[#00e575] shadow-xl shadow-teal-950 text-white'
                      : 'bg-[#072d33]/50 border-[#0e4851] text-slate-400 hover:bg-[#072d33] hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-[#00e575] text-[#052429]' : 'bg-[#0a383f] text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#00e575]">
                        Stage {stage.step} • {stage.category}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">{stage.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed 3D Glass Inspector Card */}
          <div className="lg:col-span-7 sticky top-28">
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#052429]/95 border-2 border-[#00e575] backdrop-blur-2xl rounded-2xl p-7 shadow-2xl text-white relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#00e575] bg-[#00e575]/10 px-3 py-1 rounded-md border border-[#00e575]/30">
                  STAGE {STORY_STAGES[activeStage].step} OF 07
                </span>
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
                  Active In CareFlow Engine
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {STORY_STAGES[activeStage].title}
              </h3>

              <p className="text-sm text-slate-200 leading-relaxed mb-6">
                {STORY_STAGES[activeStage].desc}
              </p>

              {/* Evidence Snippet Callout */}
              <div className="p-4 rounded-xl bg-[#03181b] border border-[#0a383f] space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Live System Evidence & Execution Artifact
                </div>
                <div className="text-xs font-mono text-[#00e575]">
                  {STORY_STAGES[activeStage].evidenceSnippet}
                </div>
              </div>

              {/* Quick Navigation Footer */}
              <div className="mt-6 pt-4 border-t border-[#0e4851] flex items-center justify-between">
                <button
                  onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                  disabled={activeStage === 0}
                  className="text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  ← Previous Stage
                </button>

                <button
                  onClick={() => setActiveStage(Math.min(STORY_STAGES.length - 1, activeStage + 1))}
                  disabled={activeStage === STORY_STAGES.length - 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00e575] hover:bg-[#00cb68] text-[#052429] flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                >
                  <span>Next Stage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
