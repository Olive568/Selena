"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight, Coins, Landmark, Loader2, Plus, Sparkles, Wallet } from "lucide-react";

import { SelenaIcon } from "@/components/selena-icon";
import type { DashboardAccount } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const ONBOARDING_KEY = "selena-onboarding-done";

type NewUserOnboardingProps = {
  accounts: DashboardAccount[];
  userId: string;
  onAddTransaction: (transactionType: "expense" | "income") => void;
  onDismiss: () => void;
};

const steps = [
  { icon: Sparkles, title: "Welcome to Selena" },
  { icon: Landmark, title: "Your accounts" },
  { icon: Plus, title: "First transaction" },
  { icon: Check, title: "Explore" },
];

export function NewUserOnboarding({ accounts, userId, onAddTransaction, onDismiss }: NewUserOnboardingProps) {
  const [step, setStep] = useState(0);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isSavingBalances, setIsSavingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        localStorage.setItem(ONBOARDING_KEY, "true");
        onDismiss();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  function finish(currentStep: number) {
    if (currentStep < steps.length - 1) {
      setStep(currentStep + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, "true");
      onDismiss();
    }
  }

  function skip() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onDismiss();
  }

  async function saveBalances() {
    const entries = Object.entries(balances).filter(([, value]) => {
      const num = Number(value);
      return Number.isFinite(num) && num > 0;
    });

    if (entries.length === 0) {
      finish(1);
      return;
    }

    setIsSavingBalances(true);

    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const { error } = await supabase.from("transactions").insert(
        entries.map(([accountId, value]) => {
          const account = accounts.find((a) => a.id === accountId);
          return {
            user_id: userId,
            merchant: "Initial balance",
            amount: Math.round(Number(value) * 100),
            date: dateStr,
            transaction_type: "income",
            category: "Income",
            payment_method: account?.name ?? null,
            notes: "Starting balance set during onboarding",
            idempotency_key: crypto.randomUUID(),
          };
        })
      );

      if (error) {
        if (error.code !== "23505") throw error;
      }
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : "Failed to save balances");
      setIsSavingBalances(false);
      return;
    } finally {
      setIsSavingBalances(false);
    }
    finish(1);
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 backdrop-blur-sm outline-none sm:items-center"
    >
      <Card className="mx-4 mb-0 w-full max-w-lg rounded-t-3xl border-border bg-card p-6 shadow-2xl sm:mb-0 sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div
            className="flex gap-1.5"
            aria-label={`Onboarding step ${step + 1} of ${steps.length}`}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={step + 1}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <button type="button" onClick={skip} className="min-h-11 px-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
            Skip
          </button>
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl">
              <SelenaIcon className="h-full w-full" />
            </div>
            <div className="space-y-2">
              <h2 id="onboarding-title" className="text-xl font-semibold tracking-tight text-foreground">Hi there! Welcome to Selena</h2>
              <p id="onboarding-description" className="text-sm leading-6 text-muted-foreground">
                Selena is your personal finance copilot. Track income and expenses, organize them into categories, and
                see where your money goes — all in one place.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              <p className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" /> Here&apos;s what you can do:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Log expenses and income in seconds</li>
                <li>See spending breakdowns and charts</li>
                <li>Keep everything private and synced</li>
              </ul>
            </div>
            <Button onClick={() => finish(0)} className="h-11 w-full rounded-full">
              Let&apos;s go <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Coins className="size-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Add money to your accounts</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Optionally set how much money you have in each account right now. You can skip this and do it later.
              </p>
            </div>
            <div className="grid gap-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2"
                >
                  <Landmark className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{account.name}</span>
                  <div className="relative w-28 shrink-0">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₱</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={balances[account.id] ?? ""}
                      onChange={(e) =>
                        setBalances((prev) => ({ ...prev, [account.id]: e.target.value }))
                      }
                      className="h-9 rounded-full pl-7 text-right text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            {balanceError && (
              <p role="alert" className="text-sm text-red-500">{balanceError}</p>
            )}
            <div className="flex flex-col gap-2 pt-1">
              <Button onClick={() => { setBalanceError(null); saveBalances(); }} disabled={isSavingBalances} className="h-11 w-full rounded-full">
                {isSavingBalances ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Saving...</>
                ) : (
                  <><Coins className="mr-2 size-4" /> Save balances</>
                )}
              </Button>
              <button onClick={() => finish(1)} className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
                Skip, I&apos;ll add money later
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Plus className="size-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Add your first transaction</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Tap a button below to log your first expense or income. A form will open to fill in the details.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => { onAddTransaction("expense"); finish(2); }} className="h-11 flex-1 rounded-full">
                <Plus className="mr-2 size-4" /> Add Expense
              </Button>
              <Button onClick={() => { onAddTransaction("income"); finish(2); }} variant="outline" className="h-11 flex-1 rounded-full">
                <Plus className="mr-2 size-4" /> Add Income
              </Button>
            </div>
            <button onClick={() => finish(2)} className="w-full text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
              I&apos;ll do this later
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Check className="size-6 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">You&apos;re all set!</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Start tracking your finances. Add transactions anytime using the buttons at the top of the dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">Quick tips:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Each transaction goes to an account you choose</li>
                <li>Use categories to organize spending</li>
                <li>View charts and trends on your dashboard</li>
              </ul>
            </div>
            <Button onClick={() => finish(3)} className="h-11 w-full rounded-full">
              <ArrowRight className="mr-2 size-4" /> Explore dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
