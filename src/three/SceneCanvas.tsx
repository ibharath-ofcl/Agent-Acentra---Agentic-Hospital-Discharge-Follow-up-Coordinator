import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { PostFX } from './PostFX';
import { ParticleField } from './ParticleField';
import { HeroConstellationScene } from './HeroConstellationScene';
import { CareGraph3D } from './CareGraph3D';
import { StoryStagesScene } from './StoryStagesScene';
import { QualityManager } from './QualityManager';
import { useSceneStore } from './useSceneStore';

export function SceneCanvas() {
  const { currentSection } = useSceneStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03181b]">
      {/* Background Gradient Scrims for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03181b]/70 via-transparent to-[#03181b]/90 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/40 via-[#03181b]/80 to-[#021012] pointer-events-none z-[1]" />

      <QualityManager />

      <Canvas
        className="w-full h-full pointer-events-auto"
        camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Lights />
        <CameraRig />
        <ParticleField count={160} />

        <Suspense fallback={null}>
          {currentSection === 'hero' && <HeroConstellationScene />}
          {currentSection === 'graph' && <CareGraph3D />}
          {currentSection === 'story' && <StoryStagesScene />}
          {(currentSection === 'patient' || currentSection === 'doctor') && <HeroConstellationScene />}
        </Suspense>

        <PostFX />
      </Canvas>
    </div>
  );
}
