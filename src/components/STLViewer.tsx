import React, { Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const geom = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} geometry={geom}>
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

export function STLViewer({ url }: { url: string }) {
  return (
    <div className="w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Center>
              <Model url={url} />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
