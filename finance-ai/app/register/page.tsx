import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-center gap-4 rounded-[2rem] border border-border bg-card p-6 text-card-foreground shadow-2xl shadow-black/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Selena</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">A simple money tracker for Phase 1.</h1>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground">
              Create an account to track transactions, compare monthly activity, and keep everything private per user.
              Your profile row is created automatically from your Supabase Auth ID and full name.
            </p>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {[
                { title: "Secure", body: "Supabase Auth backed." },
                { title: "Fast", body: "Mobile-first and clean." },
                { title: "Flexible", body: "Expense and income support." },
              ].map((item) => (
                <Card key={item.title} className="border-border bg-background/40 text-card-foreground">
                  <CardHeader className="px-4 pt-4">
                    <CardTitle className="text-sm text-card-foreground">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-sm text-muted-foreground">{item.body}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <AuthForm mode="register" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
