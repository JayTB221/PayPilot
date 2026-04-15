import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PayPilot — AI-Powered Invoice Recovery',
  description:
    'Automatically chase unpaid invoices with personalised AI-written emails and SMS messages. Built for New Zealand small businesses.',
  openGraph: {
    title: 'PayPilot — AI-Powered Invoice Recovery',
    description:
      'Stop chasing invoices manually. PayPilot uses AI to recover your money on autopilot.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
