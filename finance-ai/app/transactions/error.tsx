"use client";

import { RouteError } from "@/components/route-error";

export default function TransactionsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="Transactions unavailable" description="We could not load your transactions. Please try again." reset={reset} />;
}
