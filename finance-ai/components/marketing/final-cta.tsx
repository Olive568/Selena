import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/marketing/fade-in";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:py-32">
        <FadeIn>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
            Ready to take control of your finances?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Join Selena today and let AI handle the heavy lifting. Set up your personal financial copilot in under a
            minute.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="flex flex-col items-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 rounded-full px-8 text-base">
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">No credit card required.</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}