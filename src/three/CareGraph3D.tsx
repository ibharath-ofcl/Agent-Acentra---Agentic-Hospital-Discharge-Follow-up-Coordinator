import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from './useSceneStore';

interface GraphNode {
  id: string;
  label: string;
  category: string;
  role: string;
  deadline: string;
  status: 'completed' | 'pending' | 'at-risk' | 'needs-review';
  position: [number, number, number];
  color: string;
  evidence: string;
  page: number;
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: 'node-xray',
    label: 'X-Ray Right Tibia AP & Lat',
    category: 'Diagnostic Radiology',
    role: 'Radiology / Patient',
    deadline: 'Within 48h (Day 2)',
    status: 'pending',
    position: [-3.2, 1.4, 0],
    color: '#f59e0b',
    evidence: 'Discharge Order #402: "Repeat AP & Lateral X-ray required before orthopedic weight-bearing clearance."',
    page: 2
  },
  {
    id: 'node-ortho',
    label: 'Orthopedic Follow-up Clinic',
    category: 'Specialist Consultation',
    role: 'Dr. Meera Patel',
    deadline: 'Day 5 Post-Discharge',
    status: 'pending',
    position: [1.8, 1.4, 0],
    color: '#22d3ee',
    evidence: 'Section 4.1: "Orthopedic review requires fresh radiographs to evaluate bone alignment."',
    page: 2
  },
  {
    id: 'node-meds',
    label: 'Dual Antiplatelet Therapy',
    category: 'Prescription Schedule',
    role: 'Patient / Clinical Pharmacist',
    deadline: 'Daily 09:00 & 21:00',
    status: 'completed',
    position: [-3.5, -1.8, 0],
    color: '#22c55e',
    evidence: 'Rx Table: "Ticagrelor 90mg BD + Aspirin 75mg OD strictly for 90 days."',
    page: 3
  },
  {
    id: 'node-wound',
    label: 'Wound Dressing & Suture Check',
    category: 'Nursing Protocol',
    role: 'Home Nurse / Clinic',
    deadline: 'Day 7 Post-Discharge',
    status: 'pending',
    position: [-0.5, -2.2, 0],
    color: '#22d3ee',
    evidence: 'Nursing Instructions: "Inspect surgical incision site for erythema or discharge."',
    page: 3
  },
  {
    id: 'node-physio',
    label: 'Rehabilitation & Physio Phase 1',
    category: 'Physical Therapy',
    role: 'Physiotherapist',
    deadline: 'Day 10 Post-Discharge',
    status: 'pending',
    position: [3.8, -1.5, 0],
    color: '#a855f7',
    evidence: 'Rehab Protocol: "Passive ROM exercises allowed only after orthopedic clearance."',
    page: 4
  }
];

