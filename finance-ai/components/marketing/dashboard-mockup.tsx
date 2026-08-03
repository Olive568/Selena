"use client";

import { ArrowDownRight, ArrowUpRight, Bot, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { formatCurrency } from "@/lib/finance";

const spendingData = [
  { name: "Jan", value: 42 },
  { name: "Feb", value: 36 },
  { name: "Mar", value: 52 },
  { name: "Apr", value: 44 },
  { name: "May", value: 58 },
  { name: "Jun", value: 49 },
  { name: "Jul", value: 66 },
];

const transactions = [
  { merchant: "GrabFood", category: "Food", amount: 2140, type: "expense" },
  { merchant: "Salary", category: "Income", amount: 52000, type: "income" },
  { merchant: "SM Mart", category: "Groceries", amount: 1820, type: "expense" },
  { merchant: "Shell", category: "Transport", amount: 960, type: "expense" },
];

export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-gradient-to-tr from-teal-500/20 via-transparent to-emerald-400/20 blur-3xl" />

      <div className="relative rounded-2xl border border-border bg-card p-3 shadow-2xl shadow-black/20 sm:p-4">
        <div className="mb-4 flex items-center gap-2 px-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-center text-[10px] font-medium text-muted-foreground">
            app.selena.com/dashboard
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Wallet className="size-3.5" />
              Net Worth
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(124500)}</p>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-500">
              <ArrowUpRight className="size-3.5" />
              +12.4% this month
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Spending</span>
              <span className="text-[10px] font-semibold text-emerald-500">-8% vs last month</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(18340)}</p>
            <div className="mt-1 h-14">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient id="mockSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#mockSpending)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Recent transactions</span>
            <span className="text-[10px] font-medium text-muted-foreground">This month</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {transactions.map((transaction) => (
              <div key={transaction.merchant} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      transaction.type === "income"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowDownRight className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{transaction.merchant}</p>
                    <p className="text-xs text-muted-foreground">{transaction.category}</p>
                  </div>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold ${
                    transaction.type === "income" ? "text-emerald-500" : "text-foreground"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-teal-500/15">
              <Bot className="size-3.5 text-teal-500" />
            </span>
            <div>
              <p className="text-sm font-semibold">AI Insight</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>
          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
            You spent <span className="font-semibold text-foreground">{formatCurrency(2140)}</span> on Food from
            GrabFood. Dining out is up 12% — consider a weekly budget.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-teal-500">
            <TrendingUp className="size-3.5" />
            Spending pattern detected
          </div>
        </div>
      </div>
    </div>
  );
}