import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/marketing/auth-shell";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Create account — Selena",
  description: "Create your free Selena account.",
};

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Start tracking your money today."
      subtitle="Create a free account to track income and expenses, then get AI-powered financial insights from any device."
      highlights={[
        { title: "Free", body: "No credit card required." },
        { title: "Fast", body: "Set up in under a minute." },
        { title: "Secure", body: "Supabase Auth + RLS." },
      ]}
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
