"use client";

import Link from "next/link";

import { SelenaIcon } from "@/components/selena-icon";
import { ThemeToggle } from "@/components/theme-toggle";

export function LegalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl lg:size-11">
            <SelenaIcon className="h-full w-full" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight lg:text-2xl">Selena</span>
        </Link>
        <ThemeToggle position="inline" />
      </nav>
    </header>
  );
}