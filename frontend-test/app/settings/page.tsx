"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { sidebarCollapsed } = useAppStore();
  const sidebarW = sidebarCollapsed ? 72 : 240;

  return (
    <motion.div
      style={{ marginLeft: sidebarW }}
      animate={{ marginLeft: sidebarW }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {[
          { icon: User, title: "Profile", desc: "Update your personal information and avatar" },
          { icon: Bell, title: "Notifications", desc: "Configure alert preferences and channels" },
          { icon: Shield, title: "Security", desc: "Manage passwords, 2FA, and session settings" },
          { icon: Palette, title: "Appearance", desc: "Theme, layout, and display preferences" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 flex items-center justify-between group cursor-pointer hover:border-teal-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                <item.icon className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
