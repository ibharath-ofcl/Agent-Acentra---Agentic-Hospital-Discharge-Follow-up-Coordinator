import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles,
  Command,
  Layers
} from 'lucide-react';
import { useSceneStore } from '../../three/useSceneStore';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_STEPS = [
  {
    title: '1. Vision & Tagline',
    desc: 'HMS records what happened. CareFlow makes sure what needs to happen next doesn\'t get missed.',
    section: 'hero' as const,
    route: '/',
    action: 'view_hero'
  },
  {
    title: '2. Care Dependency Intelligence',
    desc: 'The CareFlow Second Brain: X-Ray prerequisite delay automatically flags dependent Orthopedic consultation.',
    section: 'graph' as const,
    route: '/',
    action: 'trigger_dependency'
  },
  {
    title: '3. Patient Experience Portal',
    desc: 'Patient-centric recovery dashboard with multi-language rewriting (English, Tamil, Hindi) & verification state.',
    section: 'patient' as const,
    route: '/patient',
    action: 'view_patient'
  },
  {
    title: '4. Doctor / Coordinator Command Center',
    desc: 'Priority queue, document ingestion OCR, at-risk patient triage & human-in-the-loop review queue.',
    section: 'doctor' as const,
    route: '/doctor',
    action: 'view_doctor'
  },
  {
    title: '5. Voice & Clinical Safety Gate',
    desc: 'Automated informational calls that instantly halt and route clinical dosage questions to human review.',
    section: 'safety' as const,
    route: '/',
    action: 'view_voice'
  }
];

export function JudgeModeTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isJudgeMode,
    setJudgeMode,
    judgeTourStep,
    setJudgeTourStep,
    isTourPaused,
    toggleTourPause,
    setCurrentSection,
    simulateXrayDelay,
    resetAllDemoState
  } = useSceneStore();

  // Keyboard Shortcuts Listener for Presenters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing inside inputs
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '1') {
        setJudgeMode(true);
        setJudgeTourStep(0);
        setCurrentSection('hero');
        navigate('/');
      } else if (e.key === '2') {
        setJudgeMode(true);
        setJudgeTourStep(1);
        setCurrentSection('graph');
        navigate('/');
      } else if (e.key === '3') {
        setJudgeMode(true);
        setJudgeTourStep(2);
        setCurrentSection('patient');
        navigate('/patient');
      } else if (e.key === '4') {
        setJudgeMode(true);
        setJudgeTourStep(3);
        setCurrentSection('doctor');
        navigate('/doctor');
      } else if (e.key === '5') {
        setJudgeMode(true);
        setJudgeTourStep(4);
        setCurrentSection('hero');
        navigate('/');
      } else if (e.key.toLowerCase() === 'd') {
        simulateXrayDelay(true);
      } else if (e.key.toLowerCase() === 'r') {
        resetAllDemoState();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, setCurrentSection, setJudgeMode, setJudgeTourStep, simulateXrayDelay, resetAllDemoState]);

  // Autoplay Timer when Judge Mode is active
  useEffect(() => {
    if (!isJudgeMode || isTourPaused) return;

    const timer = setTimeout(() => {
      const nextStep = (judgeTourStep + 1) % TOUR_STEPS.length;
      goToStep(nextStep);
    }, 12000); // 12 seconds per section = ~60s total tour

    return () => clearTimeout(timer);
  }, [isJudgeMode, isTourPaused, judgeTourStep]);

  const goToStep = (stepIdx: number) => {
    setJudgeTourStep(stepIdx);
    const step = TOUR_STEPS[stepIdx];
    setCurrentSection(step.section);

    if (location.pathname !== step.route) {
      navigate(step.route);
    }

    if (step.action === 'trigger_dependency') {
      setTimeout(() => simulateXrayDelay(true), 1500);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isJudgeMode && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setJudgeMode(true);
            goToStep(0);
          }}
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-[#00e575] to-[#22d3ee] text-[#052429] font-bold text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-white/30"
        >
          <Trophy className="w-4 h-4 fill-current" />
          <span>Launch Judge Mode (90s Tour)</span>
          <span className="bg-[#052429] text-[#00e575] text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            Keys: 1-5
          </span>
        </motion.button>
      )}

      {/* Interactive Tour HUD Overlay */}
      <AnimatePresence>
        {isJudgeMode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
          >
            <div className="bg-[#052429]/95 border-2 border-[#00e575] backdrop-blur-2xl rounded-2xl p-4 shadow-2xl text-white">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#00e575] text-[#052429]">
                    <Trophy className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00e575]">
                    {TOUR_STEPS[judgeTourStep].title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleTourPause}
                    className="p-1.5 rounded-lg bg-[#072d33] hover:bg-[#0a383f] text-slate-200 border border-[#0e4851] cursor-pointer"
                    title={isTourPaused ? 'Play' : 'Pause'}
                  >
                    {isTourPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      resetAllDemoState();
                      goToStep(0);
                    }}
                    className="p-1.5 rounded-lg bg-[#072d33] hover:bg-[#0a383f] text-slate-200 border border-[#0e4851] cursor-pointer"
                    title="Reset Tour"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setJudgeMode(false)}
                    className="p-1.5 rounded-lg bg-[#072d33] hover:bg-rose-900/60 text-slate-200 border border-[#0e4851] cursor-pointer"
                    title="Exit Judge Mode"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-200 mb-3 leading-relaxed">
                {TOUR_STEPS[judgeTourStep].desc}
              </p>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#0e4851]">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToStep(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        judgeTourStep === i ? 'w-8 bg-[#00e575]' : 'w-3 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Presenter Keys: <strong>1-5</strong> | Delay: <strong>D</strong> | Reset: <strong>R</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
