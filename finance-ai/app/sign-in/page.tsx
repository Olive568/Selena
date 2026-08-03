import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/marketing/auth-shell";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Sign in — Selena",
  description: "Sign in to your Selena account.",
};

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to manage transactions, watch category spending, and keep your dashboard synced in real time."
      highlights={[
        { title: "Income", body: "View inflows fast." },
        { title: "Expenses", body: "See where money goes." },
        { title: "AI Insights", body: "Understand your habits." },
      ]}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}