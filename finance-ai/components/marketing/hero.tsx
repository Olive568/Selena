"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { Button } from "@/components/ui/button";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-24 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex max-w-2xl flex-col items-start gap-6 text-center sm:text-left"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
              <Sparkles className="size-3.5" />
              AI-powered personal finance
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Take Control of Your Money.
            <span className="mt-2 block bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </motion.h1>

          <motion.p variants={item} className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Selena is an AI-powered personal finance assistant that helps you track expenses, understand spending
            habits, upload receipts, and make smarter financial decisions—all in one place.
          </motion.p>

          <motion.div variants={item} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full rounded-full px-7 text-base sm:w-auto">
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-7 text-base sm:w-auto">
                Sign In
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={item} className="text-sm text-muted-foreground">
            Free to start · No credit card required · Set up in under a minute
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}