export function CareGraph3D() {
  const { 
    isXrayDelayed, 
    hoveredNodeId, 
    setHoveredNodeId, 
    setSelectedEvidence,
    prefersReducedMotion 
  } = useSceneStore();

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (prefersReducedMotion) return;
    const time = state.clock.getElapsedTime();

    // Traveling particle along the dependency edge from X-Ray to Ortho
    if (pulseRef.current) {
      const progress = (time * 0.8) % 1;
      const startX = -3.2;
      const endX = 1.8;
      const curX = startX + (endX - startX) * progress;
      const curY = 1.4 + Math.sin(progress * Math.PI) * 0.5;
      pulseRef.current.position.set(curX, curY, 0.1);
      
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.color.set(isXrayDelayed ? '#f43f5e' : '#00e575');
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Dependency Edge: X-Ray -> Orthopedic Follow-up */}
      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([-3.2, 1.4, 0, 1.8, 1.4, 0]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color={isXrayDelayed ? '#f43f5e' : '#00e575'} 
            linewidth={3} 
            transparent 
            opacity={0.85} 
          />
        </line>

        {/* Directional Flowing Particle */}
        <mesh ref={pulseRef} position={[-3.2, 1.4, 0.1]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color={isXrayDelayed ? '#f43f5e' : '#00e575'} />
        </mesh>

        {/* Dependency Badge Label in 3D */}
        <Text
          position={[-0.7, 1.8, 0]}
          fontSize={0.16}
          color={isXrayDelayed ? '#f43f5e' : '#00e575'}
          anchorX="center"
          anchorY="middle"
        >
          {isXrayDelayed ? '⚠️ REQUIRED BEFORE (BLOCKED)' : '➔ REQUIRED BEFORE'}
        </Text>
      </group>

      {/* Secondary Dependency Edge: Orthopedic -> Physio */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([1.8, 1.4, 0, 3.8, -1.5, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#a855f7" linewidth={1.5} transparent opacity={0.5} />
      </line>

      {/* Secondary Dependency Edge: Wound -> Physio */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-0.5, -2.2, 0, 3.8, -1.5, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22d3ee" linewidth={1.5} transparent opacity={0.4} />
      </line>

      {/* Render Nodes */}
      {GRAPH_NODES.map((node, idx) => {
        const isOrtho = node.id === 'node-ortho';
        const isXray = node.id === 'node-xray';
        
        let nodeColor = node.color;
        let nodeStatus = node.status;
        
        if (isXray && isXrayDelayed) {
          nodeColor = '#f59e0b';
          nodeStatus = 'pending';
        } else if (isOrtho && isXrayDelayed) {
          nodeColor = '#f43f5e';
          nodeStatus = 'at-risk';
        }

        const isHovered = hoveredNodeId === node.id;
        const isDimmed = hoveredNodeId !== null && hoveredNodeId !== node.id;

        return (
          <group key={node.id} position={node.position}>
            <Float speed={1.8 + idx * 0.2} rotationIntensity={0.15} floatIntensity={0.3}>
              {/* Outer Core Sphere */}
              <mesh
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredNodeId(node.id);
                }}
                onPointerOut={() => {
                  setHoveredNodeId(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  setSelectedEvidence({
                    title: node.label,
                    snippet: node.evidence,
                    source: `Discharge Document — Page ${node.page}`,
                    page: node.page,
                    rule: `Assigned Role: ${node.role} • Due: ${node.deadline}`,
                    riskType: isOrtho && isXrayDelayed 
                      ? 'Workflow Risk: Prerequisite X-Ray Delayed' 
                      : 'Standard Care Plan Timeline'
                  });
                }}
              >
                <sphereGeometry args={[isHovered ? 0.45 : 0.32, 32, 32]} />
                <meshStandardMaterial
                  color={nodeColor}
                  emissive={nodeColor}
                  emissiveIntensity={isHovered ? 4.0 : 2.0}
                  roughness={0.15}
                  transparent
                  opacity={isDimmed ? 0.35 : 1}
                />
              </mesh>

              {/* Pulsing Outer Halo for At-Risk node */}
              {isOrtho && isXrayDelayed && (
                <mesh>
                  <ringGeometry args={[0.45, 0.65, 32]} />
                  <meshBasicMaterial color="#f43f5e" transparent opacity={0.65} side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* 3D Label */}
              <Text
                position={[0, -0.6, 0]}
                fontSize={0.2}
                color={isDimmed ? '#94a3b8' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
                maxWidth={2.8}
                textAlign="center"
              >
                {node.label}
              </Text>

              {/* Status Tag Text */}
              <Text
                position={[0, -0.9, 0]}
                fontSize={0.13}
                color={nodeColor}
                anchorX="center"
                anchorY="middle"
              >
                {nodeStatus.toUpperCase()}
              </Text>

              {/* 3D Glass Detail Tooltip on Hover */}
              {isHovered && (
                <Html position={[0, 0.9, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                  <div className="bg-[#052429]/95 border border-[#00e575] backdrop-blur-xl p-4 rounded-xl shadow-2xl text-left w-72 pointer-events-none">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#00e575] bg-[#00e575]/10 px-2 py-0.5 rounded border border-[#00e575]/30">
                        {node.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        nodeStatus === 'at-risk' ? 'bg-red-950 text-red-300 border border-red-700' :
                        nodeStatus === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                        'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {nodeStatus}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">{node.label}</div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div><strong className="text-slate-400">Responsible:</strong> {node.role}</div>
                      <div><strong className="text-slate-400">Timeline:</strong> {node.deadline}</div>
                      <div className="text-slate-400 italic text-[10px] pt-1 border-t border-slate-700">
                        "{node.evidence}" (p. {node.page})
                      </div>
                    </div>
                  </div>
                </Html>
              )}
            </Float>
          </group>
        );
      })}
    </group>
  );
}
