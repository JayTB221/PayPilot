import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'

interface Props {
  searchParams: Promise<{ sent?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { sent } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            Pay<span className="text-blue-600">Pilot</span>
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Password reset</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-3xl">
                📧
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We&apos;ve sent a password reset link to your email address. Click the link in the email to set a new password.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Didn&apos;t receive it? Check your spam folder, or{' '}
                <Link href="/forgot-password" className="text-blue-600 hover:underline">try again</Link>.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Forgot your password?</h1>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form action={requestPasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@yourbusiness.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold
                             text-white hover:bg-blue-700 transition-colors"
                >
                  Send reset link
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remember it?{' '}
                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
