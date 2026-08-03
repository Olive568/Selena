import { Bot, User } from "lucide-react";

import { FadeIn } from "@/components/marketing/fade-in";
import { formatCurrency } from "@/lib/finance";

export function AiPreview() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Conversational finance
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Just ask. Selena knows your numbers.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            No more digging through spreadsheets. Ask Selena about your spending in plain language and get instant,
            human-readable answers backed by your real transaction data.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mx-auto max-w-lg">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl shadow-black/10 sm:p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/25">
                  <Bot className="size-4 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Selena</p>
                  <p className="text-xs text-muted-foreground">AI Financial Assistant · Online</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="size-4" />
                  </span>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3 text-sm leading-6">
                    How much did I spend on food this month?
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600">
                    <Bot className="size-4 text-white" />
                  </span>
                  <div className="max-w-[85%] space-y-1 rounded-2xl rounded-tl-sm border border-border bg-background/60 px-4 py-3 text-sm leading-6">
                    <p>
                      You spent <span className="font-semibold">{formatCurrency(8420)}</span> on Food this month.
                    </p>
                    <p>
                      That&apos;s <span className="font-medium text-rose-500">12% higher</span> than last month.
                    </p>
                    <p>
                      Your largest expense was <span className="font-semibold">GrabFood ({formatCurrency(2140)}).</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}