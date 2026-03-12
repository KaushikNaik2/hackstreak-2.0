"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Activity,
  FileText,
  Pill,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

const HumanAnatomy3D = dynamic(
  () => import("@/components/HumanAnatomy3D"),
  { ssr: false }
);

// Mock patient data
const mockPatient = {
  id: "P-001",
  name: "Aarav Sharma",
  age: 34,
  gender: "Male",
  dob: "1992-05-14",
  contact: "+91 98765 43210",
  address: "45 Mahatma Gandhi Road, Mumbai, Maharashtra 400001",
  emergency_contact: "+91 87654 32100",
  blood_type: "B+",
  allergies: ["Penicillin", "Sulfa Drugs"],
  status: "Active",
};

const mockDiagnoses = [
  {
    icd_code: "J18",
    diagnosis: "Pneumonia",
    severity: "high" as const,
    date: "2026-03-10",
    notes: "Community-acquired pneumonia, left lower lobe. Started on Azithromycin 500mg IV.",
  },
  {
    icd_code: "I10",
    diagnosis: "Hypertension",
    severity: "medium" as const,
    date: "2026-02-15",
    notes: "Stage 1 hypertension. Prescribed Amlodipine 5mg daily.",
  },
  {
    icd_code: "M54",
    diagnosis: "Lower Back Pain",
    severity: "low" as const,
    date: "2026-01-20",
    notes: "Chronic lower back pain. Physical therapy recommended.",
  },
  {
    icd_code: "K29",
    diagnosis: "Gastritis",
    severity: "low" as const,
    date: "2025-12-05",
    notes: "Mild gastritis. Pantoprazole 40mg for 4 weeks.",
  },
];

const mockVisits = [
  { date: "2026-03-10", reason: "Chest pain & cough", doctor: "Dr. Meera Iyer" },
  { date: "2026-02-15", reason: "BP follow-up", doctor: "Dr. Rajesh Kumar" },
  { date: "2026-01-20", reason: "Back pain consultation", doctor: "Dr. Sanjay Patel" },
  { date: "2025-12-05", reason: "Stomach discomfort", doctor: "Dr. Anita Sharma" },
];

const severityColors = {
  high: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export default function PatientDetailPage() {
  const params = useParams();
  const { sidebarCollapsed } = useAppStore();
  const sidebarW = sidebarCollapsed ? 72 : 240;
  const [selectedPart, setSelectedPart] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleBodyPartClick = (partId: string, partName: string) => {
    setSelectedPart({ id: partId, name: partName });
  };

  // Get diagnoses related to the selected body part
  const bodyPartIcdMap: Record<string, string[]> = {
    head: ["G43", "G40", "R51"],
    chest: ["J18", "J06", "J45"],
    heart: ["I10", "I25", "I50"],
    abdomen: ["K29", "K35", "K80"],
    liver: ["K70", "K75", "B15"],
    left_arm: ["M54", "M79"],
    right_arm: ["M54", "M79"],
    left_leg: ["M17", "M25"],
    right_leg: ["M17", "M25"],
    spine: ["M54", "M51", "M47"],
  };

  const relatedDiagnoses = selectedPart
    ? mockDiagnoses.filter((d) =>
        bodyPartIcdMap[selectedPart.id]?.some((code) =>
          d.icd_code.startsWith(code)
        )
      )
    : [];

  return (
    <motion.div
      style={{ marginLeft: sidebarW }}
      animate={{ marginLeft: sidebarW }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Back link + header */}
      <div className="flex items-center gap-4">
        <Link
          href="/patients"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
            {mockPatient.name}
          </h1>
          <p className="text-sm text-slate-400">
            {params.id} • {mockPatient.gender} • Age {mockPatient.age}
          </p>
        </div>
      </div>

      {/* Top Info Row */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "DOB", value: mockPatient.dob },
          { icon: Phone, label: "Contact", value: mockPatient.contact },
          { icon: Activity, label: "Blood Type", value: mockPatient.blood_type },
          { icon: MapPin, label: "Location", value: "Mumbai, MH" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">{item.label}</p>
              <p className="text-sm text-white font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: 3D Anatomy + Details */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* 3D Anatomy Model */}
        <div className="lg:col-span-3 glass-card p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
              3D Medical Visualization
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400" /> Low
              </span>
            </div>
          </div>
          <div className="h-[450px]">
            <HumanAnatomy3D
              diagnoses={mockDiagnoses}
              onBodyPartClick={handleBodyPartClick}
            />
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            Click on highlighted body parts to view diagnosis details
          </p>
        </div>

        {/* Side panel: selected part details or diagnosis list */}
        <div className="lg:col-span-2 space-y-5">
          {/* Selected Body Part Panel */}
          <AnimatePresence mode="wait">
            {selectedPart && (
              <motion.div
                key={selectedPart.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                    {selectedPart.name}
                  </h3>
                  <button
                    onClick={() => setSelectedPart(null)}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {relatedDiagnoses.length > 0 ? (
                  <div className="space-y-3">
                    {relatedDiagnoses.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/20"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-white">
                            {d.diagnosis}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              severityColors[d.severity]
                            }`}
                          >
                            {d.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{d.notes}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="font-mono">{d.icd_code}</span>
                          <span>•</span>
                          <span>{d.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No diagnoses for this region</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Diagnoses */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)] mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-400" />
              Active Diagnoses
            </h3>
            <div className="space-y-2">
              {mockDiagnoses.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        d.severity === "high"
                          ? "bg-rose-500"
                          : d.severity === "medium"
                          ? "bg-amber-500"
                          : "bg-teal-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm text-white">{d.diagnosis}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {d.icd_code}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visit History */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Visit History
            </h3>
            <div className="space-y-3">
              {mockVisits.map((v, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5" />
                    {i < mockVisits.length - 1 && (
                      <div className="w-px h-8 bg-slate-700/30 mt-1" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{v.reason}</p>
                    <p className="text-[10px] text-slate-500">
                      {v.date} • {v.doctor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
