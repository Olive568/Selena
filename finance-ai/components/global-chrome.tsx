"use client";

import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { ChatbotLauncher } from "@/components/chatbot-launcher";
import { ThemeToggle } from "@/components/theme-toggle";

const marketingRoutes = ["/", "/sign-in", "/sign-up", "/login", "/register"];
const appRoutes = ["/dashboard", "/transactions", "/accounts", "/settings"];

export function GlobalChrome() {
  const pathname = usePathname();

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
