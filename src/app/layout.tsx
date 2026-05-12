import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Suspense } from 'react'
import { PostHogProvider } from '@/components/PostHogProvider'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'PayPilot — AI-Powered Invoice Recovery',
  description:
    'Automatically chase unpaid invoices with personalised AI-written emails and SMS. Stop chasing — let AI recover your money on autopilot.',
  openGraph: {
    title: 'PayPilot — AI-Powered Invoice Recovery',
    description:
      'Stop chasing invoices manually. PayPilot uses AI to recover your money on autopilot.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Suspense>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
