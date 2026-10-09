import { useEffect, useRef } from 'react';
import { useSceneStore } from './useSceneStore';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useSceneStore();

  useEffect(() => {
    // Only enable on non-touch desktop devices
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovered = false;
    let isVisible = false;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      const target = e.target as HTMLElement | null;
      isHovered = !!target?.closest('button, a, input, [role="button"], .interactive-node');
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    // Smooth 60fps RAF loop without triggering React component re-renders
    const loop = () => {
      // Smooth lerp for outer ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 6}px, ${mouseY - 6}px, 0) scale(${isHovered ? 2.2 : 1})`;
        dotRef.current.style.backgroundColor = isHovered ? '#00e575' : '#22d3ee';
        dotRef.current.style.boxShadow = isHovered
          ? '0 0 20px 4px rgba(0, 229, 117, 0.8), 0 0 40px 10px rgba(34, 211, 238, 0.4)'
          : '0 0 12px 2px rgba(34, 211, 238, 0.6)';
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0) scale(${isHovered ? 1.5 : 1})`;
        ringRef.current.style.borderColor = isHovered ? 'rgba(0, 229, 117, 0.7)' : 'rgba(34, 211, 238, 0.4)';
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      {/* Primary Cyan Glow Dot (Hardware-accelerated direct DOM transform) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-screen opacity-0 transition-opacity duration-150 will-change-transform"
        style={{ width: 12, height: 12 }}
      />
      {/* Trailing Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-teal-400/40 opacity-0 transition-opacity duration-150 will-change-transform"
        style={{ width: 40, height: 40 }}
      />
    </>
  );
}
