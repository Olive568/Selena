"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type CategoryBreakdownItem } from "@/lib/finance";

type DashboardChartsProps = {
  categoryData: CategoryBreakdownItem[];
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

export function DashboardCharts({ categoryData }: DashboardChartsProps) {
  if (categoryData.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted/40 shadow-none">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-base font-medium text-foreground">No expense data yet.</p>
          <p className="max-w-sm text-sm text-muted-foreground">Add transactions to see spending trends.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Category spending</Badge>
            <Badge variant="outline">Pie chart</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = categoryData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Spending by category</p>
              <p className="text-sm leading-6 text-muted-foreground">Only expenses are included in this breakdown.</p>
            </div>
            <Badge variant="secondary">{categoryData.length} categories</Badge>
          </div>

          <div className="grid gap-6 pt-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-center">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                  />
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={118}
                    paddingAngle={2}
                    stroke="var(--background)"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
              <p className="text-sm font-medium text-foreground">Category totals</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Sorted from highest to lowest spending.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {categoryData.map((item, index) => {
                  const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0;

                  return (
                    <div key={item.name} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: pieColors[index % pieColors.length] }}
                          />
                          <span className="min-w-0 truncate font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-foreground">{percent}%</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>{formatCurrency(item.amount)}</span>
                        <span>of spending</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
