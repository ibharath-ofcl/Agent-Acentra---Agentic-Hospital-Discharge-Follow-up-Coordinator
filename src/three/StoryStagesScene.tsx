import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from './useSceneStore';

const SERVICE_MODULES = [
  { name: 'Document Intelligence', color: '#22d3ee' },
  { name: 'Care Plan / Task Engine', color: '#00e575' },
  { name: 'Deadline Engine', color: '#f59e0b' },
  { name: 'Dependency Engine', color: '#ec4899' },
  { name: 'Safety & Human Review', color: '#f43f5e' },
  { name: 'Provider Search', color: '#8b5cf6' },
  { name: 'Voice & Notifications', color: '#3b82f6' },
];

export function StoryStagesScene({ stage = 0 }: { stage?: number }) {
  const { prefersReducedMotion } = useSceneStore();
  const nucleusRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (prefersReducedMotion) return;
    const time = state.clock.getElapsedTime();

    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = time * 0.4;
      nucleusRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Coordinator Agent Core (AI Nucleus) */}
      <group ref={nucleusRef}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          {/* Glowing Nucleus Sphere */}
          <mesh>
            <sphereGeometry args={[1.1, 32, 32]} />
            <meshStandardMaterial
              color="#00e575"
              emissive="#00e575"
              emissiveIntensity={2.8}
              roughness={0.1}
              metalness={0.2}
            />
          </mesh>

          {/* Central Label */}
          <Text
            position={[0, 0, 1.2]}
            fontSize={0.22}
            color="#052429"
            anchorX="center"
            anchorY="middle"
          >
            COORDINATOR AGENT
          </Text>

          {/* 7 Orbiting Service Satellites (Deterministic Engines) */}
          {SERVICE_MODULES.map((mod, idx) => {
            const angle = (idx / SERVICE_MODULES.length) * Math.PI * 2;
            const radius = 3.6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <group key={mod.name} position={[x, y, 0]}>
                {/* Service Orb */}
                <mesh>
                  <sphereGeometry args={[0.32, 24, 24]} />
                  <meshStandardMaterial
                    color={mod.color}
                    emissive={mod.color}
                    emissiveIntensity={2.5}
                  />
                </mesh>

                {/* Orbit Link Beam */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array([0, 0, 0, -x, -y, 0]), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color={mod.color} transparent opacity={0.35} />
                </line>

                {/* Service Label Text */}
                <Text
                  position={[0, -0.45, 0]}
                  fontSize={0.15}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2.0}
                  textAlign="center"
                >
                  {mod.name}
                </Text>
              </group>
            );
          })}
        </Float>
      </group>

      {/* Outer Closed Loop Coordination Halo */}
      <mesh ref={ringRef} position={[0, 0, -0.5]}>
        <ringGeometry args={[4.4, 4.55, 64]} />
        <meshBasicMaterial color="#00e575" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
