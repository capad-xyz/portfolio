"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function Shard() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * 0.12;
    ref.current.rotation.y += dt * 0.18;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.5} floatIntensity={1.0}>
      <mesh ref={ref} scale={2.15}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          samples={6}
          resolution={256}
          thickness={0.85}
          roughness={0.06}
          transmission={1}
          ior={1.42}
          chromaticAberration={0.07}
          anisotropicBlur={0.3}
          distortion={0.3}
          distortionScale={0.4}
          temporalDistortion={0.15}
          color="#b3a0ff"
          attenuationColor="#7c5cff"
          attenuationDistance={2}
        />
      </mesh>
    </Float>
  );
}

/** The single WebGL surface — a refracting glass shard. Lazy-loaded, ssr:false. */
export default function GlassObject() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Shard />
      {/* Self-contained environment (no external HDRI) so it refracts capad's colors. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[-4, 2, 4]} scale={[6, 6, 1]} color="#7c5cff" />
        <Lightformer form="rect" intensity={1.6} position={[4, -2, 2]} scale={[6, 6, 1]} color="#36d1dc" />
        <Lightformer form="circle" intensity={3} position={[0, 4, -3]} scale={4} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
