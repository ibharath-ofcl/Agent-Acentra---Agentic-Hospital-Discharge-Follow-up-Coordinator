import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from './useSceneStore';

interface FragmentNode {
  id: string;
  label: string;
  category: string;
  status: 'completed' | 'pending' | 'needs-review';
  scatterPos: [number, number, number];
  targetPos: [number, number, number];
  color: string;
}

const FRAGMENTS: FragmentNode[] = [
  {
    id: 'f1',
    label: 'Tab. Ticagrelor 90mg BD',
    category: 'Medication Schedule',
    status: 'completed',
    scatterPos: [-5.5, 3.2, 1.2],
    targetPos: [-4.2, 2.2, 0],
    color: '#22c55e'
  },
  {
    id: 'f2',
    label: 'X-Ray Right Tibia AP & Lat',
    category: 'Diagnostic Order',
    status: 'pending',
    scatterPos: [5.2, 2.8, -1],
    targetPos: [3.8, 1.8, 0],
    color: '#f59e0b'
  },
  {
    id: 'f3',
    label: 'Orthopedic Post-Op Follow-up',
    category: 'Clinical Appointment',
    status: 'needs-review',
    scatterPos: [5.8, -1.8, 1.5],
    targetPos: [4.0, -1.2, 0],
    color: '#f43f5e'
  },
  {
    id: 'f4',
    label: 'Surgical Wound Dressing',
    category: 'Nursing Protocol',
    status: 'completed',
    scatterPos: [-5.8, -2.2, -0.8],
    targetPos: [-3.8, -1.5, 0],
    color: '#22c55e'
  },
  {
    id: 'f5',
    label: 'Physio ROM Exercises',
    category: 'Rehabilitation',
    status: 'pending',
    scatterPos: [-1.2, -4.2, 1.0],
    targetPos: [-0.5, -2.8, 0],
    color: '#22d3ee'
  },
  {
    id: 'f6',
    label: 'Red Flag: Calf Pain / Dyspnea',
    category: 'Warning Signs',
    status: 'needs-review',
    scatterPos: [1.8, 4.2, -1.2],
    targetPos: [1.2, 3.0, 0],
    color: '#ec4899'
  }
];

export function HeroConstellationScene() {
  const { currentSection, prefersReducedMotion } = useSceneStore();
  const scanBeamRef = useRef<THREE.Mesh>(null);
  const docRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeFragment, setActiveFragment] = useState<FragmentNode | null>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Scanning laser beam motion across document
    if (scanBeamRef.current && !prefersReducedMotion) {
      scanBeamRef.current.position.y = Math.sin(time * 2.2) * 2.8;
      (scanBeamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 4) * 0.3;
    }

    // Subtle gentle document float
    if (docRef.current && !prefersReducedMotion) {
      docRef.current.rotation.y = Math.sin(time * 0.4) * 0.08;
      docRef.current.rotation.x = Math.cos(time * 0.3) * 0.04;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Glass Discharge Document */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group ref={docRef}>
          {/* Main Glass Document Panel */}
          <mesh position={[0, 0, -0.2]}>
            <planeGeometry args={[5.2, 6.8]} />
            <meshPhysicalMaterial
              color="#072d33"
              transparent
              opacity={0.7}
              roughness={0.1}
              metalness={0.1}
              transmission={0.6}
              ior={1.4}
              reflectivity={0.5}
            />
          </mesh>

          {/* Luminous Glowing Border */}
          <lineSegments position={[0, 0, -0.19]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(5.2, 6.8)]} />
            <lineBasicMaterial color="#00e575" linewidth={2} transparent opacity={0.8} />
          </lineSegments>

          {/* Subtle Grid Lines on Document */}
          {[-2, -1, 0, 1, 2].map((y) => (
            <mesh key={y} position={[0, y, -0.18]}>
              <planeGeometry args={[4.2, 0.02]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
            </mesh>
          ))}

          {/* Document Header Text */}
          <Text
            position={[0, 2.6, -0.15]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            DISCHARGE SUMMARY
          </Text>
          <Text
            position={[0, 2.2, -0.15]}
            fontSize={0.12}
            color="#00e575"
            anchorX="center"
            anchorY="middle"
          >
            PATIENT: ARUN KUMAR • MRN: P001 • AI EXTRACTED
          </Text>

          {/* Scanning Light Beam */}
          <mesh ref={scanBeamRef} position={[0, 0, 0.05]}>
            <planeGeometry args={[5.4, 0.12]} />
            <meshBasicMaterial color="#00e575" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      </Float>

      {/* Scattered to Constellation Nodes */}
      {FRAGMENTS.map((frag, idx) => {
        const isHovered = hoveredId === frag.id;
        const pos = frag.targetPos;

        return (
          <group key={frag.id} position={pos}>
            <Float speed={2 + idx * 0.3} rotationIntensity={0.2} floatIntensity={0.6}>
              {/* Outer Glow Halo */}
              <mesh
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredId(frag.id);
                  setActiveFragment(frag);
                }}
                onPointerOut={() => {
                  setHoveredId(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFragment(frag);
                }}
              >
                <sphereGeometry args={[isHovered ? 0.35 : 0.22, 32, 32]} />
                <meshStandardMaterial
                  color={frag.color}
                  emissive={frag.color}
                  emissiveIntensity={isHovered ? 3.5 : 1.8}
                  roughness={0.2}
                />
              </mesh>

              {/* Glowing Pulse Ring around Node */}
              <mesh>
                <ringGeometry args={[0.3, 0.36, 32]} />
                <meshBasicMaterial color={frag.color} transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>

              {/* Node Label Floating Text */}
              <Text
                position={[0, -0.45, 0]}
                fontSize={0.18}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={2.8}
                textAlign="center"
              >
                {frag.label}
              </Text>

              {/* HTML Glass Tooltip on Hover */}
              {isHovered && (
                <Html position={[0, 0.8, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                  <div className="bg-[#052429]/95 border border-[#00e575] backdrop-blur-xl p-3.5 rounded-xl shadow-2xl text-left w-64 pointer-events-none transform transition-all duration-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00e575] bg-[#00e575]/10 px-2 py-0.5 rounded-md border border-[#00e575]/30">
                        {frag.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        frag.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                        frag.status === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                        'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}>
                        {frag.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white leading-snug">{frag.label}</div>
                    <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]"></span>
                      Parsed & Structured by CareFlow AI
                    </div>
                  </div>
                </Html>
              )}
            </Float>

            {/* Glowing Connection Line back to Center Document */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([0, 0, 0, -pos[0] * 0.7, -pos[1] * 0.7, -pos[2]]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial color={frag.color} transparent opacity={0.3} linewidth={1} />
            </line>
          </group>
        );
      })}
    </group>
  );
}
