import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-3xl font-bold text-gray-900">
          Pay<span className="text-blue-600">Pilot</span>
        </Link>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h1>
          <p className="mt-3 text-gray-500">
            Your PayPilot subscription is active. Time to start recovering those invoices.
          </p>

          <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-4 text-left">
            <p className="text-sm font-semibold text-green-800">What&apos;s next:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-green-700">
              <li>→ Import your overdue invoices via CSV</li>
              <li>→ Connect your Xero account to sync automatically</li>
              <li>→ PayPilot will start chasing within 24 hours</li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold
                       text-white hover:bg-blue-700 transition-colors text-center"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
