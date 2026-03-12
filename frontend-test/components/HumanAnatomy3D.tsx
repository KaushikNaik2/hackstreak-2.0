"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Body part definitions with position and health data mapping
interface BodyPart {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number]; // scale x, y, z for capsule/sphere
  type: "sphere" | "capsule";
  rotation?: [number, number, number];
  icdCodes: string[];
}

const bodyParts: BodyPart[] = [
  { id: "head", name: "Head & Brain", position: [0, 2.8, 0], size: [0.35, 0.35, 0.35], type: "sphere", icdCodes: ["G43", "G40", "R51"] },
  { id: "chest", name: "Chest & Lungs", position: [0, 1.6, 0], size: [0.55, 0.6, 0.3], type: "capsule", icdCodes: ["J18", "J06", "J45"] },
  { id: "heart", name: "Heart", position: [0.15, 1.8, 0.15], size: [0.15, 0.15, 0.15], type: "sphere", icdCodes: ["I10", "I25", "I50"] },
  { id: "abdomen", name: "Abdomen & Stomach", position: [0, 0.8, 0], size: [0.5, 0.5, 0.28], type: "capsule", icdCodes: ["K29", "K35", "K80"] },
  { id: "liver", name: "Liver", position: [0.25, 1.0, 0.1], size: [0.2, 0.15, 0.12], type: "sphere", icdCodes: ["K70", "K75", "B15"] },
  { id: "left_arm", name: "Left Arm", position: [-0.85, 1.4, 0], size: [0.12, 0.5, 0.12], type: "capsule", rotation: [0, 0, 0.15], icdCodes: ["M54", "M79"] },
  { id: "right_arm", name: "Right Arm", position: [0.85, 1.4, 0], size: [0.12, 0.5, 0.12], type: "capsule", rotation: [0, 0, -0.15], icdCodes: ["M54", "M79"] },
  { id: "left_leg", name: "Left Leg", position: [-0.25, -0.5, 0], size: [0.15, 0.7, 0.15], type: "capsule", icdCodes: ["M17", "M25"] },
  { id: "right_leg", name: "Right Leg", position: [0.25, -0.5, 0], size: [0.15, 0.7, 0.15], type: "capsule", icdCodes: ["M17", "M25"] },
  { id: "spine", name: "Spine & Back", position: [0, 1.2, -0.2], size: [0.1, 1.0, 0.1], type: "capsule", icdCodes: ["M54", "M51", "M47"] },
];

interface DiagnosisData {
  icd_code: string;
  diagnosis: string;
  severity: "low" | "medium" | "high";
  date: string;
  notes: string;
}

interface Props {
  diagnoses?: DiagnosisData[];
  onBodyPartClick?: (partId: string, partName: string) => void;
}

function BodyPartMesh({
  part,
  isAffected,
  severity,
  isHovered,
  onHover,
  onClick,
}: {
  part: BodyPart;
  isAffected: boolean;
  severity: string;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const color = isAffected
    ? severity === "high"
      ? "#f43f5e"
      : severity === "medium"
      ? "#f59e0b"
      : "#22d3ee"
    : "#0e7490";

  const emissiveIntensity = isHovered ? 0.4 : isAffected ? 0.2 : 0;

  useFrame((_, delta) => {
    if (meshRef.current && isAffected) {
      meshRef.current.scale.x = part.size[0] * (1 + Math.sin(Date.now() * 0.003) * 0.03);
      meshRef.current.scale.y = part.size[1] * (1 + Math.sin(Date.now() * 0.003) * 0.03);
      meshRef.current.scale.z = part.size[2] * (1 + Math.sin(Date.now() * 0.003) * 0.03);
    }
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(true);
      document.body.style.cursor = "pointer";
    },
    [onHover]
  );

  const handlePointerOut = useCallback(() => {
    onHover(false);
    document.body.style.cursor = "default";
  }, [onHover]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  return (
    <mesh
      ref={meshRef}
      position={part.position}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.size}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {part.type === "sphere" ? (
        <sphereGeometry args={[1, 16, 16]} />
      ) : (
        <capsuleGeometry args={[1, 1, 8, 16]} />
      )}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={isHovered ? 0.85 : isAffected ? 0.7 : 0.3}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        wireframe={!isAffected && !isHovered}
      />
    </mesh>
  );
}

function HumanBody({
  diagnoses = [],
  onPartClick,
}: {
  diagnoses: DiagnosisData[];
  onPartClick: (partId: string, partName: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(Date.now() * 0.0005) * 0.15;
    }
  });

  const getPartSeverity = (part: BodyPart) => {
    const matchingDiagnoses = diagnoses.filter((d) =>
      part.icdCodes.some((code) => d.icd_code.startsWith(code))
    );
    if (matchingDiagnoses.length === 0) return { affected: false, severity: "low" };
    const maxSeverity = matchingDiagnoses.reduce((max, d) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[d.severity] > order[max as keyof typeof order]
        ? d.severity
        : max;
    }, "low");
    return { affected: true, severity: maxSeverity };
  };

  return (
    <group ref={groupRef}>
      {/* Vertical guide line */}
      <mesh position={[0, 1.2, -0.25]}>
        <cylinderGeometry args={[0.005, 0.005, 5, 8]} />
        <meshBasicMaterial color="#0e7490" transparent opacity={0.1} />
      </mesh>

      {bodyParts.map((part) => {
        const { affected, severity } = getPartSeverity(part);
        return (
          <BodyPartMesh
            key={part.id}
            part={part}
            isAffected={affected}
            severity={severity}
            isHovered={hoveredPart === part.id}
            onHover={(h) => setHoveredPart(h ? part.id : null)}
            onClick={() => onPartClick(part.id, part.name)}
          />
        );
      })}
    </group>
  );
}

export default function HumanAnatomy3D({ diagnoses = [], onBodyPartClick }: Props) {
  const handlePartClick = useCallback(
    (partId: string, partName: string) => {
      onBodyPartClick?.(partId, partName);
    },
    [onBodyPartClick]
  );

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 5, 3]} intensity={0.8} />
        <pointLight position={[-3, 2, 3]} intensity={0.3} color="#22d3ee" />
        <HumanBody diagnoses={diagnoses} onPartClick={handlePartClick} />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={3}
          maxDistance={7}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
