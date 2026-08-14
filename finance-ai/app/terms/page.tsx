import type { Metadata } from "next";

import {
  LegalDocument,
  LegalHeading,
  LegalList,
  LegalParagraph,
  LegalSection,
  Placeholder,
} from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service — Selena",
  description:
    "Please read these Terms of Service carefully. They govern your access to and use of Selena Finance.",
};

const LAST_UPDATED = "August 14, 2026";

const tableOfContents = [
  { label: "Description of Selena", href: "#description" },
  { label: "Eligibility and Accounts", href: "#eligibility" },
  { label: "AI Assistant", href: "#ai-assistant" },
  { label: "No Financial Advice", href: "#no-financial-advice" },
  { label: "Acceptable Use", href: "#acceptable-use" },
  { label: "Security", href: "#security" },
  { label: "Privacy", href: "#privacy" },
  { label: "Disclaimers", href: "#disclaimers" },
  { label: "Termination", href: "#termination" },
  { label: "Governing Law", href: "#governing-law" },
  { label: "Contact", href: "#contact" },
];

const privacyLinkClassName =
  "text-primary underline underline-offset-4 hover:text-primary/80";

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      lastUpdatedIso="2026-08-14"
      intro={
        <>
          <p className="text-lg font-medium leading-9 text-foreground sm:text-xl sm:leading-10">
            Please read these Terms of Service carefully. They govern your access to and use of Selena Finance
            .
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            These Terms apply to everyone who uses Selena, whether you are browsing the public website or using
            authenticated features such as tracking your finances or chatting with the AI assistant.
          </p>
        </>
      }
      notice={
        <>
          <p>
            These Terms work together with our{" "}
            <a href="/privacy" className={privacyLinkClassName}>
              Privacy Policy
            </a>
            , which describes how Selena processes personal information. Please read both documents carefully.
          </p>
         
        </>
      }
      tableOfContents={tableOfContents}
    >
      <LegalSection id="acceptance">
        <LegalHeading id="acceptance">Acceptance of These Terms</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            By accessing the Selena website, creating an account, or using Selena in any way, you agree to be bound by
            these Terms and to comply with them. If you do not agree with these Terms, please do not use Selena.
          </LegalParagraph>
          <LegalParagraph>
            Simply browsing the public website does not require an account. Creating an account and using authenticated
            features — such as tracking income and expenses, managing accounts, or using the AI assistant — means you
            accept these Terms.
          </LegalParagraph>
          <LegalParagraph>
            These Terms apply to everyone who uses Selena, wherever you are located, subject to applicable law.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="description">
        <LegalHeading id="description">Description of Selena</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena is a personal finance tracking and AI-assisted information tool. It helps you record income,
            expenses, and transfers; create and manage accounts; categorize transactions; view balances, transaction
            history, and financial summaries; and ask questions about your finances through an AI assistant.
          </LegalParagraph>
          <LegalParagraph>
            Selena is a software application, not a financial institution. It is not a bank, investment platform,
            payment processor, accounting service, tax service, financial adviser, or fiduciary. Selena does not hold
            or settle payments and does not manage money on your behalf.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="eligibility">
        <LegalHeading id="eligibility">Eligibility and Account Registration</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            To use authenticated features of Selena, you need to create an account. When you register, you agree to:
          </LegalParagraph>
          <LegalList>
            <li>Provide accurate information where required, such as your display name.</li>
            <li>Keep your login credentials confidential and not share them with anyone.</li>
            <li>Be responsible for activity that occurs under your account.</li>
            <li>Notify us if you believe your account has been compromised.</li>
          </LegalList>
          <LegalParagraph>
            You must be old enough to enter into a binding agreement under the law applicable to you, or you must have
            the consent of a parent or guardian.{" "}
          </LegalParagraph>
          <LegalParagraph>
            You are responsible for maintaining the security of your account. We rely on the email address and
            authentication method associated with your account for account-related matters.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="financial-information">
        <LegalHeading id="financial-information">User Financial Information and Content</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            You are responsible for the financial information and other content you enter into Selena, including
            transactions, account information, categories, notes, and any other information you submit.
          </LegalParagraph>
          <LegalParagraph>
            Selena does not independently verify whether the information you enter is accurate, complete, or current.
            You are responsible for reviewing and correcting your information.
          </LegalParagraph>
          <LegalParagraph>
            Selena is a tool for recording and viewing your own data. It should not be treated as the authoritative
            record of your bank, e-wallet, credit card, investment, or other financial account. For official records,
            rely on your financial institution and other authoritative sources.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="ai-assistant">
        <LegalHeading id="ai-assistant">AI Assistant and Financial Disclaimer</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena includes an AI assistant that can answer questions about your finances. AI responses are generated
            using artificial intelligence, based on information available to Selena and information you supply, such
            as your transactions within a selected date range.
          </LegalParagraph>
          <LegalParagraph>AI-generated responses may:</LegalParagraph>
          <LegalList>
            <li>Be incomplete, inaccurate, outdated, or unsuitable for your particular situation.</li>
            <li>Reflect only the information available to Selena and the information you supply.</li>
            <li>Need to be independently evaluated by you before you rely on them.</li>
          </LegalList>
          <LegalParagraph>
            The AI assistant does not provide professional financial, investment, tax, accounting, legal, or other
            regulated advice. You should consult a qualified professional before making significant financial or
            legally consequential decisions.
          </LegalParagraph>
          <LegalParagraph>
            Nothing in this section is intended to exclude responsibilities that cannot be excluded under applicable
            law.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="no-financial-advice">
        <LegalHeading id="no-financial-advice">No Financial or Professional Advice</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena is an informational and personal financial management tool. It does not act as a financial adviser,
            investment adviser, broker, bank, lender, accountant, tax adviser, lawyer, or fiduciary.
          </LegalParagraph>
          <LegalParagraph>
            Selena does not recommend, guarantee, or endorse particular investments, financial products, transactions,
            or financial strategies. Summaries, analytics, and AI-generated insights are informational tools, not
            personalized advice.
          </LegalParagraph>
          <LegalParagraph>
            Using Selena does not create any adviser-client, fiduciary, or other professional relationship. Financial
            decisions are yours to make, and you are responsible for them.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="acceptable-use">
        <LegalHeading id="acceptable-use">Acceptable Use</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            You may use Selena only for lawful purposes and in accordance with these Terms. You must not:
          </LegalParagraph>
          <LegalList>
            <li>Attempt to access Selena or another user&apos;s account without authorization.</li>
            <li>Attempt to bypass authentication or security controls.</li>
            <li>Interfere with the operation of Selena, its servers, or connected networks.</li>
            <li>Introduce malicious code or harmful software.</li>
            <li>Attempt to access another user&apos;s information.</li>
            <li>Exploit vulnerabilities for unauthorized purposes.</li>
            <li>
              Scrape or otherwise abuse Selena&apos;s infrastructure in a manner that violates applicable law or
              materially interferes with the service.
            </li>
            <li>Use Selena for fraudulent or unlawful activity.</li>
          </LegalList>
          <LegalParagraph>
            These restrictions are not intended to prohibit responsible, non-destructive security research conducted
            in good faith. If you believe you have found a security issue, please report it to us using the contact
            information below.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="security">
        <LegalHeading id="security">Security</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena implements reasonable technical and organizational security measures appropriate to the service,
            including HTTPS, secure authentication, database access controls, and careful handling of server-side
            credentials.
          </LegalParagraph>
          <LegalParagraph>
            We cannot and do not promise that Selena is completely secure or immune from breaches, attacks, outages,
            or unauthorized access. You are responsible for protecting your credentials and the devices you use to
            access Selena.
          </LegalParagraph>
          <LegalParagraph>
            For more information about how Selena processes and protects personal information, please see our{" "}
            <a href="/privacy" className={privacyLinkClassName}>
              Privacy Policy
            </a>
            .
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="privacy">
        <LegalHeading id="privacy">Privacy</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena&apos;s collection, use, storage, retention, disclosure, and other processing of personal
            information are described in our{" "}
            <a href="/privacy" className={privacyLinkClassName}>
              Privacy Policy
            </a>
            . Please read it carefully — it is an important part of understanding how Selena handles personal
            information.
          </LegalParagraph>
          <LegalParagraph>
            Selena processes personal information in accordance with Philippine law, including Republic Act No. 10173
            (the Data Privacy Act of 2012), its Implementing Rules and Regulations, and applicable issuances and
            guidelines of the National Privacy Commission.
          </LegalParagraph>
          <LegalParagraph>
            These Terms are not a privacy notice. The Privacy Policy is the primary document describing how Selena
            processes personal information. These Terms and the Privacy Policy should be read together and are
            intended to be consistent.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="philippine-law">
        <LegalHeading id="philippine-law">Philippine Law and Regulatory Framework</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena operates subject to the laws of the Republic of the Philippines. Where relevant to Selena&apos;s
            actual activities, the following Philippine legislation and regulations apply:
          </LegalParagraph>
          <LegalList>
            <li>
              Republic Act No. 10173 — the Data Privacy Act of 2012, and its Implementing Rules and Regulations, which
              govern how Selena handles personal information (see the Privacy Policy).
            </li>
            <li>
              Republic Act No. 8792 — the Electronic Commerce Act of 2000, which recognizes the validity of electronic
              transactions and electronic documents, where applicable to your use of Selena.
            </li>
            <li>
              Republic Act No. 7394 — the Consumer Act of the Philippines, which provides consumer protections that
              apply where relevant to your use of Selena.
            </li>
            <li>Other applicable Philippine laws and regulations relevant to Selena&apos;s activities.</li>
          </LegalList>
          <LegalParagraph>
            These laws are referenced only where they genuinely relate to Selena&apos;s activities. Selena does not
            claim blanket compliance with every law; where a specific requirement applies, we work to meet it.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="third-party-services">
        <LegalHeading id="third-party-services">Third-Party Services</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena relies on third-party infrastructure and service providers to operate parts of the application.
            Based on Selena&apos;s current architecture, these include:
          </LegalParagraph>
          <LegalList>
            <li>Supabase, for authentication and database infrastructure.</li>
            <li>Vercel, for application deployment and hosting.</li>
            <li>Groq, for AI processing used by the AI assistant.</li>
          </LegalList>
          <LegalParagraph>
            These companies do not endorse or sponsor Selena, and Selena is not affiliated with them except as a
            customer of their services. Each provider operates under its own terms and policies, which you should
            review where relevant.
          </LegalParagraph>
          <LegalParagraph>
            The way these providers process information in connection with Selena is described in our{" "}
            <a href="/privacy" className={privacyLinkClassName}>
              Privacy Policy
            </a>
            .
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="availability">
        <LegalHeading id="availability">Service Availability and Changes</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We may modify features,
            improve or discontinue functionality, perform maintenance, or make other changes at any time. The service
            may experience interruptions, errors, or technical failures.
          </LegalParagraph>
          <LegalParagraph>
            We do not promise uninterrupted or error-free service. Where practical, we will let you know about
            significant changes or planned maintenance.
          </LegalParagraph>
          <LegalParagraph>
            Selena is currently offered free of charge. These Terms do not create any subscription or payment
            obligation. If paid functionality is introduced in the future, applicable pricing and payment terms will
            be set out in additional terms before you are charged.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="intellectual-property">
        <LegalHeading id="intellectual-property">Intellectual Property</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena owns, or licenses from third parties, the software, branding, logo, website design, interface, and
            other proprietary materials that make up the service, as well as content created by Selena. These are
            protected by intellectual property laws.
          </LegalParagraph>
          <LegalParagraph>
            Using Selena does not transfer ownership of Selena&apos;s software or intellectual property to you. You
            receive a limited right to use the service for your own personal purposes, in accordance with these Terms.
          </LegalParagraph>
          <LegalParagraph>
            At the same time, Selena does not claim ownership of the financial information or other content you enter
            into the service. That information is yours, and your rights over it are not affected by using Selena.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="user-responsibility">
        <LegalHeading id="user-responsibility">User Responsibility</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>You are responsible for:</LegalParagraph>
          <LegalList>
            <li>The accuracy of the information you enter into Selena.</li>
            <li>Reviewing your transactions and balances for correctness.</li>
            <li>Maintaining the security of your account and credentials.</li>
            <li>Using Selena lawfully and in accordance with these Terms.</li>
            <li>Evaluating AI-generated information before acting on it.</li>
          </LegalList>
        </div>
      </LegalSection>

      <LegalSection id="disclaimers">
        <LegalHeading id="disclaimers">Disclaimers</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Except as expressly stated in these Terms or as required by applicable law, Selena provides the service
            &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind, express or implied,
            including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </LegalParagraph>
          <LegalParagraph>This applies, for example, to:</LegalParagraph>
          <LegalList>
            <li>AI-generated information and insights.</li>
            <li>The accuracy of user-entered information.</li>
            <li>Service availability and performance.</li>
            <li>Third-party services used to operate Selena.</li>
            <li>The outcomes of financial decisions you make.</li>
          </LegalList>
          <LegalParagraph>
            These disclaimers do not exclude rights or protections that cannot be waived under applicable Philippine
            law, including mandatory consumer protections.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="limitation-of-liability">
        <LegalHeading id="limitation-of-liability">Limitation of Liability</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            To the maximum extent permitted by applicable law, Selena will not be liable for indirect, incidental,
            special, consequential, or punitive damages, or for lost profits or lost data, arising out of or relating
            to your use of, or inability to use, Selena.
          </LegalParagraph>
          <LegalParagraph>This includes, for example, liability arising from:</LegalParagraph>
          <LegalList>
            <li>Reliance on AI-generated information.</li>
            <li>Incorrect user-entered information.</li>
            <li>Service interruptions.</li>
            <li>Technical errors.</li>
            <li>Third-party service failures.</li>
            <li>Unauthorized access resulting from compromised user credentials.</li>
            <li>The consequences of financial decisions you make.</li>
          </LegalList>
          <LegalParagraph>
            Nothing in these Terms is intended to exclude or limit any liability or rights that cannot lawfully be
            excluded or limited under applicable Philippine law.{" "}
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="indemnification">
        <LegalHeading id="indemnification">Indemnification</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            You agree to indemnify and hold Selena harmless from and against losses, claims, damages, and reasonable
            expenses (including reasonable attorney&apos;s fees) arising out of or relating to:
          </LegalParagraph>
          <LegalList>
            <li>Your unlawful use of Selena.</li>
            <li>Your violation of these Terms.</li>
            <li>Your infringement of the rights of any third party.</li>
          </LegalList>
          <LegalParagraph>
            This obligation is proportionate to the harm you cause and does not apply to circumstances beyond your
            control. Nothing in this section limits Selena&apos;s own obligations under applicable law.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="termination">
        <LegalHeading id="termination">Suspension and Termination</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            Selena may suspend or terminate your access to the service, in whole or in part, where we reasonably
            believe that:
          </LegalParagraph>
          <LegalList>
            <li>You have materially violated these Terms.</li>
            <li>You are abusing the service.</li>
            <li>You are using the service for fraudulent or unlawful activity.</li>
            <li>Your account presents a security risk.</li>
            <li>Termination is necessary to comply with applicable law.</li>
          </LegalList>
          <LegalParagraph>
            Where appropriate and permitted by law, we will make reasonable efforts to notify you before or after
            taking such action.
          </LegalParagraph>
          <LegalParagraph>
            You may stop using Selena at any time. You can delete your account from the Settings page in the
            application.
          </LegalParagraph>
          <LegalParagraph>
            When an account is deleted, the information associated with it is deleted, consistent with the practices
            described in our Privacy Policy. We do not promise that deletion is immediate or that records we are
            legally required to retain are removed.{" "}
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="changes">
        <LegalHeading id="changes">Changes to These Terms</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            We may update these Terms from time to time to reflect changes in the service, our practices, or
            applicable law. When we make material changes, we will update the &ldquo;Last Updated&rdquo; date at the
            top of this page and take reasonable steps to bring the changes to your attention, such as a notice within
            the application.
          </LegalParagraph>
          <LegalParagraph>
            Where legally appropriate, continued use of Selena after the effective date of updated Terms may
            constitute acceptance of the changes.
          </LegalParagraph>
          <LegalParagraph>We will not apply changes retroactively where prohibited by applicable law.</LegalParagraph>
          <p className="text-base text-muted-foreground sm:text-lg">
            Last Updated: <time dateTime="2026-08-14">{LAST_UPDATED}</time>
          </p>
        </div>
      </LegalSection>

      <LegalSection id="governing-law">
        <LegalHeading id="governing-law">Governing Law and Dispute Resolution</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>
            These Terms are governed by the laws of the Republic of the Philippines, subject to applicable mandatory
            legal protections.
          </LegalParagraph>
          <LegalParagraph>
            We will first seek to resolve any dispute arising out of or relating to these Terms through good-faith
            discussion. If a dispute cannot be resolved informally, it may be brought in the appropriate courts of the
            Republic of the Philippines.{" "}
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="severability">
        <LegalHeading id="severability">Severability</LegalHeading>
        <div className="mt-5">
          <LegalParagraph>
            If any provision of these Terms is found to be invalid or unenforceable, that provision will be modified
            to the minimum extent necessary to make it valid and enforceable, or severed if it cannot be modified, and
            the remaining provisions will remain in full force and effect.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="entire-agreement">
        <LegalHeading id="entire-agreement">Entire Agreement</LegalHeading>
        <div className="mt-5">
          <LegalParagraph>
            These Terms, together with any documents expressly incorporated by reference — particularly the Privacy
            Policy — constitute the entire agreement between you and Selena regarding your use of the service, subject
            to applicable law. They replace any prior agreements or understandings, whether written or oral.
          </LegalParagraph>
        </div>
      </LegalSection>

      <LegalSection id="contact">
        <LegalHeading id="contact">Contact Information</LegalHeading>
        <div className="mt-5 space-y-5">
          <LegalParagraph>Questions about these Terms, or anything else regarding Selena?</LegalParagraph>
          <address className="space-y-2 rounded-2xl border border-border bg-card p-5 text-base leading-7 text-muted-foreground not-italic sm:text-lg sm:leading-8">
            <p>
              Email: <Placeholder>luislabapis@gmail.com</Placeholder>
            </p>
          </address>
          <p className="text-base font-medium leading-8 text-foreground sm:text-lg">
            By using Selena, you acknowledge that you have read and understood these Terms of Service and agree to be
            bound by them.
          </p>
        </div>
      </LegalSection>
    </LegalDocument>
  );
}
