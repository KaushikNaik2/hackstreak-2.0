"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  ScanLine,
  Camera,
  CameraOff,
  User,
  Activity,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// Mock decoded patient data
const mockDecodedPatient = {
  id: "P-003",
  name: "Rohan Kumar",
  age: 45,
  gender: "Male",
  blood_type: "O+",
  conditions: ["COVID-19", "Hypertension"],
  lastVisit: "2026-03-11",
  allergies: ["None"],
  prescriptions: [
    { drug: "Remdesivir 100mg IV", frequency: "Daily", duration: "5 days" },
    { drug: "Dexamethasone 6mg", frequency: "Once daily", duration: "10 days" },
    { drug: "Amlodipine 5mg", frequency: "Once daily", duration: "Ongoing" },
  ],
};

export default function ScanPage() {
  const { sidebarCollapsed } = useAppStore();
  const sidebarW = sidebarCollapsed ? 72 : 240;
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);

      // Simulate scanning after 3 seconds
      setTimeout(() => {
        stopCamera();
        setScanned(true);
      }, 3000);
    } catch {
      setError("Camera access denied or not available. Using demo mode.");
      // Demo mode — show result after delay
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setScanned(true);
      }, 2000);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const reset = () => {
    stopCamera();
    setScanned(false);
    setError("");
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <motion.div
      style={{ marginLeft: sidebarW }}
      animate={{ marginLeft: sidebarW }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
          QR Code Scanner
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scan patient QR codes for instant record access
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanner Panel */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
              Scanner
            </h2>
            {scanning && (
              <span className="flex items-center gap-1.5 text-xs text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Scanning...
              </span>
            )}
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-900/80 aspect-square max-h-[400px] flex items-center justify-center">
            {scanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-teal-400/50 rounded-2xl relative">
                    {/* Corner markers */}
                    <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg" />
                    <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
                    {/* Scan line */}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </div>
              </>
            ) : scanned ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-sm text-white font-medium">
                  QR Code Decoded
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Patient record loaded
                </p>
              </motion.div>
            ) : (
              <div className="text-center p-8">
                <ScanLine className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-sm text-slate-400">
                  Position QR code in front of camera
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Or use demo mode to see a sample result
                </p>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex gap-3 mt-4">
            {!scanned ? (
              <button
                onClick={scanning ? stopCamera : startCamera}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 ${
                  scanning
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/10"
                }`}
              >
                {scanning ? (
                  <>
                    <CameraOff className="w-4 h-4" />
                    Stop Scanner
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Start Scanner
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/30 hover:border-slate-600/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Scan Another
              </button>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <AnimatePresence>
          {scanned && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Patient Info Card */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  Patient Information
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center text-lg font-bold text-teal-300">
                    {mockDecodedPatient.name[0]}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {mockDecodedPatient.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {mockDecodedPatient.id} •{" "}
                      {mockDecodedPatient.gender} • Age{" "}
                      {mockDecodedPatient.age} • {mockDecodedPatient.blood_type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800/30">
                    <p className="text-[10px] text-slate-500 uppercase">
                      Conditions
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mockDecodedPatient.conditions.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/30">
                    <p className="text-[10px] text-slate-500 uppercase">
                      Last Visit
                    </p>
                    <p className="text-sm text-white mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {mockDecodedPatient.lastVisit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescriptions */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  Active Prescriptions
                </h3>
                <div className="space-y-2">
                  {mockDecodedPatient.prescriptions.map((rx, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/20"
                    >
                      <p className="text-sm text-white font-medium">
                        {rx.drug}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span>{rx.frequency}</span>
                        <span>•</span>
                        <span>{rx.duration}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)] mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`/patients/${mockDecodedPatient.id}`}
                    className="text-xs text-center py-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                  >
                    View Full Record
                  </a>
                  <button className="text-xs py-2.5 rounded-lg bg-slate-800/30 text-slate-400 border border-slate-700/20 hover:border-slate-600/30 transition-all">
                    Print Summary
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!scanned && (
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <ScanLine className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)] mb-1">
              No data yet
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Scan a patient QR code to instantly access their medical records,
              prescriptions, and visit history — even offline.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
