import Link from 'next/link'
import { resendConfirmation } from '@/app/actions/auth'

interface Props {
  searchParams: Promise<{ email?: string; resent?: string }>
}

export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { email, resent } = await searchParams
  const displayEmail = email ? decodeURIComponent(email) : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            Pay<span className="text-blue-600">Pilot</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-3xl">
            ✉️
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-2">Your email is on its way</h1>

          {displayEmail ? (
            <p className="text-sm text-gray-500 mb-1">
              We sent a confirmation link to
            </p>
          ) : null}
          {displayEmail && (
            <p className="text-sm font-medium text-gray-900 mb-5">{displayEmail}</p>
          )}
          {!displayEmail && (
            <p className="text-sm text-gray-500 mb-5">
              Check your inbox for a confirmation link to activate your account.
            </p>
          )}

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Click the link in the email to confirm your account and get started.
            The link expires in 24 hours.
          </p>

          {resent && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Confirmation email resent successfully.
            </div>
          )}

          {displayEmail && (
            <form action={resendConfirmation} className="mb-4">
              <input type="hidden" name="email" value={displayEmail} />
              <button
                type="submit"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Resend confirmation email
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400">
            Wrong email?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">Sign up again</Link>
            {' '}·{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Check your spam folder if you don&apos;t see the email within a few minutes.
        </p>
      </div>
    </main>
  )
}
