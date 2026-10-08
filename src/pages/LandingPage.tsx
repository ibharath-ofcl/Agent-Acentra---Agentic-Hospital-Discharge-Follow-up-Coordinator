import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ScrollStorySection } from '../components/landing/ScrollStorySection';
import { CareDependencyIntelligenceCard } from '../components/common/CareDependencyIntelligenceCard';
import { VoiceSimulation3D } from '../components/common/VoiceSimulation3D';
import { VerificationGate3D } from '../components/common/VerificationGate3D';
import { ArchitectureOverlay3D } from '../components/common/ArchitectureOverlay3D';
import { PatientExperienceSection } from '../components/landing/PatientExperienceSection';
import { DoctorExperienceSection } from '../components/landing/DoctorExperienceSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white">
      <Navbar />
      <main className="flex-1 space-y-16 lg:space-y-24">
        {/* 1. Cinematic Hero with 3D Constellation Document */}
        <HeroSection />

        {/* 2. Hero Showpiece: Care Dependency Intelligence Engine (Second Brain) */}
        <section id="care-graph-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CareDependencyIntelligenceCard />
        </section>

        {/* 3. 7-Stage Post-Discharge Coordination Story */}
        <ScrollStorySection />

        {/* 4. Voice Reminder & Safety Gate Simulation */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VoiceSimulation3D />
        </section>

        {/* 5. Verification Gate & Cryptographic Audit Ledger */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VerificationGate3D />
        </section>

        {/* 6. System Architecture (Agent + 7 Deterministic Engines) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArchitectureOverlay3D />
        </section>

        {/* 7. Role Portals */}
        <PatientExperienceSection />
        <DoctorExperienceSection />

        {/* 8. Final CTA */}
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
