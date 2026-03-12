"use client";

import { ReactNode } from "react";
import DashboardLayout from "../dashboard/layout";

export default function PatientsLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
