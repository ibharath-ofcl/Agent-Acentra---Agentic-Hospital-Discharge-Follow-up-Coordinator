import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useSceneStore } from './useSceneStore';

export function PostFX() {
  const { qualityTier, prefersReducedMotion } = useSceneStore();

  if (qualityTier === 'low' || prefersReducedMotion) {
    return null;
  }

  return (
    <EffectComposer multisampling={qualityTier === 'high' ? 4 : 0}>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.8} 
        intensity={qualityTier === 'high' ? 0.7 : 0.4} 
        mipmapBlur 
      />
      <Vignette eskil={false} offset={0.15} darkness={0.8} />
    </EffectComposer>
  );
}
