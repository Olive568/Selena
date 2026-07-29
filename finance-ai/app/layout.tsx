import type { Metadata } from "next";
import "./globals.css";
import { ChatbotLauncher } from "@/components/chatbot-launcher";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Selena",
  description: "Mobile-first expense tracking dashboard with Supabase auth, category analytics, and transaction management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var theme=localStorage.getItem('selena-theme');if(theme!=='light'&&theme!=='dark'){theme='dark';localStorage.setItem('selena-theme',theme);}document.documentElement.classList.toggle('dark',theme==='dark');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <ThemeToggle />
        <ChatbotLauncher />
        {children}
        <Footer />
      </body>
    </html>
  );
}
