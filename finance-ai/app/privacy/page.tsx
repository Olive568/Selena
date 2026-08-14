import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import {
  LegalDocument,
  LegalHeading,
  LegalList,
  LegalParagraph,
  LegalSection,
  LegalSubHeading,
  Placeholder,
} from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy — Selena",
  description:
    "Your privacy matters to us. This Privacy Policy explains how Selena Finance processes information when you use our website and application.",
};

const LAST_UPDATED = "August 14, 2026";

const tableOfContents = [
  { label: "Information We Process", href: "#information-we-process" },
  { label: "How We Use Information", href: "#how-we-use-information" },
  { label: "AI Processing", href: "#ai-processing" },
  { label: "Data Sharing", href: "#data-sharing" },
  { label: "Security", href: "#security" },
  { label: "Your Rights", href: "#your-rights" },
  { label: "Philippine Privacy Law", href: "#philippine-law" },
  { label: "Retention", href: "#retention" },
  { label: "Contact", href: "#contact" },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      lastUpdatedIso="2026-08-14"
      intro={
        <>
          <p className="text-lg font-medium leading-9 text-foreground sm:text-xl sm:leading-10">
            Your privacy matters to us. This Privacy Policy explains how Selena Finance processes information when you
            use our website and application.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            This Privacy Policy applies to Selena Finance and the services we provide through the application,
            including the website, the financial tracking tools, and Selena Chat.
          </p>
        </>
      }
      tableOfContents={tableOfContents}
    >
      <LegalSection id="about">
        <LegalHeading id="about">About Selena</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena Finance is an
            AI-powered personal finance application that helps people track income and expenses, understand their
            spending, and get AI-assisted answers about their finances.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="information-we-process">
        <LegalHeading id="information-we-process">Information We Process</LegalHeading>
        <div className="mt-5 space-y-6">
          <LegalParagraph>
            Selena processes the information needed to operate the service, along with the information you choose to
            provide. We do not collect information that is unnecessary for the features you use.
          </LegalParagraph>

          <div className="space-y-3">
            <LegalSubHeading>Account and Authentication Information</LegalSubHeading>
            <LegalParagraph>
              To create an account, you provide a display name, an email address, and a password. Sign-in is handled
              by our authentication provider, Supabase, which manages your credentials and session and assigns each
              account a unique account identifier. Selena does not store email addresses or passwords in its own
              application database. We use your account identifier to associate the information you enter — such as
              transactions, accounts, and categories — with your account.
            </LegalParagraph>
          </div>

          <div className="space-y-3">
            <LegalSubHeading>Financial Information</LegalSubHeading>
            <LegalParagraph>
              Selena&apos;s core purpose is to help you track your finances. You choose what to record, which may
              include:
            </LegalParagraph>
            <LegalList>
              <li>Income and expenses</li>
              <li>Transaction amounts and dates</li>
              <li>Merchant names</li>
              <li>Categories</li>
              <li>Payment methods</li>
              <li>Notes</li>
              <li>Account names and institutions (such as a bank or e-wallet)</li>
              <li>Account balances, including opening balances</li>
              <li>Transfers between accounts</li>
            </LegalList>
            <LegalParagraph>
              This information is necessary for Selena&apos;s core financial-tracking functionality — for example,
              showing your account balances, monthly summaries, and transaction history. You control what you enter,
              and you can edit or delete individual records at any time.
            </LegalParagraph>
          </div>

          <div className="space-y-3">
            <LegalSubHeading>AI Chat Information</LegalSubHeading>
            <LegalParagraph>
              When you use Selena Chat, the service processes the information needed to answer your question:
            </LegalParagraph>
            <LegalList>
              <li>The question you ask</li>
              <li>
                Relevant financial information needed to answer it — specifically, your transactions within the date
                range you select
              </li>
              <li>The selected date range</li>
            </LegalList>
            <LegalParagraph>
              This information is processed to generate the AI response. Selena does not save your chat conversations
              to your account, and they are not stored as a history in the application. Your question, the selected
              date range, and the relevant transaction data are sent to our AI service provider to generate the
              answer, as described in the AI and Third-Party Processing section below.
            </LegalParagraph>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="information-we-do-not-collect">
        <LegalHeading id="information-we-do-not-collect">Information We Do Not Intentionally Collect</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena is designed to collect only what it needs to provide the service. We do not intentionally request
            or require:
          </LegalParagraph>
          <LegalList>
            <li>Physical addresses</li>
            <li>Phone numbers</li>
            <li>Government identification numbers</li>
            <li>Social media profiles</li>
            <li>Other personal information unrelated to the service</li>
          </LegalList>
          <LegalParagraph>
            If you choose to type this kind of information into a note, transaction, or chat message, it is processed
            as part of that content. Selena does not ask for it, and we do not use it for any purpose beyond providing
            the service.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="how-we-use-information">
        <LegalHeading id="how-we-use-information">How We Use Information</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>We process information only for legitimate, clearly defined purposes:</LegalParagraph>
          <LegalList>
            <li>Creating and authenticating your account</li>
            <li>Providing Selena&apos;s financial tracking functionality</li>
            <li>Recording and displaying your transactions</li>
            <li>Calculating account balances and financial summaries</li>
            <li>Providing Selena Chat and AI-assisted financial insights</li>
            <li>Maintaining application security</li>
            <li>Preventing abuse and unauthorized access</li>
            <li>Maintaining and improving the reliability of the service</li>
            <li>Complying with applicable legal obligations</li>
          </LegalList>
          <LegalParagraph>
            We do not use your information for advertising, behavioral advertising, or to sell your data, and we do
            not use it for purposes unrelated to the service described in this Privacy Policy.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="legal-basis">
        <LegalHeading id="legal-basis">Legal Basis for Processing</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Under Republic Act No. 10173 (the Data Privacy Act of 2012) and its Implementing Rules and Regulations,
            personal information may only be processed when there is a lawful basis to do so. Depending on the
            activity, Selena relies on the following bases:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong className="font-semibold text-foreground">
                Performance of a contract / provision of a requested service.
              </strong>{" "}
              We process account and financial information to deliver the service you requested — creating your
              account and providing the financial tracking and AI features you use.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Consent.</strong> Where processing relies on consent —
              for example, when you choose to share information for a specific purpose — we rely on your consent,
              which you may withdraw at any time.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Compliance with legal obligations.</strong> We may
              process information where required by applicable law or where we are subject to a legal obligation.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Legitimate interests.</strong> Where applicable, we may
              rely on our legitimate interests — such as maintaining the security and reliability of the service —
              provided these interests are balanced against your rights and are not overridden by them.
            </li>
          </LegalList>
          <LegalParagraph>
            We do not rely on consent for every processing activity. Much of the processing needed to provide the
            service is carried out to fulfill the service you asked for.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="ai-processing">
        <LegalHeading id="ai-processing">AI and Third-Party Processing</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena Chat is an AI feature. When you ask Selena a question, your question, the selected date range, and
            the relevant transaction data are processed by our AI service provider to generate a response. This
            happens in real time: we send only the information needed to answer your question, and we do not save your
            conversations to your account.
          </LegalParagraph>
          <LegalParagraph>
            Selena relies on a small number of third-party service providers to operate the service. We share only the
            information necessary for each provider to do its job:
          </LegalParagraph>
          <div className="space-y-4">
            <div className="space-y-2">
              <LegalSubHeading>Supabase — authentication and database</LegalSubHeading>
              <LegalParagraph>
                Supabase manages your sign-in and stores the information you enter, such as transactions, accounts,
                categories, and transfers. Supabase also provides the database and the Row Level Security access
                controls that keep your data available only to you.
              </LegalParagraph>
            </div>
            <div className="space-y-2">
              <LegalSubHeading>Groq — AI processing</LegalSubHeading>
              <LegalParagraph>
                When you use Selena Chat, your question, the selected date range, and the relevant transaction data are
                sent to Groq&apos;s API so the model can generate a response.
              </LegalParagraph>
            </div>
            <div className="space-y-2">
              <LegalSubHeading>Vercel — hosting</LegalSubHeading>
              <LegalParagraph>
                The Selena application is built and served through Vercel&apos;s infrastructure.
              </LegalParagraph>
            </div>
          </div>
          <LegalParagraph>
            We cannot speak for how these providers handle data on their own systems. For the most current information,
            please refer to their privacy policies:
          </LegalParagraph>
          <ul className="space-y-2 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            <li>
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Supabase Privacy Policy
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </li>
            <li>
              <a
                href="https://groq.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Groq Privacy Policy
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Vercel Privacy Notice
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="data-sharing">
        <LegalHeading id="data-sharing">Data Sharing and Disclosure</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena does not sell your personal information, and we do not rent or trade it. We do not share it for
            advertising or marketing purposes.
          </LegalParagraph>
          <LegalParagraph>We may disclose information only in the limited circumstances described here:</LegalParagraph>
          <LegalList>
            <li>
              <strong className="font-semibold text-foreground">Service providers.</strong> Information may be
              processed by service providers acting on our behalf when necessary to provide the service, as described
              in the AI and Third-Party Processing section above. These providers are instructed to process
              information only for the purposes we describe.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Legal requirements.</strong> We may disclose
              information where required by applicable law, legal process, or government request, or where we believe
              in good faith that disclosure is necessary to protect Selena, its users, or the public from fraud,
              abuse, security threats, or other unlawful activity.
            </li>
          </LegalList>
          <LegalParagraph>
            Your financial data belongs to you. We do not use it for purposes unrelated to providing the service.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="retention">
        <LegalHeading id="retention">Data Retention</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            We retain information only for as long as reasonably necessary to provide the service, fulfill the
            purposes described in this Privacy Policy, maintain legitimate business records, resolve disputes, enforce
            our agreements, or comply with applicable legal obligations.
          </LegalParagraph>
          <LegalParagraph>
            When you delete your account, we delete the information associated with it — including your profile,
            transactions, transfers, categories, and accounts — and your sign-in identity is removed through our
            authentication provider. You can delete your account at any time from the Settings page.
          </LegalParagraph>
          <LegalParagraph>
            If specific retention periods are established in the future, we will describe them here.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="security">
        <LegalHeading id="security">Data Security</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            We apply reasonable technical and organizational safeguards appropriate to the sensitivity of the
            information we process:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong className="font-semibold text-foreground">Encryption in transit.</strong> All traffic to Selena
              is served over HTTPS/TLS.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Secure authentication.</strong> Sign-in is handled by
              Supabase Auth, including password hashing and session management.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Database access controls.</strong> User-owned data is
              protected by Row Level Security (RLS) policies, so users can only access their own records.
            </li>
            <li>
              <strong className="font-semibold text-foreground">
                Server-side handling of sensitive credentials.
              </strong>{" "}
              Sensitive credentials, such as the AI API key, are kept in server-side environment variables and never
              exposed to the browser.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Access controls and monitoring.</strong> Access to
              production systems is limited, and the service is monitored and maintained to prevent abuse and
              unauthorized access.
            </li>
          </LegalList>
          <LegalParagraph>
            No internet-based service can guarantee absolute security. While we work to protect your information, we
            cannot guarantee that unauthorized access will never occur. We encourage you to use a strong, unique
            password for your account.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="your-rights">
        <LegalHeading id="your-rights">Your Rights Under the Data Privacy Act</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and
            Regulations, you have the following rights with respect to your personal information:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong className="font-semibold text-foreground">Right to be informed.</strong> To know whether
              personal information is being processed and how it will be used.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to access.</strong> To obtain a copy of the
              personal information Selena holds about you.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to correct.</strong> To request correction of
              inaccurate or incomplete information.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to object.</strong> To object to processing,
              including processing based on legitimate interests or for direct marketing.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to erasure or blocking.</strong> To request
              erasure or blocking of personal information, where applicable under the law.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to data portability.</strong> To request a copy
              of your data in a structured, commonly used, machine-readable format, where applicable.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to file a complaint.</strong> To file a
              complaint with the National Privacy Commission.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Right to damages.</strong> To claim damages, where
              applicable, in accordance with law.
            </li>
          </LegalList>
          <LegalParagraph>
            To exercise any of these rights, please contact us at <Placeholder>[PRIVACY CONTACT EMAIL]</Placeholder>{" "}
            with the subject line &ldquo;Privacy Request&rdquo;. Requests may be subject to reasonable steps to verify
            your identity and to lawful limitations. We will respond within the timeframe required by applicable law.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="philippine-law">
        <LegalHeading id="philippine-law">Compliance with Philippine Law</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena is designed to comply with applicable Philippine privacy requirements, including:
          </LegalParagraph>
          <LegalList>
            <li>Republic Act No. 10173 — the Data Privacy Act of 2012</li>
            <li>The Implementing Rules and Regulations of Republic Act No. 10173</li>
            <li>Applicable issuances and guidelines of the National Privacy Commission (NPC)</li>
          </LegalList>
          <LegalParagraph>
            In processing personal information, Selena follows the fundamental principles of the Data Privacy Act:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong className="font-semibold text-foreground">Transparency.</strong> We explain clearly what we
              process, why, and how.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Legitimate purpose.</strong> We process information
              only for purposes that are lawful and consistent with the service we provide.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Proportionality.</strong> We process only the
              information necessary for the intended purpose, and no more.
            </li>
          </LegalList>
          <LegalParagraph>
            Selena has not been certified, approved, or endorsed by the National Privacy Commission. This Privacy
            Policy is a plain-language explanation of our practices, intended to be concise, accessible, and
            understandable.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="cookies">
        <LegalHeading id="cookies">Cookies and Similar Technologies</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>Selena uses only a small number of functional technologies:</LegalParagraph>
          <LegalList>
            <li>
              <strong className="font-semibold text-foreground">Authentication cookies.</strong> To keep you signed in,
              our authentication provider sets session cookies. These are strictly necessary for the service to
              function.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Local storage for your theme preference.</strong> Your
              light or dark theme choice is stored in your browser&apos;s local storage so your preference is
              remembered between visits.
            </li>
          </LegalList>
          <LegalParagraph>
            We do not use cookies or similar technologies for advertising, cross-site tracking, or analytics, and the
            application does not run third-party tracking or analytics scripts.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="children">
        <LegalHeading id="children">Children&apos;s Privacy</LegalHeading>
        <div className="mt-5">
          <LegalParagraph>
            Selena is intended for general adult use and is not directed to children. We do not knowingly collect
            personal information from children. If you believe a child has provided us with personal information,
            please contact us at <Placeholder>[PRIVACY CONTACT EMAIL]</Placeholder> and we will take steps to address
            it.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="international">
        <LegalHeading id="international">International Data Processing</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena operates with the help of infrastructure and service providers that may process information outside
            the Philippines. For example, the providers described in this Privacy Policy may use data centers or
            processing locations in other countries. We do not claim that all information is stored in the
            Philippines.
          </LegalParagraph>
          <LegalParagraph>
            When personal information is transferred outside the Philippines, we take steps to apply safeguards
            consistent with applicable requirements of the Data Privacy Act and its Implementing Rules and
            Regulations, including the security and access measures described in this Privacy Policy.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="changes">
        <LegalHeading id="changes">Changes to This Privacy Policy</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            We may update this Privacy Policy from time to time when our practices, services, or legal requirements
            change. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page. Where
            changes are material, we will take reasonable steps to bring them to your attention, such as a notice
            within the application.
          </LegalParagraph>
          <LegalParagraph>
            We encourage you to review this page periodically to stay informed about how we process your information.
          </LegalParagraph>
          <p className="text-base text-muted-foreground sm:text-lg">
            Last updated: <time dateTime="2026-08-14">{LAST_UPDATED}</time>
          </p>
        </div>
      </LegalSection>

      <LegalSection id="contact">
        <LegalHeading id="contact">Contact Us</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>Questions about privacy or requests concerning your personal information?</LegalParagraph>
          <address className="space-y-2 rounded-2xl border border-border bg-card p-5 text-base leading-7 text-muted-foreground not-italic sm:text-lg sm:leading-8">
            <p>
              <Placeholder>luislabapis@gmail.com</Placeholder>
            </p>
          </address>
          <LegalParagraph>
            For more information about your privacy rights, you may visit the website of the Philippine National
            Privacy Commission at{" "}
            <a
              href="https://privacy.gov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80"
            >
              privacy.gov.ph
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
            .
          </LegalParagraph>
        </div>
      </LegalSection>
    </LegalDocument>
  );
}
