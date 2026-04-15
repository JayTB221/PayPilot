// Temporary placeholder — full landing page built in Step 8
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Pay<span className="text-blue-600">Pilot</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          AI-Powered Invoice Recovery for Small Businesses
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </main>
  )
}
