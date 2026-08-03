import {
  BarChart3,
  Bot,
  PiggyBank,
  ReceiptText,
  ScanText,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { FadeIn } from "@/components/marketing/fade-in";
import { Card, CardContent } from "@/components/ui/card";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Wallet,
    title: "Expense Tracking",
    description: "Log income and expenses in seconds. Capture every peso so your records always match reality.",
  },
  {
    icon: Bot,
    title: "AI Financial Assistant",
    description: "Ask Selena anything about your money in plain language and get instant, accurate answers.",
  },
  {
    icon: ScanText,
    title: "Receipt OCR",
    description: "Snap a photo of any receipt and let Selena extract the details, merchant, and amount automatically.",
  },
  {
    icon: BarChart3,
    title: "Spending Analytics",
    description: "See exactly where your money goes with clear category breakdowns and monthly comparisons.",
  },
  {
    icon: PiggyBank,
    title: "Budget Planning",
    description: "Set budgets per category and get alerted before you overspend—so goals stay on track.",
  },
  {
    icon: ReceiptText,
    title: "Net Worth Tracking",
    description: "Watch your net worth grow over time with a clear view of assets, liabilities, and progress.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <FadeIn className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
          Everything in one place
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          A complete toolkit for your money
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Stop juggling spreadsheets and banking apps. Selena brings tracking, analytics, and AI together in a single,
          beautiful workspace.
        </p>
      </FadeIn>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FadeIn key={feature.title} delay={0.05 * index}>
            <Card className="group h-full border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 text-teal-600 ring-1 ring-teal-500/20 transition-transform duration-300 group-hover:scale-105 dark:text-teal-400">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}