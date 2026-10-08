import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from './useSceneStore';

export function ParticleField({ count = 150 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { qualityTier, prefersReducedMotion } = useSceneStore();

  const particleCount = qualityTier === 'high' ? count : qualityTier === 'medium' ? Math.floor(count * 0.6) : 30;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const colorTeal = new THREE.Color('#22d3ee');
    const colorEmerald = new THREE.Color('#00e575');
    const colorPurple = new THREE.Color('#8b5cf6');

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 2;

      const choice = Math.random();
      const c = choice < 0.45 ? colorTeal : choice < 0.8 ? colorEmerald : colorPurple;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current || prefersReducedMotion) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
