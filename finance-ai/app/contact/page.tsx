import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Selena",
  description: "Get in touch with the Selena team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Contact Us</h1>

        <p className="text-sm leading-7 text-muted-foreground">
          Have questions, suggestions, or need assistance? We&apos;d love to hear from you.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Email</h2>
          <a
            href="mailto:luislabapis@gmail.com"
            className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
          >
            luislabapis@gmail.com
          </a>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Feedback</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Your feedback helps us improve Selena Finance. If you&apos;ve encountered a bug, have a feature request,
            or simply want to share your experience, please contact us via email.
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            We aim to respond to all inquiries as soon as possible.
          </p>
        </section>

        <p className="text-sm leading-7 text-muted-foreground">
          Thank you for supporting Selena Finance.
        </p>
      </div>
    </main>
  );
}
