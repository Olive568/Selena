"use client";

import dynamic from "next/dynamic";

import type { CategoryBreakdownItem } from "@/lib/finance";

type DashboardChartsShellProps = {
  categoryData: CategoryBreakdownItem[];
};

const DashboardCharts = dynamic(
  () => import("@/components/dashboard-charts").then((module) => module.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
        Loading charts...
      </div>
    ),
  }
);

export function DashboardChartsShell(props: DashboardChartsShellProps) {
  return <DashboardCharts {...props} />;
}
