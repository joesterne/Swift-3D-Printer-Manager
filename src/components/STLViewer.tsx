import React, { Suspense, useRef, memo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

const Model = memo(function Model({ url }: { url: string }) {
  const geom = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} geometry={geom}>
      <meshStandardMaterial color="#3b82f6" roughness={0.35} metalness={0.15} />
    </mesh>
  );
});

export const STLViewer = memo(function STLViewer({ url }: { url: string }) {
  return (
    <div className="w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <Canvas 
        frameloop="demand" 
        camera={{ position: [0, 0, 150], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: true }}
      >
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
            Loading 3D Model...
          </div>
        }>
          <Stage environment="city" intensity={0.6}>
            <Center>
              <Model url={url} />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Canvas>
    </div>
  );
});

