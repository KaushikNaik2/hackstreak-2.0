"use client";

import { ReactNode } from "react";
import DashboardLayout from "../dashboard/layout";

export default function ScanLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
