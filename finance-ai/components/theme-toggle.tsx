"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";

const THEME_STORAGE_KEY = "selena-theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  function handleToggleTheme() {
    setIsDark((current) => !current);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="fixed right-3 top-3 z-50 rounded-full border-border bg-card/95 text-foreground shadow-lg shadow-black/10 backdrop-blur sm:right-4 sm:top-4"
      onClick={handleToggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  );
}
