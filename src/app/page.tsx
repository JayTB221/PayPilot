import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            Pay<span className="text-blue-600">Pilot</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
          🇳🇿 Built for New Zealand small businesses
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
          Stop chasing invoices.<br />
          <span className="text-blue-600">Let AI do it for you.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          PayPilot automatically sends personalised, professional follow-up emails and SMS messages
          to overdue clients — so you get paid faster without the awkward conversations.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start recovering invoices →
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Log in
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">$400 NZD/month · Cancel anytime · No lock-in</p>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-y border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '3.2×', label: 'faster invoice recovery' },
            { value: '94%', label: 'of clients pay within 2 contacts' },
            { value: '4 hrs', label: 'saved per week on average' },
            { value: '$18k', label: 'average recovered in first month' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-blue-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How PayPilot works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Import your invoices',
              body: 'Upload a CSV or connect your Xero account. PayPilot syncs all overdue invoices automatically.',
              icon: '📂',
            },
            {
              step: '02',
              title: 'AI writes personalised follow-ups',
              body: 'Our AI crafts friendly, firm, and professional messages — adapting the tone based on how overdue the invoice is.',
              icon: '✍️',
            },
            {
              step: '03',
              title: 'Get paid. Automatically.',
              body: 'PayPilot tracks every contact, logs replies, and escalates when needed — all without you lifting a finger.',
              icon: '💸',
            },
          ].map(item => (
            <div key={item.step} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step {item.step}</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to get paid
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI-powered messages', body: 'Personalised email and SMS — not templates. Each message feels human.' },
              { icon: '🔗', title: 'Xero integration', body: 'Syncs overdue invoices directly from your Xero account in real time.' },
              { icon: '📊', title: 'Recovery dashboard', body: 'See every outstanding invoice, chase history, and recovery rate at a glance.' },
              { icon: '⏱️', title: 'Automated follow-ups', body: 'Set-and-forget escalation — PayPilot contacts clients on a smart schedule.' },
              { icon: '📨', title: 'Email + SMS chasing', body: 'Reaches clients on the channel they respond to. SMS for the hard ones.' },
              { icon: '📋', title: 'Full audit trail', body: 'Every message sent, every reply received — all logged for your records.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, flat-rate pricing</h2>
        <p className="text-gray-500 mb-10">One plan. Everything included. No per-invoice fees.</p>

        <div className="inline-block rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-xl text-left max-w-sm w-full">
          <p className="text-4xl font-extrabold text-gray-900">$400 <span className="text-lg font-medium text-gray-400">NZD/mo</span></p>
          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            {[
              'Unlimited invoices tracked',
              'AI email + SMS follow-ups',
              'Xero sync',
              'Full chase history & audit log',
              'Dashboard analytics',
              'Cancel anytime',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-blue-500 font-bold">✓</span> {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-8 block rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to stop leaving money on the table?</h2>
          <p className="mt-4 text-blue-100">
            Join NZ small businesses using PayPilot to recover invoices on autopilot.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Start your free trial →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>Pay<span className="text-blue-600">Pilot</span> © 2026. Made in New Zealand.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-gray-600">Log in</Link>
            <Link href="/signup" className="hover:text-gray-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
