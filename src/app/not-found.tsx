'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-8xl font-extrabold bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent mb-6">
            404
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl font-bold text-white mb-3">
            This page flew off course
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Your invoices are safe — let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Back to home
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <Link href="/" className="text-sm font-bold text-white">
            Pay<span className="text-blue-400">Pilot</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
