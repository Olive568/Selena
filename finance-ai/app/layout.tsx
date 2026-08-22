import type { Metadata } from "next";
import "./globals.css";
import { GlobalChrome } from "@/components/global-chrome";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Selena — AI-Powered Personal Finance Assistant",
  description:
    "Selena is an AI-powered personal finance assistant that helps you track expenses, understand spending habits, and make smarter financial decisions—all in one place.",
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
        <GlobalChrome />
        {children}
        <Footer />
      </body>
    </html>
  );
}
