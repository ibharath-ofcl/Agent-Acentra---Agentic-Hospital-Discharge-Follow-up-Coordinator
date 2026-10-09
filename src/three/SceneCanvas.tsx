import React, { Suspense, useMemo } from 'react';
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

export const SceneCanvas = React.memo(function SceneCanvas() {
  const { currentSection, qualityTier, prefersReducedMotion } = useSceneStore();
  const isDashboard = currentSection === 'patient' || currentSection === 'doctor';

  const particleCount = useMemo(() => {
    if (isDashboard) return 0;
    if (qualityTier === 'low' || prefersReducedMotion) return 40;
    if (qualityTier === 'medium') return 90;
    return 140;
  }, [isDashboard, qualityTier, prefersReducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03181b]">
      {/* Background Gradient Scrims for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03181b]/70 via-transparent to-[#03181b]/90 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/40 via-[#03181b]/80 to-[#021012] pointer-events-none z-[1]" />

      <QualityManager />

      {/* When in dashboard mode, render lightweight static background without 3D canvas overhead */}
      {!isDashboard && (
        <Canvas
          className="w-full h-full pointer-events-auto"
          camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 100 }}
          dpr={qualityTier === 'high' ? [1, 1.5] : 1}
          gl={{ antialias: qualityTier === 'high', alpha: true, powerPreference: 'high-performance' }}
          frameloop="always"
        >
          <Lights />
          <CameraRig />
          {particleCount > 0 && <ParticleField count={particleCount} />}

          <Suspense fallback={null}>
            {currentSection === 'hero' && <HeroConstellationScene />}
            {currentSection === 'graph' && <CareGraph3D />}
            {currentSection === 'story' && <StoryStagesScene />}
          </Suspense>

          <PostFX />
        </Canvas>
      )}
    </div>
  );
});
