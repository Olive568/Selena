import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Selena",
  description: "Selena privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>

        <p className="text-sm leading-7 text-muted-foreground">
          <strong>Effective Date:</strong> July 29, 2026
        </p>

        <p className="text-sm leading-7 text-muted-foreground">
          Selena Finance (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is
          committed to protecting your personal information.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Information We Collect</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We may collect the following information:
          </p>
          <ul className="list-disc pl-5 text-sm leading-7 text-muted-foreground">
            <li>Name and email address</li>
            <li>Account credentials</li>
            <li>Financial information that you voluntarily provide</li>
            <li>Transaction records</li>
            <li>Budget and spending data</li>
            <li>Device and browser information</li>
            <li>Usage analytics</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">How We Use Your Information</h2>
          <p className="text-sm leading-7 text-muted-foreground">We use your information to:</p>
          <ul className="list-disc pl-5 text-sm leading-7 text-muted-foreground">
            <li>Provide and maintain our services</li>
            <li>Improve application performance</li>
            <li>Generate AI-powered financial insights</li>
            <li>Respond to support requests</li>
            <li>Prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Data Security</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We implement industry-standard security measures to protect your information. While we strive to
            safeguard your data, no method of electronic storage or transmission is completely secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">AI Features</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Some Selena Finance features use artificial intelligence to analyze financial information and generate
            recommendations. AI-generated insights are intended for informational purposes only and should not be
            considered professional financial advice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Third-Party Services</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Selena Finance may use trusted third-party providers, including but not limited to:
          </p>
          <ul className="list-disc pl-5 text-sm leading-7 text-muted-foreground">
            <li>Vercel (Hosting)</li>
            <li>Supabase (Database &amp; Authentication)</li>
            <li>OpenAI (AI Services)</li>
            <li>Google Analytics or Vercel Analytics (Usage Analytics)</li>
          </ul>
          <p className="text-sm leading-7 text-muted-foreground">
            These providers process information according to their respective privacy policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Cookies</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We may use cookies and similar technologies to improve user experience, maintain sessions, and analyze
            website usage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Your Rights</h2>
          <p className="text-sm leading-7 text-muted-foreground">You may request to:</p>
          <ul className="list-disc pl-5 text-sm leading-7 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Request a copy of your stored information</li>
          </ul>
          <p className="text-sm leading-7 text-muted-foreground">
            To exercise these rights, contact us at:{` `}
            <a
              href="mailto:support@selenafinance.online"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              support@selenafinance.online
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Children&apos;s Privacy</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Selena Finance is not intended for children under the age required by applicable law. We do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Changes to This Policy</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated effective date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Contact</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            If you have any questions regarding this Privacy Policy, please contact:{` `}
            <a
              href="mailto:support@selenafinance.online"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              support@selenafinance.online
            </a>
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            Website:{" "}
            <a
              href="https://selenafinance.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              https://selenafinance.online
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
