import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-4 py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="flex items-center gap-2">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Alpha</span>
          &copy; {new Date().getFullYear()} Selena. All rights reserved.
        </p>
        <nav className="flex gap-4">
          <Link href="/about" className="underline underline-offset-2 hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
