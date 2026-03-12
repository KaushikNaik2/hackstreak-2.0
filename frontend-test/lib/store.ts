"use client";
import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "success";
  timestamp: Date;
  read: boolean;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  activePatientId: null,
  setActivePatientId: (id) => set({ activePatientId: id }),
  notifications: [],
  addNotification: (n) =>
    set((s) => ({ notifications: [n, ...s.notifications] })),
  clearNotifications: () => set({ notifications: [] }),
}));
