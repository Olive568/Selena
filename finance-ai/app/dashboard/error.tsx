"use client";

import { RouteError } from "@/components/route-error";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="Dashboard unavailable" description="We could not load your financial dashboard. Please try again." reset={reset} />;
}
