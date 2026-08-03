import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Selena",
  description: "Selena terms of service.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>

        <p className="text-sm leading-7 text-muted-foreground">
          <strong>Effective Date:</strong> August 3, 2026
        </p>

        <p className="text-sm leading-7 text-muted-foreground">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Selena Finance (&ldquo;Selena&rdquo;,
          &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By creating an account or using the service, you agree to
          these Terms.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">1. Use of the Service</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Selena provides AI-powered personal finance tools, including expense tracking, spending analytics, receipt
            scanning, and financial insights. You agree to use the service only for lawful purposes and in accordance
            with these Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">2. Accounts</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity
            that occurs under your account. You must provide accurate and complete information when creating an
            account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">3. Not Financial Advice</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Information and AI-generated insights provided by Selena are for informational purposes only and do not
            constitute financial, investment, legal, or tax advice. You should consult a qualified professional before
            making financial decisions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">4. Acceptable Use</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            You may not use the service to: upload unlawful or fraudulent information; attempt to access another
            user&apos;s data; interfere with the operation of the service; or reverse engineer any part of the
            application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">5. Termination</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We may suspend or terminate your access to the service if you violate these Terms. You may stop using the
            service at any time by deleting your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">6. Disclaimer of Warranties</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
            express or implied, including but not limited to implied warranties of merchantability and fitness for a
            particular purpose.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">7. Limitation of Liability</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            To the maximum extent permitted by law, Selena shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or relating to your use of the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">8. Changes to These Terms</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            We may update these Terms from time to time. Any changes will be posted on this page with an updated
            effective date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">9. Contact</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            If you have any questions about these Terms, please contact us at{` `}
            <a
              href="mailto:support@selenafinance.online"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              support@selenafinance.online
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}