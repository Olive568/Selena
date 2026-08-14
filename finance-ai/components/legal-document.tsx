import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TocItem = { label: string; href: string };

export function LegalDocument({
  title,
  lastUpdated,
  lastUpdatedIso,
  intro,
  notice,
  tableOfContents,
  children,
}: {
  title: string;
  lastUpdated: string;
  lastUpdatedIso: string;
  intro: ReactNode;
  notice?: ReactNode;
  tableOfContents: TocItem[];
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start lg:gap-16">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Legal
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Last updated: <time dateTime={lastUpdatedIso}>{lastUpdated}</time>
            </p>

            <div className="mt-8 max-w-3xl">{intro}</div>

            {notice && (
              <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {notice}
              </div>
            )}

            <details className="group mt-10 overflow-hidden rounded-2xl border border-border bg-card lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <nav aria-label="On this page" className="border-t border-border px-3 py-3">
                <ul className="space-y-0.5">
                  {tableOfContents.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            <div className="mt-12 lg:mt-14">{children}</div>
          </div>

          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-20">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
              <ul className="mt-4 space-y-1 border-l border-border">
                {tableOfContents.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="-ml-px block border-l-2 border-transparent px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-teal-500 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="inline rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-foreground">
      {children}
    </span>
  );
}

export function LegalSection({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-border py-10 sm:py-12">
      {children}
    </section>
  );
}

export function LegalHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
      <a href={`#${id}`} className="group inline-flex items-baseline gap-2">
        {children}
        <span
          aria-hidden="true"
          className="text-teal-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-teal-400"
        >
          #
        </span>
      </a>
    </h2>
  );
}

export function LegalSubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{children}</h3>;
}

export function LegalParagraph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-base leading-8 text-muted-foreground sm:text-lg", className)}>{children}</p>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2.5 pl-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
      {children}
    </ul>
  );
}
