"use client";

import { usePathname } from "next/navigation";

import { ChatbotLauncher } from "@/components/chatbot-launcher";
import { ThemeToggle } from "@/components/theme-toggle";

const marketingRoutes = ["/", "/sign-in", "/sign-up", "/login", "/register"];

export function GlobalChrome() {
  const pathname = usePathname();

  if (marketingRoutes.includes(pathname)) {
    return null;
  }

  return (
    <>
      <ThemeToggle />
      <ChatbotLauncher />
    </>
  );
}