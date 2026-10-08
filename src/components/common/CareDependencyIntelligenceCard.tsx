import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  ShieldAlert,
  HelpCircle,
  Layers,
  Network
} from 'lucide-react';
import { useSceneStore } from '../../three/useSceneStore';

export function CareDependencyIntelligenceCard() {
  const { 
    isXrayDelayed, 
    simulateXrayDelay, 
    selectedEvidence, 
    setSelectedEvidence,
    setCurrentSection 
  } = useSceneStore();

  return (
    <div className="bg-[#052429]/90 border border-[#0e4851] backdrop-blur-xl rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
      {/* Subtle Top Glowing Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00e575] via-[#22d3ee] to-[#8b5cf6]" />

      {/* Header & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#00e575]/20 border border-[#00e575]/40 text-[#00e575]">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Care Dependency Intelligence Engine
              <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-950 text-teal-300 border border-teal-700 px-2 py-0.5 rounded-full">
                Hero Feature • Second Brain
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Enforces temporal and prerequisite relationships between diagnostic orders, appointments, and care actions.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => simulateXrayDelay(!isXrayDelayed)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isXrayDelayed
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 animate-pulse'
                : 'bg-[#00e575] hover:bg-[#00cb68] text-[#052429] shadow-teal-950'
            }`}
          >
            {isXrayDelayed ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Simulating Delay (Active)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate X-Ray Delay</span>
              </>
            )}
          </button>

          {isXrayDelayed && (
            <button
              onClick={() => simulateXrayDelay(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#072d33] hover:bg-[#0a383f] text-slate-200 border border-[#145e69] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resolve</span>
            </button>
          )}
        </div>
      </div>

      {/* Dependency Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Step 1: Prerequisite Order */}
        <div className={`p-4 rounded-xl border transition-all ${
          isXrayDelayed 
            ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30' 
            : 'bg-[#072d33] border-[#0e4851]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-amber-400">Prerequisite Order</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isXrayDelayed ? 'bg-amber-500 text-amber-950' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
            }`}>
              {isXrayDelayed ? 'DELAYED' : 'ON SCHEDULE'}
            </span>
          </div>
          <div className="text-sm font-bold text-white mb-1">X-Ray Right Tibia AP & Lateral</div>
          <div className="text-[11px] text-slate-400">Scheduled: Within 48 Hours</div>
        </div>

        {/* Dependency Arrow & Rule */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#03181b]/60 border border-[#0a383f]">
          <div className="text-[11px] font-bold text-[#00e575] flex items-center gap-1 mb-1">
            <span>Required Before</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Temporal lock: Orthopedic surgeon requires fresh radiographs prior to clinical review.
          </p>
        </div>

        {/* Step 2: Dependent Action */}
        <div className={`p-4 rounded-xl border transition-all ${
          isXrayDelayed 
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40 animate-pulse' 
            : 'bg-[#072d33] border-[#0e4851]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-rose-400">Dependent Consultation</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isXrayDelayed ? 'bg-rose-500 text-rose-950' : 'bg-teal-950 text-teal-300 border border-teal-700'
            }`}>
              {isXrayDelayed ? 'FLAGGED AT RISK' : 'PENDING'}
            </span>
          </div>
          <div className="text-sm font-bold text-white mb-1">Orthopedic Follow-up Clinic</div>
          <div className="text-[11px] text-slate-400">Attending: Dr. Meera Patel (Day 5)</div>
        </div>
      </div>

      {/* Dynamic Evidence & Explanation Callout */}
      <AnimatePresence>
        {isXrayDelayed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2 mb-2"
          >
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Why Was This Flagged? (CareFlow Second Brain Traceability)</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong>Workflow Risk:</strong> The Orthopedic follow-up appointment is flagged "At Risk" because the prerequisite imaging (X-Ray Right Tibia) was not completed on time.
            </p>
            <div className="p-3 bg-[#03181b] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div><strong className="text-amber-400">Source Evidence:</strong> Discharge Summary, Page 2, Line 18</div>
              <div className="italic text-slate-400">"Repeat Right Tibia/Fibula AP & Lateral X-ray required prior to weight-bearing assessment and Orthopedic Follow-up consultation."</div>
              <div className="text-[#00e575] font-semibold pt-1">
                ✓ Coordinator Alert automatically routed to Dr. Meera Patel's Priority Queue.
              </div>
            </div>
            <div className="text-[10px] text-amber-300/80 font-medium">
              * Note: This represents workflow coordination risk, NOT medical risk or clinical diagnosis.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
