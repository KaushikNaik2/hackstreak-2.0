"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  Shield,
  QrCode,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function RegisterPatientPage() {
  const { sidebarCollapsed } = useAppStore();
  const sidebarW = sidebarCollapsed ? 72 : 240;

  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    contact: "",
    address: "",
    emergency_contact: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const update = (key: string, val: string) =>
    setForm({ ...form, [key]: val });

  if (submitted) {
    return (
      <motion.div
        style={{ marginLeft: sidebarW }}
        animate={{ marginLeft: sidebarW }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center py-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white mb-2">
            Patient Registered!
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            {form.full_name} has been successfully registered in the system.
          </p>

          {/* QR Code placeholder */}
          <div className="glass-card p-8 max-w-xs mx-auto mb-6">
            <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                <QrCode className="w-20 h-20 text-teal-400 opacity-60" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Patient QR Code — ID: P-{Math.random().toString(36).substring(2, 6).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <a
              href="/patients"
              className="text-sm text-slate-400 hover:text-white border border-slate-700 px-5 py-2 rounded-lg transition-all"
            >
              View All Patients
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  full_name: "",
                  date_of_birth: "",
                  gender: "",
                  contact: "",
                  address: "",
                  emergency_contact: "",
                });
              }}
              className="text-sm bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-2 rounded-lg transition-all"
            >
              Register Another
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ marginLeft: sidebarW }}
      animate={{ marginLeft: sidebarW }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
          Register Patient
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add a new patient to the system
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Full Name *
            </label>
            <input
              required
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Patient full legal name"
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* DOB */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={form.date_of_birth}
                onChange={(e) => update("date_of_birth", e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update("gender", g)}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      form.gender === g
                        ? "border-teal-500/50 bg-teal-500/10 text-teal-300"
                        : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Contact Number *
            </label>
            <input
              required
              value={form.contact}
              onChange={(e) => update("contact", e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Full address (optional)"
              rows={2}
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Emergency Contact
            </label>
            <input
              value={form.emergency_contact}
              onChange={(e) => update("emergency_contact", e.target.value)}
              placeholder="Emergency contact number (optional)"
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 
                       hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 
                       text-white text-sm font-semibold rounded-lg py-3 
                       transition-all duration-300 shadow-lg shadow-teal-500/10"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Register & Generate QR Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
