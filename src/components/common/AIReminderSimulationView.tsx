import { useState } from 'react';
import {
  PhoneCall,
  CalendarClock,
  CheckCircle2,
  PhoneOff,
  PhoneForwarded,
  MessageSquare,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  ShieldAlert,
  Bot
} from 'lucide-react';

type SimulationState = 'scheduled' | 'calling' | 'answered' | 'no-answer' | 'retry-scheduled' | 'escalated';

export function AIReminderSimulationView() {
  const [simState, setSimState] = useState<SimulationState>('scheduled');
  const [isPlaying, setIsPlaying] = useState(false);

  // Simple simulation sequence for demo purposes
  const runSimulation = () => {
    setIsPlaying(true);
    setSimState('scheduled');
    
    setTimeout(() => setSimState('calling'), 1500);
    setTimeout(() => setSimState('no-answer'), 4000);
    setTimeout(() => setSimState('retry-scheduled'), 5500);
    setTimeout(() => setSimState('calling'), 7500);
    setTimeout(() => setSimState('answered'), 10000);
    setTimeout(() => setIsPlaying(false), 12000);
  };

  const getStatusDisplay = () => {
    switch (simState) {
      case 'scheduled': return { label: 'Scheduled', color: 'text-teal-700 bg-teal-50 border-teal-200', icon: CalendarClock };
      case 'calling': return { label: 'Calling...', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: PhoneCall };
      case 'answered': return { label: 'Answered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 };
      case 'no-answer': return { label: 'No Answer', color: 'text-red-700 bg-red-50 border-red-200', icon: PhoneOff };
      case 'retry-scheduled': return { label: 'Retry Scheduled', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: PhoneForwarded };
      case 'escalated': return { label: 'Escalated', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle };
      default: return { label: 'Scheduled', color: 'text-slate-700 bg-slate-50 border-slate-200', icon: CalendarClock };
    }
  };

  const currentStatus = getStatusDisplay();
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-6 h-6 text-teal-600" />
                AI Voice Follow-up Simulation
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Frontend simulation of automated patient outreach. No real phone calls are made.
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              isPlaying 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
            }`}
          >
            {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            {isPlaying ? 'Simulation Running...' : 'Run Simulation Sequence'}
          </button>
        </div>

        {/* Target Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Patient</div>
            <div className="font-bold text-slate-800">Arun Kumar</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Task</div>
            <div className="font-bold text-slate-800">Cardiology Follow-up</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</div>
            <div className="font-bold text-slate-800">15 October 2026</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reminder Schedule</div>
            <div className="font-bold text-slate-800">14 Oct 2026 • 10:00 AM</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: AI Transcript & Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Current Status</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${currentStatus.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {currentStatus.label}
              </span>
            </div>

            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 relative">
              <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2">Simulated Voice Transcript</div>
              <p className="text-teal-900 font-medium text-sm leading-relaxed">
                "Hello Arun, this is the hospital follow-up coordinator. This is a reminder that your discharge plan shows a cardiology follow-up scheduled for tomorrow. Please check your follow-up details in your portal. Thank you."
              </p>
              
              {simState === 'calling' && (
                <div className="absolute top-4 right-4 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              )}
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Safety Constraints Active</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-amber-800 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Informational reminder only</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> No medical diagnosis provided</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> No treatment advice offered</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> No medication advice given</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline Representation */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-slate-400" /> Outreach Timeline
          </h3>

          <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
            
            {/* Attempt 1 */}
            <div className="relative pl-6">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                ['no-answer', 'retry-scheduled', 'answered'].includes(simState) ? 'bg-red-500' : 'bg-slate-200'
              }`}></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Attempt 1 • 10:00 AM</span>
                <span className="text-sm font-bold text-slate-800">Voice Call</span>
                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  {['no-answer', 'retry-scheduled', 'answered'].includes(simState) ? (
                    <><PhoneOff className="w-3.5 h-3.5 text-red-500" /> No answer</>
                  ) : (
                    <><CalendarClock className="w-3.5 h-3.5" /> Pending...</>
                  )}
                </span>
              </div>
            </div>

            {/* Attempt 2 */}
            <div className="relative pl-6">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                simState === 'answered' ? 'bg-emerald-500' : ['retry-scheduled', 'calling'].includes(simState) ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'
              }`}></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Attempt 2 • 10:15 AM</span>
                <span className="text-sm font-bold text-slate-800">Voice Call</span>
                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  {simState === 'answered' ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Answered</>
                  ) : simState === 'calling' ? (
                    <><PhoneCall className="w-3.5 h-3.5 text-amber-500" /> Calling...</>
                  ) : simState === 'retry-scheduled' ? (
                    <><Clock className="w-3.5 h-3.5 text-teal-500" /> Scheduled</>
                  ) : (
                    <><CalendarClock className="w-3.5 h-3.5" /> Pending...</>
                  )}
                </span>
              </div>
            </div>

            {/* Fallback */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fallback • 10:30 AM</span>
                <span className="text-sm font-bold text-slate-800">SMS Notification</span>
                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Pending
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Additional icons
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
