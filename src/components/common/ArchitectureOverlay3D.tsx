import React from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  Clock, 
  Network, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  Sparkles,
  Bot
} from 'lucide-react';

export function ArchitectureOverlay3D() {
  const services = [
    { name: 'Document Intelligence', icon: Database, desc: 'PDF / OCR entity recognition & source linking', type: 'Deterministic' },
    { name: 'Care Plan / Task Engine', icon: Layers, desc: 'Task states (Pending, Completed, Needs Review)', type: 'Deterministic' },
    { name: 'Temporal Deadline Engine', icon: Clock, desc: 'Date math, timeline triggers & countdowns', type: 'Deterministic' },
    { name: 'Dependency Second Brain', icon: Network, desc: 'Prerequisite enforcement & workflow risk graph', type: 'Deterministic' },
    { name: 'Safety & Clinical Review', icon: ShieldCheck, desc: 'Medical question gate & human routing', type: 'Deterministic' },
    { name: 'Provider Geo-Matching', icon: MapPin, desc: 'Clinic distance & provider suggestions', type: 'Deterministic' },
    { name: 'Multi-Channel Voice/SMS', icon: PhoneCall, desc: 'Informational calls, SMS fallback & audit', type: 'Deterministic' },
  ];

  return (
    <div className="bg-[#052429]/90 border border-[#0e4851] backdrop-blur-xl rounded-2xl p-6 shadow-2xl text-white">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#0e4851]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-[#00e575]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              System Architecture & AI Boundary Layer
              <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-950 text-teal-300 border border-teal-700 px-2 py-0.5 rounded-full">
                AI + Deterministic Hybrid
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            CareFlow separates generative AI intelligence from deterministic safety-critical business logic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Generative AI Coordinator Agent */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/50 to-[#03181b] border border-purple-500/50 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-700">
                Generative AI Layer
              </span>
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Coordinator Agent</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Autonomous reasoning layer responsible for extracting clinical intent from messy discharge summaries, rewriting instructions into 3 patient-friendly languages (English, தமிழ், हिन्दी), and classifying message safety.
            </p>
            <div className="space-y-1.5 text-[11px] text-purple-200">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Multimodal OCR Extraction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero Medical Advice Safety Filter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Patient Rewriting & Translation</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/60 text-[10px] text-purple-300 font-mono">
            Orchestration • Human-in-the-Loop Safe
          </div>
        </div>

        {/* 7 Deterministic Services Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.name} className="p-3.5 rounded-xl bg-[#03181b] border border-[#0a383f] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#072d33] text-[#00e575] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-white">{svc.name}</div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{svc.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
