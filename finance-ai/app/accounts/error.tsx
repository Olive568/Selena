"use client";

import { RouteError } from "@/components/route-error";

export default function AccountsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="Accounts unavailable" description="We could not load your accounts. Please try again." reset={reset} />;
}
