import React from 'react';

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} color="#0d2438" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -5, -5]} intensity={2} color="#00e575" distance={30} />
      <pointLight position={[8, 8, -5]} intensity={2.5} color="#22d3ee" distance={35} />
      <pointLight position={[0, -10, 5]} intensity={1.8} color="#8b5cf6" distance={25} />
    </>
  );
}
