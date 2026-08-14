"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "1 capital letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "1 number", test: (value: string) => /[0-9]/.test(value) },
  { label: "1 special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

async function ensureProfileRow(fallbackName?: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return;
  }

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProfile) {
    return;
  }

  const metadataName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const fullName = metadataName || fallbackName?.trim() || user.email || "New User";

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    throw insertError;
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        const { error: authError } = signInRes;

        if (authError) {
          throw authError;
        }

        await ensureProfileRow();
        window.location.assign("/dashboard");
        return;
      }

      const trimmedFullName = fullName.trim();

      if (!trimmedFullName) {
        throw new Error("Full name is required.");
      }

      const failedRequirements = PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(password));
      if (failedRequirements.length > 0) {
        throw new Error(`Password must include: ${failedRequirements.map((r) => r.label).join(", ")}.`);
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const signUpRes = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: trimmedFullName,
          },
        },
      });
      const { data, error: authError } = signUpRes;

      if (authError) {
        throw authError;
      }

      if (data.session) {
        await ensureProfileRow(trimmedFullName);
        window.location.assign("/dashboard");
        return;
      }

      setSuccess("Registration complete. Check your inbox to verify your email before signing in.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-border bg-card shadow-xl shadow-black/5">
      <CardHeader className="space-y-2 border-b border-border">
        <CardTitle className="text-2xl sm:text-3xl">{isLogin ? "Sign in" : "Create your account"}</CardTitle>
        <CardDescription className="text-lg sm:text-2xl">
          {isLogin
            ? "Access your expense dashboard with email and password."
            : "Register once, then track income and expenses from any device."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="full-name" className="text-lg sm:text-2xl">Full Name</Label>
              <Input
                id="full-name"
                autoComplete="name"
                maxLength={100}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
                className="h-12 rounded-xl px-4 text-lg sm:h-14 sm:text-2xl"
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-lg sm:text-2xl">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-xl px-4 text-lg sm:h-14 sm:text-2xl"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-lg sm:text-2xl">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={8}
              className="h-12 rounded-xl px-4 text-lg sm:h-14 sm:text-2xl"
              required
            />
            <p className="text-base sm:text-xl text-muted-foreground">Use at least 8 characters.</p>
            {!isLogin && (
              <ul className="grid gap-1.5 text-base sm:text-xl">
                {PASSWORD_REQUIREMENTS.map((requirement) => {
                  const passed = requirement.test(password);

                  return (
                    <li
                      key={requirement.label}
                      className={passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}
                    >
                      {passed ? "✓" : "○"} {requirement.label}
                    </li>
                  );
                })}
              </ul>
            )}
            {isLogin && (
              <Link href="/forgot-password" className="text-lg sm:text-xl text-muted-foreground underline underline-offset-2 hover:text-foreground">
                Forgot password?
              </Link>
            )}
          </div>

          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-lg sm:text-2xl">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-xl px-4 text-lg sm:h-14 sm:text-2xl"
                required
              />
            </div>
          )}

          {(error || success) && (
            <div
              className={`rounded-2xl border px-5 py-4 text-lg sm:text-xl ${
                error ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {error ?? success}
            </div>
          )}

          <Button type="submit" className="h-12 w-full rounded-full text-lg sm:h-14 sm:text-xl" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : isLogin ? "Sign in" : "Create account"}
          </Button>

          <p className="text-center text-lg sm:text-xl text-muted-foreground">
            {isLogin ? "No account yet?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/sign-up" : "/sign-in"}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {isLogin ? "Register" : "Sign in"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
