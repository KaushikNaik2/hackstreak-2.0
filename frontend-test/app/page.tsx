"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Shield,
  Globe,
  Users,
  Brain,
  QrCode,
  ArrowRight,
  Heart,
  Zap,
  ChevronDown,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Real-Time Surveillance",
    description:
      "Interactive 3D disease mapping with live outbreak tracking across regions.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "Predictive Analytics",
    description:
      "AI-powered outbreak predictions and automated threat level alerts.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Patient Management",
    description:
      "Comprehensive patient records with searchable history and smart filters.",
    color: "from-emerald-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "3D Anatomy Viewer",
    description:
      "Interactive human body model mapping diagnoses to body regions visually.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: QrCode,
    title: "QR Code Records",
    description:
      "Generate and scan patient QR codes for instant offline record access.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "JWT-based authentication with role-based access for doctors and admins.",
    color: "from-indigo-500 to-purple-500",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "< 50ms", label: "Response" },
  { value: "256-bit", label: "Encryption" },
  { value: "24/7", label: "Monitoring" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* ── Navbar ──── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-outfit)] tracking-tight">
              Vitalix
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#cta" className="hover:text-white transition-colors">
              Get Started
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-5 py-2 rounded-lg transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ──── */}
      <section className="relative min-h-screen flex items-center justify-center gradient-mesh pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-1/3 w-48 h-48 bg-emerald-500/6 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-300 text-xs font-medium mb-8"
            >
              <Zap className="w-3.5 h-3.5" />
              Next-Generation Healthcare Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-outfit)] tracking-tight leading-tight mb-6"
            >
              <span className="text-white">Smart Health</span>
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Monitoring System
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Real-time disease surveillance, predictive outbreak analytics, and
              intelligent patient management — all in one{" "}
              <span className="text-teal-300">beautifully designed</span>{" "}
              platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="group flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-8 py-3.5 rounded-xl transition-all duration-300"
              >
                Sign In to Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5 text-slate-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ──── */}
      <section id="stats" className="py-20 border-t border-slate-800/50">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center py-6"
            >
              <div className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Section ──── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              A comprehensive suite of tools for modern healthcare professionals
              and administrators.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="group glass-card p-6 hover:border-teal-500/20 transition-all duration-500 cursor-default"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ──── */}
      <section id="cta" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative glass-card p-12 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
                Ready to Transform Healthcare?
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Join thousands of healthcare professionals using Vitalix to
                monitor and manage patient health more effectively.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/20"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──── */}
      <footer className="py-10 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-teal flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold font-[family-name:var(--font-outfit)]">
              Vitalix
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Vitalix Healthcare. Built for HackStreak 2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
