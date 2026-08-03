import { Cpu, ShieldCheck, Zap, type LucideIcon } from "lucide-react";

import { FadeIn } from "@/components/marketing/fade-in";

type Pillar = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    icon: Zap,
    title: "Fast",
    description: "Log transactions in seconds.",
  },
  {
    icon: Cpu,
    title: "Smart",
    description: "AI automatically categorizes and analyzes spending.",
  },
  {
    icon: ShieldCheck,
    title: "Secure",
    description: "Your financial data is protected with Supabase Authentication and Row Level Security.",
  },
];

export function WhySelena() {
  return (
    <section id="why-selena" className="border-y border-border bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Why Selena
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Your Financial Copilot</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Built for speed, powered by intelligence, and designed around your privacy.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {pillars.map((pillar, index) => (
            <FadeIn key={pillar.title} delay={0.08 * index} className="text-center sm:text-left">
              <div className="flex flex-col items-center gap-4 sm:items-start">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:text-teal-400">
                  <pillar.icon className="size-6" />
                </span>
                <h3 className="font-heading text-xl font-semibold tracking-tight">{pillar.title}</h3>
                <p className="max-w-xs text-sm leading-6 text-muted-foreground">{pillar.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}