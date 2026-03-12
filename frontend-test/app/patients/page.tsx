"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  User,
} from "lucide-react";

const mockPatients = [
  { id: "P-001", name: "Aarav Sharma", age: 34, gender: "Male", condition: "Dengue", status: "Active", lastVisit: "2026-03-10", contact: "+91 98765 43210" },
  { id: "P-002", name: "Priya Patel", age: 28, gender: "Female", condition: "Influenza A", status: "Recovered", lastVisit: "2026-03-08", contact: "+91 87654 32109" },
  { id: "P-003", name: "Rohan Kumar", age: 45, gender: "Male", condition: "COVID-19", status: "Active", lastVisit: "2026-03-11", contact: "+91 76543 21098" },
  { id: "P-004", name: "Ananya Singh", age: 22, gender: "Female", condition: "Malaria", status: "Under Observation", lastVisit: "2026-03-09", contact: "+91 65432 10987" },
  { id: "P-005", name: "Vikram Reddy", age: 31, gender: "Male", condition: "Typhoid", status: "Recovered", lastVisit: "2026-03-07", contact: "+91 54321 09876" },
  { id: "P-006", name: "Sneha Gupta", age: 39, gender: "Female", condition: "Tuberculosis", status: "Active", lastVisit: "2026-03-11", contact: "+91 43210 98765" },
  { id: "P-007", name: "Arjun Nair", age: 52, gender: "Male", condition: "Hepatitis B", status: "Under Observation", lastVisit: "2026-03-06", contact: "+91 32109 87654" },
  { id: "P-008", name: "Kavya Deshmukh", age: 26, gender: "Female", condition: "Chikungunya", status: "Recovered", lastVisit: "2026-03-05", contact: "+91 21098 76543" },
];

const statusColors: Record<string, string> = {
  Active: "bg-teal-500/20 text-teal-400",
  Recovered: "bg-emerald-500/20 text-emerald-400",
  "Under Observation": "bg-amber-500/20 text-amber-400",
};

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { sidebarCollapsed } = useAppStore();
  const sidebarW = sidebarCollapsed ? 72 : 240;

  const filtered = mockPatients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      style={{ marginLeft: sidebarW }}
      animate={{ marginLeft: sidebarW }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
            Patients
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and monitor patient records
          </p>
        </div>
        <Link
          href="/patients/register"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500
                     text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/10"
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, ID, or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/30 border border-slate-700/30 text-white text-sm rounded-lg pl-10 pr-3 py-2.5 outline-none focus:border-teal-500/30 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {["all", "Active", "Recovered", "Under Observation"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                filter === f
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:border-slate-600/30"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/20">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  Patient
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  ID
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Condition
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                  Last Visit
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-800/20 hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-teal-300">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {p.gender} • Age {p.age}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400 font-mono">
                      {p.id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-300">
                      {p.condition}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-slate-500">
                      {p.lastVisit}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full ${statusColors[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/patients/${p.id}`}
                      className="text-slate-500 hover:text-teal-400 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <User className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No patients found</p>
            <p className="text-xs text-slate-600 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
