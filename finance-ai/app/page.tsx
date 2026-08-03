import { AiPreview } from "@/components/marketing/ai-preview";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Features } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { Navbar } from "@/components/marketing/navbar";
import { Stats } from "@/components/marketing/stats";
import { WhySelena } from "@/components/marketing/why-selena";
import { FadeIn } from "@/components/marketing/fade-in";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />

        <Features />

        <WhySelena />

        <section id="dashboard" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Your dashboard
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to understand your money
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              A clean, real-time overview of your spending, income, and insights—ready the moment you sign in.
            </p>
          </FadeIn>
          <FadeIn delay={0.15} className="mt-14">
            <DashboardPreview />
          </FadeIn>
        </section>

        <AiPreview />

        <Stats />

        <FinalCta />
      </main>
    </>
  );
}