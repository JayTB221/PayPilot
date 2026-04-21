import Link from 'next/link'

export default function PrivacyPage() {
  const updated = 'April 21, 2026'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Pay<span className="text-blue-600">Pilot</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to home</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: {updated}</p>

          <div className="prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed space-y-8">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>PayPilot (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an AI-powered invoice recovery service operated as a B2B SaaS platform. This Privacy Policy describes how we collect, use, disclose, and safeguard information when you use our platform. Our primary market is the United States, with secondary operations in New Zealand.</p>
              <p className="mt-3">By using PayPilot, you agree to the collection and use of information in accordance with this policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <h3 className="font-semibold text-gray-800 mb-2">2.1 Account information</h3>
              <p>When you create an account, we collect your name, business name, email address, and password. This is used to authenticate your account and personalise your experience.</p>
              <h3 className="font-semibold text-gray-800 mb-2 mt-4">2.2 Invoice and debtor data</h3>
              <p>Our core function requires processing information about your clients (debtors), including names, email addresses, phone numbers, company names, and invoice details (amounts, due dates, invoice numbers). This data is provided by you and is processed solely to deliver the service.</p>
              <h3 className="font-semibold text-gray-800 mb-2 mt-4">2.3 Xero integration data</h3>
              <p>If you connect your Xero account, we store OAuth access tokens and retrieve overdue invoice data from Xero on your behalf. We do not store payment card data.</p>
              <h3 className="font-semibold text-gray-800 mb-2 mt-4">2.4 Usage data</h3>
              <p>We collect logs of actions taken within the platform (chase history, email/SMS delivery status) and basic analytics data including page views and feature usage via PostHog.</p>
              <h3 className="font-semibold text-gray-800 mb-2 mt-4">2.5 Payment data</h3>
              <p>Subscription payments are processed by Stripe. We store your Stripe customer ID but never your full card details — those remain with Stripe under their PCI-DSS-compliant infrastructure.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To provide, operate, and improve the PayPilot service</li>
                <li>To generate and send AI-written invoice follow-up emails and SMS messages to your debtors on your behalf</li>
                <li>To process subscription payments via Stripe</li>
                <li>To sync invoice data from third-party integrations (Xero)</li>
                <li>To send you service notifications and weekly summary emails</li>
                <li>To detect abuse and enforce our Terms of Service</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Processors and Third Parties</h2>
              <p>We share data only with the following service providers, under data processing agreements:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li><strong>Supabase</strong> — database and authentication infrastructure (hosted on AWS)</li>
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>Anthropic (Claude API)</strong> — AI generation of follow-up message content</li>
                <li><strong>Resend</strong> — transactional email delivery</li>
                <li><strong>Twilio / SMS provider</strong> — SMS delivery for follow-up messages</li>
                <li><strong>Xero</strong> — accounting data integration (when connected by you)</li>
                <li><strong>PostHog</strong> — product analytics</li>
                <li><strong>Vercel</strong> — hosting and serverless compute</li>
              </ul>
              <p className="mt-3">We do not sell your data or your debtors&apos; data to any third party.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Debtor Data</h2>
              <p>When PayPilot contacts your debtors, it acts as a data processor on your behalf. You are the data controller for your debtors&apos; personal information. You represent that you have a lawful basis (contractual obligation) to share debtor contact information with us for the purpose of invoice recovery.</p>
              <p className="mt-3">Debtor emails and SMS messages sent by PayPilot include contact information for your business so debtors can respond directly.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h2>
              <p>We retain your account data for as long as your account is active. Chase logs and invoice history are retained for 7 years to support audit requirements. Upon account cancellation, you may request deletion of your data within 30 days of termination, subject to applicable legal retention requirements.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Security</h2>
              <p>We implement industry-standard security practices including TLS encryption in transit, encrypted storage at rest via Supabase, row-level security policies, and Stripe for PCI-compliant payment handling. Access to production systems is restricted and audited.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have rights to access, correct, delete, or export your personal data. To exercise these rights, contact us at <a href="mailto:privacy@paypilot.app" className="text-blue-600 hover:underline">privacy@paypilot.app</a>. We will respond within 30 days.</p>
              <p className="mt-3">If you are in the European Economic Area or United Kingdom, you have additional rights under GDPR/UK GDPR. If you are in California, you have rights under CCPA.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies</h2>
              <p>We use essential cookies for authentication sessions (via Supabase). We use analytics cookies via PostHog. No advertising or tracking cookies are used. You may disable non-essential cookies in your browser settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or via an in-app notification at least 14 days before the change takes effect.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
              <p>For privacy inquiries: <a href="mailto:privacy@paypilot.app" className="text-blue-600 hover:underline">privacy@paypilot.app</a></p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 px-6 text-center text-sm text-gray-400">
        <Link href="/" className="font-bold text-gray-700 hover:text-gray-900">Pay<span className="text-blue-600">Pilot</span></Link>
        {' '}·{' '}
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        {' '}·{' '}
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
      </footer>
    </div>
  )
}
