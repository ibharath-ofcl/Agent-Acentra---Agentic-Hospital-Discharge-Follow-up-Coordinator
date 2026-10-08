import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Brain,
  ShieldAlert,
  ClipboardList,
  ListTodo,
  PhoneCall,
  UserCheck,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  User,
  Stethoscope,
  Network
} from 'lucide-react';
import { useSceneStore } from '../../three/useSceneStore';

export function HeroSection() {
  const navigate = useNavigate();
  const { setCurrentSection } = useSceneStore();

  const taglineWords = [
    'HMS', 'records', 'what', 'happened.',
    'CareFlow', 'makes', 'sure', 'what', 'needs', 'to', 'happen', 'next',
    'doesn\'t', 'get', 'missed.'
  ];

  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 text-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header & Mission */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Tag badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#072d33]/80 text-[#00e575] border border-[#00e575]/40 mb-6 backdrop-blur-md shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
            Agentic Hospital Discharge & Follow-up Coordinator
          </motion.div>

          {/* Headline Word-by-Word Reveal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] text-center">
            {taglineWords.map((word, i) => {
              const isHighlight = word.includes('CareFlow') || word.includes('missed.');
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className={`inline-block mr-2.5 ${isHighlight ? 'text-[#00e575]' : 'text-white'}`}
                >
                  {word}
                </motion.span>
              );
            })}
          </h1>

          {/* Problem & Solution Explanation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal text-center"
          >
            After hospital discharge, patients struggle with tests, appointments, medications, and warning signs. 
            <strong> CareFlow AI</strong> sits on top of hospital systems as a 3D cognitive coordination layer — predicting workflow risks before they become clinical emergencies.
          </motion.p>

          {/* Dual Role Enter CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => {
                setCurrentSection('patient');
                navigate('/patient');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-xl hover:shadow-[#00e575]/20 hover:-translate-y-0.5 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Enter as Patient (Arun Kumar)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentSection('doctor');
                navigate('/doctor');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#072d33]/90 hover:bg-[#0a383f] border border-[#145e69] hover:border-[#00e575] rounded-xl transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-[#00e575]" />
              <span>Enter as Care Coordinator</span>
              <ChevronRight className="w-4 h-4 text-[#00e575]" />
            </button>
          </motion.div>

          {/* Compliance & Synthetic Badge */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#00e575] shrink-0" />
            <span>Workflow Risk Engine • Zero Medical Advice Given • Synthetic Demonstration Data</span>
          </div>
        </div>

        {/* 3D Visual Constellation Interactive Callout Box */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="bg-[#052429]/80 border border-[#0e4851] rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00e575]/20 border border-[#00e575]/40 flex items-center justify-center text-[#00e575] shrink-0">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#00e575]">
                  Interactive 3D Constellation Layer Active
                </div>
                <div className="text-sm font-semibold text-white">
                  Move your cursor to orbit the 3D discharge document & explore extracted entity nodes.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCurrentSection('graph');
                  const el = document.getElementById('care-graph-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#072d33] hover:bg-[#0a383f] text-[#00e575] border border-[#145e69] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jump to Care Graph</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
