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
        console.log("supabase signInWithPassword response:", signInRes);
        const { error: authError } = signInRes;

        if (authError) {
          throw authError;
        }

        await ensureProfileRow();
        window.location.assign("/");
        return;
      }

      const trimmedFullName = fullName.trim();

      if (!trimmedFullName) {
        throw new Error("Full name is required.");
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
      console.log("supabase signUp response:", signUpRes);
      const { data, error: authError } = signUpRes;

      if (authError) {
        throw authError;
      }

      if (data.session) {
        await ensureProfileRow(trimmedFullName);
        window.location.assign("/");
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
        <CardTitle>{isLogin ? "Sign in" : "Create your account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Access your expense dashboard with email and password."
            : "Register once, then track income and expenses from any device."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">Use at least 6 characters.</p>
          </div>

          {(error || success) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                error ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {error ?? success}
            </div>
          )}

          <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : isLogin ? "Sign in" : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "No account yet?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
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
