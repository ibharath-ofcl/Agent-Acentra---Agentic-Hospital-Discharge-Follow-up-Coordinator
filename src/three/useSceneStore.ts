import { create } from 'zustand';

export type QualityTier = 'high' | 'medium' | 'low';
export type SceneSection = 'hero' | 'story' | 'graph' | 'patient' | 'doctor' | 'safety' | 'voice';

interface SceneState {
  currentSection: SceneSection;
  activeRole: 'patient' | 'doctor' | null;
  qualityTier: QualityTier;
  hoveredNodeId: string | null;
  selectedTaskId: string | null;
  
  // Dependency Engine Showpiece State
  isXrayDelayed: boolean;
  dependencyPulseActive: boolean;
  selectedEvidence: {
    title: string;
    snippet: string;
    source: string;
    page: number;
    rule: string;
    riskType: string;
  } | null;

  // Voice & Safety Gate Simulation
  voiceCallState: 'idle' | 'ringing' | 'connected' | 'speaking' | 'safety_triggered' | 'completed' | 'escalated';
  voiceTranscript: string[];
  safetyTriggered: boolean;

  // Judge Mode Autoplay Tour
  isJudgeMode: boolean;
  judgeTourStep: number;
  isTourPaused: boolean;

  // Global Audio / Reduced Motion
  soundEnabled: boolean;
  prefersReducedMotion: boolean;

  // Actions
  setCurrentSection: (section: SceneSection) => void;
  setActiveRole: (role: 'patient' | 'doctor' | null) => void;
  setQualityTier: (tier: QualityTier) => void;
  setHoveredNodeId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  
  simulateXrayDelay: (delayed: boolean) => void;
  triggerDependencyPulse: () => void;
  setSelectedEvidence: (evidence: SceneState['selectedEvidence']) => void;
  
  setVoiceCallState: (state: SceneState['voiceCallState']) => void;
  addVoiceTranscript: (line: string) => void;
  triggerSafetyGate: (triggered: boolean) => void;
  
  setJudgeMode: (active: boolean) => void;
  setJudgeTourStep: (step: number) => void;
  toggleTourPause: () => void;
  
  toggleSound: () => void;
  setPrefersReducedMotion: (reduced: boolean) => void;
  resetAllDemoState: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentSection: 'hero',
  activeRole: null,
  qualityTier: 'high',
  hoveredNodeId: null,
  selectedTaskId: null,

  isXrayDelayed: false,
  dependencyPulseActive: false,
  selectedEvidence: null,

  voiceCallState: 'idle',
  voiceTranscript: [],
  safetyTriggered: false,

  isJudgeMode: false,
  judgeTourStep: 0,
  isTourPaused: false,

  soundEnabled: false,
  prefersReducedMotion: false,

  setCurrentSection: (section) => set({ currentSection: section }),
  setActiveRole: (role) => set({ activeRole: role }),
  setQualityTier: (tier) => set({ qualityTier: tier }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  simulateXrayDelay: (delayed) => set((state) => ({ 
    isXrayDelayed: delayed,
    dependencyPulseActive: true,
    selectedEvidence: delayed ? {
      title: 'Workflow Dependency Flag: X-Ray Delayed',
      snippet: 'Discharge Order #402: "Repeat Right Tibia/Fibula AP & Lateral X-ray required prior to weight-bearing assessment and Orthopedic Follow-up consultation."',
      source: 'Hospital Discharge Summary — Section 4 (Post-Op Imaging Protocol)',
      page: 2,
      rule: 'Prerequisite Dependency: Task [FT-XRAY-01] must be verified before Task [FT-ORTHO-02]',
      riskType: 'Workflow Risk (Care Coordination Delay — NOT Medical Severity)'
    } : null
  })),

  triggerDependencyPulse: () => set({ dependencyPulseActive: true }),
  setSelectedEvidence: (evidence) => set({ selectedEvidence: evidence }),

  setVoiceCallState: (state) => set({ voiceCallState: state }),
  addVoiceTranscript: (line) => set((s) => ({ voiceTranscript: [...s.voiceTranscript, line] })),
  triggerSafetyGate: (triggered) => set({ safetyTriggered: triggered }),

  setJudgeMode: (active) => set({ isJudgeMode: active, judgeTourStep: 0, isTourPaused: false }),
  setJudgeTourStep: (step) => set({ judgeTourStep: step }),
  toggleTourPause: () => set((s) => ({ isTourPaused: !s.isTourPaused })),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setPrefersReducedMotion: (reduced) => set({ prefersReducedMotion: reduced }),

  resetAllDemoState: () => set({
    isXrayDelayed: false,
    dependencyPulseActive: false,
    selectedEvidence: null,
    voiceCallState: 'idle',
    voiceTranscript: [],
    safetyTriggered: false,
    isJudgeMode: false,
    judgeTourStep: 0,
    isTourPaused: false,
    hoveredNodeId: null,
    selectedTaskId: null
  })
}));
