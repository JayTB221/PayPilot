import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: {updated}</p>

          <div className="prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed space-y-8">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using PayPilot (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are using PayPilot on behalf of a business, you represent that you have authority to bind that business to these Terms. If you do not agree, do not use the Service.</p>
              <p className="mt-3">These Terms are governed by the laws of the State of Delaware, United States, with secondary compliance with New Zealand law for users in New Zealand.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>PayPilot is a B2B SaaS platform that uses artificial intelligence to automatically generate and send invoice follow-up communications (email and SMS) to your business&apos;s debtors. The Service connects to your accounting software (Xero, QuickBooks) or accepts manual invoice data to identify overdue amounts and initiate recovery communications.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Subscription and Payment</h2>
              <p>PayPilot is offered on subscription plans billed monthly or annually. Prices are in USD unless otherwise specified. Subscriptions automatically renew until cancelled. You may cancel at any time through your account settings; access continues until the end of the current billing period.</p>
              <p className="mt-3">We reserve the right to change pricing with 30 days&apos; notice. Continued use after a price change constitutes acceptance of the new pricing.</p>
              <p className="mt-3">Payments are processed by Stripe. You authorise us to charge your payment method on the schedule chosen at signup.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
              <p>You agree to use PayPilot only to recover legitimate outstanding invoices owed to your business. You must not use the Service to:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>Harass, threaten, or intimidate any individual</li>
                <li>Send communications that are false, misleading, or unlawful</li>
                <li>Violate any applicable debt collection law, including the Fair Debt Collection Practices Act (FDCPA) in the US or the Credit Contracts and Consumer Finance Act (CCCFA) in New Zealand</li>
                <li>Process personal data of individuals in a way that violates applicable privacy law</li>
                <li>Attempt to reverse-engineer or extract the underlying AI models or infrastructure</li>
                <li>Resell or white-label the Service without written permission</li>
              </ul>
              <p className="mt-3">You are solely responsible for ensuring your use of the Service complies with applicable debt collection and consumer protection laws in your jurisdiction.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Your Data</h2>
              <p>You retain all rights to your business data and debtor data uploaded to PayPilot. By using the Service, you grant us a limited licence to process that data solely to deliver the Service. We act as a data processor for debtor personal information — you remain the data controller.</p>
              <p className="mt-3">You represent that you have obtained all necessary consents and have a lawful basis to share debtor contact information with us for the purpose of invoice recovery.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. AI-Generated Content</h2>
              <p>PayPilot uses Claude (Anthropic) to generate follow-up messages on your behalf. While we work to ensure messages are professional and appropriate, AI-generated content may occasionally be imperfect. You are responsible for reviewing the chase strategy settings and acknowledging that messages are sent automatically based on your configuration.</p>
              <p className="mt-3">PayPilot is not a debt collection agency and does not provide legal advice.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Plan Limits and Usage</h2>
              <p>Each subscription plan includes a monthly invoice chase limit. Exceeding your plan&apos;s limit will pause automatic chasing until the next billing cycle or until you upgrade. You may view your current usage in the dashboard.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Uptime and Service Availability</h2>
              <p>We target 99.5% monthly uptime for the dashboard and API. Scheduled maintenance will be announced in advance where possible. We are not liable for losses resulting from downtime, although we will make reasonable efforts to minimise disruptions.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, PayPilot&apos;s total liability for any claim arising from your use of the Service shall not exceed the greater of (a) the amount you paid in the 3 months preceding the claim, or (b) $100 USD.</p>
              <p className="mt-3">We are not liable for indirect, incidental, consequential, or punitive damages, including loss of revenue, lost profits, or loss of data, even if advised of the possibility of such damages.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Termination</h2>
              <p>We reserve the right to suspend or terminate your account if you breach these Terms, engage in fraudulent activity, or if required by law. You may terminate your account at any time. Upon termination, your right to use the Service ceases immediately.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
              <p>We may update these Terms from time to time. We will provide at least 14 days&apos; notice of material changes via email or in-app notification. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Governing Law and Disputes</h2>
              <p>These Terms are governed by and construed in accordance with the laws of the State of Delaware, USA, without regard to conflict of law principles. Any disputes shall be resolved by binding arbitration administered by JAMS, except either party may seek injunctive relief in any court of competent jurisdiction.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Contact</h2>
              <p>For legal inquiries: <a href="mailto:legal@paypilot.app" className="text-blue-600 hover:underline">legal@paypilot.app</a></p>
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
