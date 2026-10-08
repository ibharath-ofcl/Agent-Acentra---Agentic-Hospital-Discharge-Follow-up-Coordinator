import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { ClosedLoopSection } from '../components/landing/ClosedLoopSection';
import { ReminderSection } from '../components/landing/ReminderSection';
import { SafetySection } from '../components/landing/SafetySection';
import { PatientExperienceSection } from '../components/landing/PatientExperienceSection';
import { DoctorExperienceSection } from '../components/landing/DoctorExperienceSection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <CapabilitiesSection />
        <ClosedLoopSection />
        <ReminderSection />
        <SafetySection />
        <PatientExperienceSection />
        <DoctorExperienceSection />
      </main>
      <Footer />
    </div>
  );
}
