import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Selena",
  description: "Learn more about Selena.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">About Selena Finance</h1>

        <p className="text-sm leading-7 text-muted-foreground">
          Welcome to <strong>Selena Finance</strong>, an AI-powered personal finance platform designed to help
          individuals better understand, manage, and improve their financial well-being.
        </p>

        <p className="text-sm leading-7 text-muted-foreground">
          Our mission is simple: <strong>make personal finance easier, smarter, and more accessible through
          artificial intelligence.</strong>
        </p>

        <p className="text-sm leading-7 text-muted-foreground">
          Managing money should not require complicated spreadsheets or financial expertise. Selena Finance provides
          intelligent insights, budgeting tools, spending analytics, and AI-powered assistance to help users make
          informed financial decisions with confidence.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Our Vision</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We envision a future where everyone has access to a personal AI financial assistant that helps them build
            healthier financial habits and achieve their financial goals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">What We Offer</h2>
          <ul className="list-disc pl-5 text-sm leading-7 text-muted-foreground">
            <li>AI-powered financial insights</li>
            <li>Expense and income tracking</li>
            <li>Budget management</li>
            <li>Spending analytics</li>
            <li>Receipt scanning and OCR</li>
            <li>Financial reports and visualizations</li>
            <li>Secure cloud-based access</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Our Commitment</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We are committed to protecting your privacy, securing your data, and continuously improving Selena
            Finance based on user feedback.
          </p>
        </section>

        <p className="text-sm leading-7 text-muted-foreground">
          Thank you for being part of our journey as we build the future of AI-powered personal finance.
        </p>
      </div>
    </main>
  );
}
