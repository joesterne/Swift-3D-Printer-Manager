import React, { Suspense, useRef, useState, useEffect, memo } from 'react';
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

// Renders nothing in the scene; it only mounts once the Suspense boundary's
// content does — i.e. after the suspending Model has loaded — and reports
// that back so the HTML loading overlay can hide.
function LoadedSignal({ onLoad }: { onLoad: () => void }) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);
  return null;
}

export const STLViewer = memo(function STLViewer({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [url]);

  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 150], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: true }}
      >
        {/* fallback must be null: the old fallback was an HTML <div> inside
            the Canvas tree, where react-three-fiber tries to instantiate it
            as a THREE object and the loading state errors instead of
            rendering. The loading UI is the HTML overlay below. */}
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Center>
              <Model url={url} />
            </Center>
          </Stage>
          <LoadedSignal onLoad={() => setLoaded(true)} />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Canvas>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm pointer-events-none">
          Loading 3D Model...
        </div>
      )}
    </div>
  );
});
