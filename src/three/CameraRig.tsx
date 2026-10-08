import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from './useSceneStore';

export function CameraRig() {
  const { currentSection, prefersReducedMotion } = useSceneStore();
  const mousePos = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let targetZ = 12;

    switch (currentSection) {
      case 'hero':
        targetX = mousePos.current.x * 1.5;
        targetY = -mousePos.current.y * 1.2;
        targetZ = 12;
        break;
      case 'story':
        targetX = mousePos.current.x * 0.8;
        targetY = -mousePos.current.y * 0.8;
        targetZ = 14;
        break;
      case 'graph':
        targetX = mousePos.current.x * 2.0;
        targetY = -mousePos.current.y * 1.5;
        targetZ = 10;
        break;
      case 'patient':
        targetX = mousePos.current.x * 0.5;
        targetY = -mousePos.current.y * 0.5;
        targetZ = 13;
        break;
      case 'doctor':
        targetX = mousePos.current.x * 0.5;
        targetY = -mousePos.current.y * 0.5;
        targetZ = 13;
        break;
      default:
        targetZ = 12;
    }

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 3.5, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 3.5, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 3.5, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}
