import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSceneStore } from './useSceneStore';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { prefersReducedMotion } = useSceneStore();

  useEffect(() => {
    // Only enable on non-touch desktop devices
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest('button, a, input, [role="button"], .interactive-node');
      setIsHovered(isInteractive);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible, prefersReducedMotion]);

  if (!isVisible || prefersReducedMotion) return null;

  return (
    <>
      {/* Primary Cyan Glow Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-screen"
        animate={{
          x: position.x - 6,
          y: position.y - 6,
          scale: isHovered ? 2.2 : 1,
          backgroundColor: isHovered ? '#00e575' : '#22d3ee',
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 450, mass: 0.1 }}
        style={{
          width: 12,
          height: 12,
          boxShadow: isHovered 
            ? '0 0 20px 4px rgba(0, 229, 117, 0.8), 0 0 40px 10px rgba(34, 211, 238, 0.4)' 
            : '0 0 12px 2px rgba(34, 211, 238, 0.6)',
        }}
      />
      {/* Trailing Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-teal-400/40"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isHovered ? 1.5 : 1,
          borderColor: isHovered ? 'rgba(0, 229, 117, 0.7)' : 'rgba(34, 211, 238, 0.4)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.3 }}
        style={{
          width: 40,
          height: 40,
        }}
      />
    </>
  );
}
