"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SelenaIcon } from "@/components/selena-icon";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Why Selena", href: "/#why-selena" },
  { label: "Dashboard", href: "/#dashboard" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl lg:size-11">
            <SelenaIcon className="h-full w-full" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight lg:text-2xl">Selena</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:px-5 lg:py-2.5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle position="inline" />
          <Link href="/sign-in">
            <Button variant="ghost" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg" className="rounded-full">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle position="inline" />
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}