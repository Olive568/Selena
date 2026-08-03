import { Bot, ScanText, Activity, Gift, type LucideIcon } from "lucide-react";

import { FadeIn } from "@/components/marketing/fade-in";

type Stat = {
  icon: LucideIcon;
  label: string;
  description: string;
};

const stats: Stat[] = [
  { icon: Bot, label: "AI Powered", description: "Smart insights on every transaction." },
  { icon: ScanText, label: "Receipt OCR", description: "Scan receipts in seconds." },
  { icon: Activity, label: "Real-Time Analytics", description: "Live view of your finances." },
  { icon: Gift, label: "Free to Start", description: "No hidden costs to begin." },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.06 * index}>
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:text-teal-400">
                <stat.icon className="size-6" />
              </span>
              <div>
                <p className="font-heading text-base font-semibold tracking-tight">{stat.label}</p>
                <p className="mt-1 max-w-[180px] text-sm leading-6 text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}