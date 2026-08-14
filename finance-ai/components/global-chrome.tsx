"use client";

import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { ChatbotLauncher } from "@/components/chatbot-launcher";
import { LegalHeader } from "@/components/marketing/legal-header";
import { ThemeToggle } from "@/components/theme-toggle";

const legalRoutes = ["/privacy", "/terms", "/about", "/contact"];
const marketingRoutes = ["/", "/sign-in", "/sign-up", "/login", "/register"];
const appRoutes = ["/dashboard", "/transactions", "/accounts", "/settings"];

export function GlobalChrome() {
  const pathname = usePathname();

  if (legalRoutes.includes(pathname)) {
    return <LegalHeader />;
  }

  if (marketingRoutes.includes(pathname)) {
    return null;
  }

  if (appRoutes.includes(pathname)) {
    return (
      <>
        <AppHeader />
        <ChatbotLauncher />
      </>
    );
  }

  return (
    <>
      <ThemeToggle />
      <ChatbotLauncher />
    </>
  );
}
