import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneCall, 
  PhoneOff, 
  ShieldCheck, 
  ShieldAlert, 
  Volume2, 
  MessageSquare, 
  UserCheck, 
  AlertOctagon,
  RefreshCw,
  Play
} from 'lucide-react';
import { useSceneStore } from '../../three/useSceneStore';

export function VoiceSimulation3D() {
  const { 
    voiceCallState, 
    setVoiceCallState, 
    voiceTranscript, 
    addVoiceTranscript,
    safetyTriggered, 
    triggerSafetyGate 
  } = useSceneStore();

  const [callScenario, setCallScenario] = useState<'standard' | 'safety'>('standard');
  const [activeStep, setActiveStep] = useState(0);

  const startSimulation = (scenario: 'standard' | 'safety') => {
    setCallScenario(scenario);
    setVoiceCallState('ringing');
    triggerSafetyGate(false);
    setActiveStep(1);

    setTimeout(() => {
      setVoiceCallState('connected');
      setActiveStep(2);
      addVoiceTranscript('CareFlow AI: "Hello Arun, this is your automated CareFlow follow-up assistant from St. Jude Medical Center."');

      setTimeout(() => {
        setVoiceCallState('speaking');
        setActiveStep(3);
        addVoiceTranscript('CareFlow AI: "This is an informational reminder that your Right Tibia X-Ray is scheduled for tomorrow at 10:00 AM at the Radiology Department."');

        if (scenario === 'safety') {
          setTimeout(() => {
            setActiveStep(4);
            addVoiceTranscript('Patient: "Can I take an extra dose of Ticagrelor 90mg because my chest feels slightly tight?"');

            setTimeout(() => {
              setVoiceCallState('safety_triggered');
              triggerSafetyGate(true);
              setActiveStep(5);
              addVoiceTranscript('CareFlow AI [Safety Gate]: "This question involves medication dosage and clinical evaluation. CareFlow AI never provides medical advice. I am locking this transcript and routing your urgent question directly to Dr. Meera Patel for authorized clinical review."');
            }, 1800);
          }, 2000);
        } else {
          setTimeout(() => {
            setActiveStep(4);
            addVoiceTranscript('Patient: "Yes, I have noted the appointment time. Thank you."');
            setTimeout(() => {
              setVoiceCallState('completed');
              setActiveStep(5);
              addVoiceTranscript('CareFlow AI: "Thank you Arun. Your confirmation has been logged in your patient timeline. Have a restful recovery."');
            }, 1500);
          }, 2000);
        }
      }, 2000);
    }, 1800);
  };

  const resetCall = () => {
    setVoiceCallState('idle');
    triggerSafetyGate(false);
    setActiveStep(0);
  };

  return (
    <div className="bg-[#052429]/90 border border-[#0e4851] backdrop-blur-xl rounded-2xl p-6 shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-[#00e575]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Voice Reminder & Safety Gate Simulation
              <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full">
                Zero Medical Advice • Clinical Safety
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Simulates automated informational reminders with instant safety gating when clinical questions arise.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => startSimulation('standard')}
            disabled={voiceCallState !== 'idle' && voiceCallState !== 'completed' && voiceCallState !== 'safety_triggered'}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00e575] hover:bg-[#00cb68] text-[#052429] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Standard Reminder Call</span>
          </button>

          <button
            onClick={() => startSimulation('safety')}
            disabled={voiceCallState !== 'idle' && voiceCallState !== 'completed' && voiceCallState !== 'safety_triggered'}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Test Clinical Safety Gate</span>
          </button>

          {(voiceCallState !== 'idle') && (
            <button
              onClick={resetCall}
              className="p-2 rounded-xl bg-[#072d33] hover:bg-[#0a383f] text-slate-300 border border-[#145e69] transition-all cursor-pointer"
              title="Reset Call"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Call Status & Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Waveform Acoustic Orb */}
        <div className="p-4 rounded-xl bg-[#03181b] border border-[#0a383f] flex flex-col items-center justify-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-all relative ${
            safetyTriggered 
              ? 'bg-rose-950 border-2 border-rose-500 shadow-xl shadow-rose-950/80 animate-pulse' :
            voiceCallState === 'speaking' || voiceCallState === 'connected'
              ? 'bg-teal-950 border-2 border-[#00e575] shadow-xl shadow-teal-950' :
            voiceCallState === 'ringing'
              ? 'bg-amber-950 border-2 border-amber-500 animate-bounce' :
            'bg-[#072d33] border border-[#0e4851]'
          }`}>
            {safetyTriggered ? (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            ) : voiceCallState === 'speaking' ? (
              <Volume2 className="w-8 h-8 text-[#00e575] animate-pulse" />
            ) : voiceCallState === 'ringing' ? (
              <PhoneCall className="w-8 h-8 text-amber-400 animate-pulse" />
            ) : (
              <PhoneOff className="w-8 h-8 text-slate-500" />
            )}

            {/* Glowing animated sound waves */}
            {(voiceCallState === 'speaking' || voiceCallState === 'connected') && (
              <div className="absolute inset-0 rounded-full border border-[#00e575]/40 animate-ping pointer-events-none" />
            )}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {voiceCallState === 'idle' && 'Standby • Ready'}
            {voiceCallState === 'ringing' && 'Ringing (+91 98765 43210)...'}
            {voiceCallState === 'connected' && 'Call Connected'}
            {voiceCallState === 'speaking' && 'Streaming Informational Audio'}
            {voiceCallState === 'safety_triggered' && '🛑 SAFETY GATE ACTIVATED'}
            {voiceCallState === 'completed' && '✓ Call Confirmed & Logged'}
          </div>
        </div>

        {/* Live Audio Transcript Box */}
        <div className="md:col-span-2 p-4 rounded-xl bg-[#03181b] border border-[#0a383f] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#00e575]" />
              Live Conversation Transcript
            </span>
            <span className="text-[10px] text-teal-400 font-mono">Channel: Informational Voice</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-2 text-xs font-mono">
            {voiceTranscript.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">
                Click "Standard Reminder Call" or "Test Clinical Safety Gate" to start live audio simulation.
              </p>
            ) : (
              voiceTranscript.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    line.includes('[Safety Gate]')
                      ? 'bg-rose-950/80 border border-rose-600 text-rose-200 font-bold'
                      : line.startsWith('Patient:')
                      ? 'bg-teal-950/40 text-teal-200'
                      : 'bg-slate-900/60 text-slate-200'
                  }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>

          {safetyTriggered && (
            <div className="mt-3 pt-2 border-t border-rose-900/60 text-[11px] text-rose-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Safety Guarantee:</strong> AI halted instantly. Question transferred to Human Review Queue.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
