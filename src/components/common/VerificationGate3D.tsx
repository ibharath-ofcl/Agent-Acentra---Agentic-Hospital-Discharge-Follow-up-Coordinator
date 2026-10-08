import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  Building2, 
  UserCheck,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export function VerificationGate3D() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="bg-[#052429]/90 border border-[#0e4851] backdrop-blur-xl rounded-2xl p-6 shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[#00e575]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Authorized Verification Gate & Audit Ledger
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full">
                Anti-Hallucination Protocol
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Patients can report action completion, but critical recovery milestones require authorized clinical or hospital verification to reach official 'COMPLETED' state.
          </p>
        </div>

        <button
          onClick={() => setIsVerified(!isVerified)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            isVerified
              ? 'bg-[#072d33] hover:bg-[#0a383f] text-slate-200 border border-[#145e69]'
              : 'bg-[#00e575] hover:bg-[#00cb68] text-[#052429]'
          }`}
        >
          {isVerified ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Reset Gate</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span>Simulate Radiology Verification</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Verification Gate Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* State Transformation Box */}
        <div className="p-5 rounded-xl bg-[#03181b] border border-[#0a383f] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Milestone: Right Tibia X-Ray (Task FT001)
          </div>

          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-amber-500/50 bg-amber-950/20">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Patient Reported State</div>
                <div className="text-[10px] text-slate-400">"I completed the X-Ray appointment"</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-amber-900/60 text-amber-300 border border-amber-600 px-2 py-0.5 rounded-md">
              Reported (Unverified)
            </span>
          </div>

          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-700 relative">
              <div className={`absolute -left-1 top-1 w-2.5 h-2.5 rounded-full ${isVerified ? 'bg-[#00e575] animate-ping' : 'bg-slate-500'}`} />
            </div>
          </div>

          <div className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
            isVerified 
              ? 'border-[#00e575] bg-emerald-950/40 shadow-lg shadow-emerald-950/50' 
              : 'border-slate-800 bg-[#052429]/40 opacity-50'
          }`}>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 ${isVerified ? 'text-[#00e575]' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold text-white">Hospital Verified State</div>
                <div className="text-[10px] text-slate-400">Radiology RIS/PACS report confirmed</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
              isVerified 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              {isVerified ? 'COMPLETED (VERIFIED)' : 'GATE LOCKED'}
            </span>
          </div>
        </div>

        {/* Live Audit Ledger */}
        <div className="p-5 rounded-xl bg-[#03181b] border border-[#0a383f] space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Cryptographic Audit Trail</span>
            <span className="text-[10px] text-[#00e575] font-mono">Immutable Log</span>
          </div>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-[#072d33] border border-[#0e4851] text-slate-300">
              <div className="text-slate-400 text-[10px]">2026-10-06 09:15:00 UTC</div>
              <div className="text-white font-semibold">PATIENT_REPORTED_COMPLETION</div>
              <div className="text-slate-400 text-[10px]">Actor: Arun Kumar (Patient Portal)</div>
            </div>

            {isVerified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600 text-emerald-200"
              >
                <div className="text-emerald-400 text-[10px]">2026-10-06 11:30:22 UTC</div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
                  HOSPITAL_AUTHORIZED_VERIFICATION
                </div>
                <div className="text-emerald-300 text-[10px]">
                  Actor: Dr. Meera Patel • RIS Accession #XR-9821
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
