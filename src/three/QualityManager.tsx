import React, { useEffect } from 'react';
import { useSceneStore } from './useSceneStore';

export function QualityManager() {
  const { setQualityTier, setPrefersReducedMotion } = useSceneStore();

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    // Heuristic device tier detection
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    if (isMobile || cores <= 4 || memory <= 4) {
      setQualityTier('medium');
    } else {
      setQualityTier('high');
    }

    return () => mediaQuery.removeEventListener('change', listener);
  }, [setQualityTier, setPrefersReducedMotion]);

  return null;
}
