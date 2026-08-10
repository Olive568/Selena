"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeError, supabase } from "@/lib/supabase";
import { centsToPesos, formatCurrency, formatMonthYear, getMonthDateRange } from "@/lib/finance";

type MonthlySummaryRecord = {
  amount: number | string | null;
  transaction_type: "income" | "expense" | "transfer" | string | null;
  date: string | null;
};

type MonthlySummaryState = {
  income: number;
  expenses: number;
  count: number;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function MonthlySummary({ userId }: { userId: string }) {
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [summary, setSummary] = useState<MonthlySummaryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const monthLabel = formatMonthYear(selectedMonth);

  useEffect(() => {
    let isActive = true;

    async function loadMonthlySummary() {
      setIsLoading(true);
      setErrorMessage(null);

      const { start, end } = getMonthDateRange(selectedMonth);
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, transaction_type, date")
        .eq("user_id", userId)
        .in("transaction_type", ["income", "expense"])
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        setSummary(null);
        setErrorMessage(sanitizeError(error.message));
        setIsLoading(false);
        return;
      }

      const rows = (data ?? []) as MonthlySummaryRecord[];

      const nextSummary = rows.reduce<MonthlySummaryState>(
        (accumulator, row) => {
          const amount = centsToPesos(row.amount);

          if (row.transaction_type === "income") {
            accumulator.income += amount;
          } else if (row.transaction_type === "expense") {
            accumulator.expenses += amount;
          }

          accumulator.count += 1;

          return accumulator;
        },
        {
          income: 0,
          expenses: 0,
          count: 0,
        }
      );

      setSummary(nextSummary);
      setIsLoading(false);
    }

    void loadMonthlySummary();

    return () => {
      isActive = false;
    };
  }, [selectedMonth, userId]);

  const netBalance = (summary?.income ?? 0) - (summary?.expenses ?? 0);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Monthly summary</p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{monthLabel}</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setSelectedMonth((current) => shiftMonth(current, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setSelectedMonth((current) => shiftMonth(current, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Month overview</CardTitle>
          <CardDescription>Income, expenses, balance, and transaction count for the selected month.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-[168px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading monthly summary...
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Total income</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary?.income ?? 0)}
                </p>
                {(summary?.income ?? 0) === 0 && (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">No income logged this month</p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Total expenses</p>
                <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
                  {formatCurrency(summary?.expenses ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:col-span-2 xl:col-span-1">
                <p className="text-sm text-muted-foreground">Net balance</p>
                <p
                  className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
                    netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(netBalance)}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{summary?.count ?? 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
