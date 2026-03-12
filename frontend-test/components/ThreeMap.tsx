"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Disease hotspot data points (lat, lon, severity, label)
const hotspots = [
  { lat: 19.076, lon: 72.877, severity: 0.9, label: "Mumbai", cases: 847 },
  { lat: 28.613, lon: 77.209, severity: 0.7, label: "Delhi", cases: 523 },
  { lat: 13.082, lon: 80.270, severity: 0.5, label: "Chennai", cases: 312 },
  { lat: 22.572, lon: 88.363, severity: 0.6, label: "Kolkata", cases: 401 },
  { lat: 12.971, lon: 77.594, severity: 0.4, label: "Bangalore", cases: 234 },
  { lat: 23.022, lon: 72.571, severity: 0.3, label: "Ahmedabad", cases: 156 },
  { lat: 26.846, lon: 80.946, severity: 0.8, label: "Lucknow", cases: 678 },
  { lat: 51.507, lon: -0.127, severity: 0.4, label: "London", cases: 290 },
  { lat: 40.712, lon: -74.006, severity: 0.6, label: "New York", cases: 510 },
  { lat: -33.868, lon: 151.209, severity: 0.3, label: "Sydney", cases: 120 },
  { lat: 35.689, lon: 139.691, severity: 0.5, label: "Tokyo", cases: 380 },
  { lat: -23.550, lon: -46.633, severity: 0.7, label: "São Paulo", cases: 620 },
];

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe() {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08;
    }
  });

  // Create wireframe sphere geometry
  const wireframeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2, 36, 18);
  }, []);

  return (
    <group ref={globeRef}>
      {/* Globe wireframe */}
      <mesh geometry={wireframeGeometry}>
        <meshBasicMaterial
          color="#0e7490"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Solid inner sphere with slight glow */}
      <mesh>
        <sphereGeometry args={[1.98, 36, 18]} />
        <meshBasicMaterial
          color="#030712"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.15, 36, 18]} />
        <meshBasicMaterial
          color="#0891b2"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Hotspot markers */}
      {hotspots.map((spot, i) => {
        const pos = latLonToVec3(spot.lat, spot.lon, 2.02);
        const pulsePos = latLonToVec3(spot.lat, spot.lon, 2.01);
        const color = new THREE.Color().setHSL(
          0.5 - spot.severity * 0.15,
          0.8,
          0.5
        );

        return (
          <group key={i}>
            {/* Core marker */}
            <mesh position={pos}>
              <sphereGeometry args={[0.03 + spot.severity * 0.02, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* Glow ring */}
            <mesh position={pulsePos}>
              <sphereGeometry args={[0.06 + spot.severity * 0.04, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.25}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color="#22d3ee"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function ThreeMap() {
  return (
    <div className="w-full h-full min-h-[320px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        <Globe />
        <Particles />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
          autoRotate={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
