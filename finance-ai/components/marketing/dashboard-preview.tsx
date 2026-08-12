"use client";

import { ArrowDownRight, ArrowUpRight, Landmark, PieChart } from "lucide-react";

import { SelenaIcon } from "@/components/selena-icon";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/finance";

const monthlySpending = [
  { name: "Jan", value: 22 },
  { name: "Feb", value: 18 },
  { name: "Mar", value: 26 },
  { name: "Apr", value: 20 },
  { name: "May", value: 30 },
  { name: "Jun", value: 24 },
  { name: "Jul", value: 28 },
];

const incomeExpense = [
  { name: "Jan", income: 52, expense: 22 },
  { name: "Feb", income: 50, expense: 18 },
  { name: "Mar", income: 55, expense: 26 },
  { name: "Apr", income: 52, expense: 20 },
  { name: "May", income: 58, expense: 30 },
  { name: "Jun", income: 54, expense: 24 },
  { name: "Jul", income: 56, expense: 28 },
];

const categories = [
  { name: "Food", value: 35, color: "var(--chart-1)" },
  { name: "Transport", value: 20, color: "var(--chart-2)" },
  { name: "Groceries", value: 25, color: "var(--chart-3)" },
  { name: "Entertainment", value: 12, color: "var(--chart-4)" },
  { name: "Other", value: 8, color: "var(--chart-5)" },
];

const transactions = [
  { merchant: "GrabFood", category: "Food", amount: 2140, type: "expense" },
  { merchant: "Payroll", category: "Income", amount: 52000, type: "income" },
  { merchant: "SM Mart", category: "Groceries", amount: 1820, type: "expense" },
  { merchant: "Shell", category: "Transport", amount: 960, type: "expense" },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{formatCurrency(payload[0].value * 1000)}</p>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="size-3 rounded-full bg-rose-400" />
          <span className="size-3 rounded-full bg-amber-400" />
          <span className="size-3 rounded-full bg-emerald-400" />
          <div className="mx-auto flex items-center gap-2 rounded-md bg-background px-4 py-1 text-xs font-medium text-muted-foreground">
            <Landmark className="size-3.5" />
            app.selena.com/dashboard
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background/60 p-5">
                <p className="text-xs font-medium text-muted-foreground">Total balance</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(124500)}</p>
                <p className="mt-1 text-xs font-medium text-emerald-500">+12.4% this month</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-5">
                <p className="text-xs font-medium text-muted-foreground">This month&apos;s spend</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(18340)}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">Across 6 categories</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Monthly spending</p>
                <span className="text-xs text-muted-foreground">Last 7 months</span>
              </div>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySpending}>
                    <defs>
                      <linearGradient id="previewSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={8} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#previewSpending)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-5">
              <p className="mb-4 text-sm font-medium">Income vs Expense</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpense} barGap={3}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={8} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                    <Bar dataKey="income" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center overflow-hidden rounded-lg">
                  <SelenaIcon className="h-full w-full" />
                </span>
                <p className="text-sm font-semibold">Selena AI Insight</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                You spent <span className="font-semibold text-foreground">{formatCurrency(2140)}</span> on Food from
                GrabFood this week. Consider setting a {formatCurrency(6000)} monthly food budget.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-5">
              <p className="mb-4 text-sm font-medium">Recent transactions</p>
              <div className="space-y-3">
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
                    <p className={`shrink-0 text-sm font-semibold ${transaction.type === "income" ? "text-emerald-500" : ""}`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-5">
              <div className="flex items-center gap-2">
                <PieChart className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">Category breakdown</p>
              </div>
              <div className="mt-4 space-y-3">
                {categories.map((category) => (
                  <div key={category.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{category.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${category.value}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}