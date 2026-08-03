import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

type AuthShellProps = {
  title: string;
  subtitle: string;
  highlights: { title: string; body: string }[];
  children: ReactNode;
};

export function AuthShell({ title, subtitle, highlights, children }: AuthShellProps) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/25">
              <Sparkles className="size-4 text-white" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">Selena</span>
          </Link>
          <ThemeToggle position="inline" />
        </nav>
      </header>

      <main className="flex-1 bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center justify-center">
          <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="flex flex-col justify-center gap-4 rounded-[2rem] border border-border bg-card p-6 text-card-foreground shadow-2xl shadow-black/10 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                Selena
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground">{subtitle}</p>

              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-background/40 p-4">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-center justify-center">
              <div className="w-full max-w-xl">{children}</div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}