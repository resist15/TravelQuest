"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Suspense } from "react";

function Earth() {
  const [colorMap] = useTexture([
    "https://rawcdn.githack.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg"
  ]);

  return (
    <mesh rotation={[0, 0, 0]}>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
}

export default function ThreeGlobeBackground() {
  return (
    <div className="fixed inset-0 z-0 w-screen h-screen">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        className="!w-full !h-full" // Important: Force full canvas size
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}

