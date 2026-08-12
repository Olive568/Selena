import { Mail } from "lucide-react";
import Link from "next/link";

import { SelenaIcon } from "@/components/selena-icon";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Why Selena", href: "/#why-selena" },
  { label: "Dashboard", href: "/dashboard" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl lg:size-12">
                <SelenaIcon className="h-full w-full" />
              </span>
              <span className="font-heading text-xl font-semibold tracking-tight lg:text-2xl">Selena</span>
            </Link>
            <p className="text-base leading-7 text-muted-foreground lg:text-lg lg:leading-8">
              An AI-powered personal finance assistant that helps you track expenses, understand your spending, and
              make smarter financial decisions.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Olive568/Selena"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Selena on GitHub"
                className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:size-12"
              >
                <GithubIcon className="size-5 lg:size-6" />
              </a>
              <a
                href="mailto:support@selenafinance.online"
                aria-label="Email Selena"
                className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:size-12"
              >
                <Mail className="size-5 lg:size-6" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-base font-semibold text-foreground lg:text-lg">Product</p>
            <ul className="mt-5 space-y-3.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-base text-muted-foreground transition-colors hover:text-foreground lg:text-lg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-base font-semibold text-foreground lg:text-lg">Company</p>
            <ul className="mt-5 space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-base text-muted-foreground transition-colors hover:text-foreground lg:text-lg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-base text-muted-foreground sm:flex-row lg:mt-16 lg:text-lg">
          <p>
            <span className="mr-2 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Alpha
            </span>
            &copy; {new Date().getFullYear()} Selena. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}