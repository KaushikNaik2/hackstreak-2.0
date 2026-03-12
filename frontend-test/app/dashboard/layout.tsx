"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/lib/store";
import {
  Activity,
  LayoutDashboard,
  Users,
  ScanLine,
  Settings,
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/scan", label: "QR Scanner", icon: ScanLine },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] flex">
      {/* ── Sidebar ──── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-40 glass-sidebar"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-slate-800/30">
          <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-base font-bold font-[family-name:var(--font-outfit)] text-white whitespace-nowrap overflow-hidden"
              >
                Vitalix
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group
                  ${
                    isActive
                      ? "text-teal-300 bg-teal-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-teal-400"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-slate-800/30">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/40 transition-all"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile sidebar overlay ──── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-[240px] z-50 glass-sidebar md:hidden"
            >
              <div className="flex items-center gap-2.5 px-4 h-16 border-b border-slate-800/30">
                <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-bold font-[family-name:var(--font-outfit)] text-white">
                  Vitalix
                </span>
              </div>
              <nav className="py-4 px-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${
                          isActive
                            ? "text-teal-300 bg-teal-500/10"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ──── */}
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-screen md:ml-0 w-full"
        style={{ marginLeft: 0 }}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 glass flex items-center justify-between px-6 border-b border-slate-800/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search patients, records..."
                className="w-64 bg-slate-800/30 border border-slate-700/30 text-white text-sm 
                           rounded-lg pl-10 pr-3 py-2 outline-none 
                           focus:border-teal-500/30 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "Loading..."}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                {(user?.full_name || "U")[0].toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </motion.div>
    </div>
  );
}
