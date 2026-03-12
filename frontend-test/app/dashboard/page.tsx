"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Activity,
  HeartPulse,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import dynamic from "next/dynamic";

const ThreeMap = dynamic(() => import("@/components/ThreeMap"), { ssr: false });

// ── Mock Data ────────────────────────────────────────────────────────────────
const metrics = [
  {
    title: "Active Cases",
    value: "2,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: Activity,
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10",
  },
  {
    title: "Patients Monitored",
    value: "14,239",
    change: "+3.2%",
    trend: "up" as const,
    icon: Users,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Threat Alerts",
    value: "23",
    change: "-8.1%",
    trend: "down" as const,
    icon: AlertTriangle,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Recovery Rate",
    value: "94.7%",
    change: "+1.3%",
    trend: "up" as const,
    icon: HeartPulse,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
];

const alerts = [
  {
    id: 1,
    title: "Influenza Outbreak — Mumbai Region",
    severity: "critical",
    time: "12 min ago",
    location: "Maharashtra",
  },
  {
    id: 2,
    title: "Dengue Cases Spike Detected",
    severity: "warning",
    time: "1h ago",
    location: "Kerala",
  },
  {
    id: 3,
    title: "COVID-19 Variant Surveillance Update",
    severity: "info",
    time: "3h ago",
    location: "National",
  },
  {
    id: 4,
    title: "Malaria Risk Zone Expansion",
    severity: "warning",
    time: "5h ago",
    location: "Rajasthan",
  },
];

const recentPatients = [
  { id: "P-001", name: "Aarav Sharma", condition: "Dengue", status: "Active", age: 34 },
  { id: "P-002", name: "Priya Patel", condition: "Influenza A", status: "Recovered", age: 28 },
  { id: "P-003", name: "Rohan Kumar", condition: "COVID-19", status: "Active", age: 45 },
  { id: "P-004", name: "Ananya Singh", condition: "Malaria", status: "Under Observation", age: 22 },
  { id: "P-005", name: "Vikram Reddy", condition: "Typhoid", status: "Recovered", age: 31 },
];

const outbreakData = [
  { month: "Jul", cases: 120, predictions: 110 },
  { month: "Aug", cases: 180, predictions: 160 },
  { month: "Sep", cases: 250, predictions: 230 },
  { month: "Oct", cases: 310, predictions: 350 },
  { month: "Nov", cases: 280, predictions: 300 },
  { month: "Dec", cases: 420, predictions: 400 },
  { month: "Jan", cases: 390, predictions: 450 },
  { month: "Feb", cases: 350, predictions: 380 },
  { month: "Mar", cases: null, predictions: 420 },
];

const severityColors: Record<string, string> = {
  critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  info: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

const statusColors: Record<string, string> = {
  Active: "bg-teal-500/20 text-teal-400",
  Recovered: "bg-emerald-500/20 text-emerald-400",
  "Under Observation": "bg-amber-500/20 text-amber-400",
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { sidebarCollapsed } = useAppStore();
  const sidebarW = sidebarCollapsed ? 72 : 240;

  return (
    <motion.div
      style={{ marginLeft: sidebarW }}
      animate={{ marginLeft: sidebarW }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
          Surveillance Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time healthcare monitoring and outbreak intelligence
        </p>
      </motion.div>

      {/* ── Metrics Grid ──── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((m) => (
          <motion.div
            key={m.title}
            variants={fadeUp}
            className="glass-card p-5 hover:border-slate-700/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <m.icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  m.trend === "up" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {m.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
              {m.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{m.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Content Grid ──── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* 3D Globe Map — spans 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-3 glass-card p-5 min-h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                Disease Surveillance Map
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Global outbreak hotspot tracking
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs text-teal-400">Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse ml-1" />
            </div>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden bg-slate-900/50 min-h-[320px]">
            <ThreeMap />
          </div>
        </motion.div>

        {/* Alerts panel — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 glass-card p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                Threat Alerts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated surveillance notifications
              </p>
            </div>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/20 hover:border-slate-600/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white font-medium leading-tight">
                    {alert.title}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      severityColors[alert.severity]
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-500">
                    {alert.location}
                  </span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] text-slate-500">
                    {alert.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row ──── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Outbreak Chart — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-3 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                Outbreak Predictions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Actual vs. predicted case counts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/50 border border-cyan-400" />
                Predicted
              </span>
            </div>
          </div>

          {/* Simple SVG chart */}
          <div className="h-48 relative">
            <svg
              viewBox="0 0 400 160"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0, 40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="rgba(148,163,184,0.06)"
                  strokeWidth="1"
                />
              ))}

              {/* Actual cases area */}
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Actual area fill */}
              <path
                d={`M0,${160 - (120 / 450) * 160} ${outbreakData
                  .slice(0, 8)
                  .map(
                    (d, i) =>
                      `L${(i / 7) * 400},${160 - ((d.cases || 0) / 450) * 160}`
                  )
                  .join(" ")} L${400},160 L0,160 Z`}
                fill="url(#tealGrad)"
              />
              {/* Actual line */}
              <path
                d={`M0,${160 - (120 / 450) * 160} ${outbreakData
                  .slice(0, 8)
                  .map(
                    (d, i) =>
                      `L${(i / 7) * 400},${160 - ((d.cases || 0) / 450) * 160}`
                  )
                  .join(" ")}`}
                fill="none"
                stroke="#0891b2"
                strokeWidth="2"
              />

              {/* Prediction line (dashed) */}
              <path
                d={`M0,${160 - (110 / 450) * 160} ${outbreakData
                  .map(
                    (d, i) =>
                      `L${(i / 8) * 400},${160 - (d.predictions / 450) * 160}`
                  )
                  .join(" ")}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Data points */}
              {outbreakData.slice(0, 8).map((d, i) => (
                <circle
                  key={i}
                  cx={(i / 7) * 400}
                  cy={160 - ((d.cases || 0) / 450) * 160}
                  r="3"
                  fill="#0891b2"
                  stroke="#030712"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-1">
              {outbreakData.map((d) => (
                <span key={d.month} className="text-[10px] text-slate-600">
                  {d.month}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Patients — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                Recent Patients
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest registered patients
              </p>
            </div>
            <a
              href="/patients"
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {recentPatients.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-teal-300">
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {p.id} • Age {p.age} • {p.condition}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[p.status]}`}
                >
                  {p.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
