"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dashboardRangeOptions,
  formatCurrency,
  type CategoryBreakdownItem,
  type CategoryType,
  type DashboardRange,
} from "@/lib/finance";

type DashboardChartsProps = {
  expenseData: CategoryBreakdownItem[];
  incomeData: CategoryBreakdownItem[];
  range: DashboardRange;
  onAddTransaction?: (type: CategoryType) => void;
};

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { name?: string } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];
  const amount = Number(entry?.value ?? 0);
  const name = entry?.payload?.name ?? "Category";

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-popover-foreground">{name}</p>
      <p className="text-muted-foreground">{formatCurrency(amount)}</p>
    </div>
  );
}

function getBreakdownHref(type: CategoryType, category: string, range: DashboardRange) {
  const params = new URLSearchParams({ type, category, range });
  return `/transactions?${params.toString()}`;
}

export function DashboardCharts({ expenseData, incomeData, range, onAddTransaction }: DashboardChartsProps) {
  const [selectedType, setSelectedType] = useState<CategoryType>("expense");
  const data = selectedType === "expense" ? expenseData : incomeData;
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const typeLabel = selectedType === "expense" ? "expenses" : "income";
  const emptyMessage = selectedType === "expense" ? "No expenses recorded for this period." : "No income recorded for this period.";
  const rangeLabel = dashboardRangeOptions.find((option) => option.value === range)?.label ?? "Selected period";

  function handleSliceClick(entry: unknown) {
    if (!entry || typeof entry !== "object" || !("name" in entry) || typeof entry.name !== "string") {
      return;
    }

    window.location.assign(getBreakdownHref(selectedType, entry.name, range));
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Breakdown</CardTitle>
            <CardDescription>See where your {typeLabel} came from during {rangeLabel.toLowerCase()}.</CardDescription>
          </div>
          <div className="inline-flex w-full rounded-xl border border-border bg-muted/40 p-1 sm:w-auto" role="tablist" aria-label="Breakdown type">
            {(["expense", "income"] as const).map((type) => {
              const isSelected = selectedType === type;
              const label = type === "expense" ? "Expenses" : "Income";

              return (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`min-h-10 flex-1 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-none ${
                    isSelected ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center">
            <p className="text-base font-medium text-foreground">{emptyMessage}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add {selectedType === "expense" ? "an expense" : "income"} to see the breakdown for this period.
            </p>
            {onAddTransaction && (
              <Button onClick={() => onAddTransaction(selectedType)} className="rounded-full">
                + Add {selectedType === "expense" ? "Expense" : "Income"}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-center">
            <div className="h-[280px] w-full min-w-0 sm:h-[320px]" aria-label={`${labelForType(selectedType)} pie chart`}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius="48%"
                    outerRadius="74%"
                    paddingAngle={2}
                    stroke="var(--background)"
                    strokeWidth={2}
                    onClick={handleSliceClick}
                    className="cursor-pointer outline-none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{labelForType(selectedType)} totals</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Click a row to view matching transactions.</p>
                </div>
                <Badge variant="secondary">{data.length}</Badge>
              </div>

              <div className="mt-4 grid gap-2">
                {data.map((item, index) => {
                  const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0;

                  return (
                    <Link
                      key={item.name}
                      href={getBreakdownHref(selectedType, item.name, range)}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.name}</span>
                      <span className="shrink-0 text-right text-sm text-muted-foreground">
                        {formatCurrency(item.amount)} · {percent}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function labelForType(type: CategoryType) {
  return type === "expense" ? "Expense" : "Income";
}
