'use client'

import { useState } from 'react'
import { AriaAvatar } from '@/components/AriaAvatar'
import { CsvUploadModal } from './CsvUploadModal'

interface Props {
  isXeroConnected: boolean
}

export function DashboardActions({ isXeroConnected }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {isXeroConnected ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-purple-700">Aria is active</span>
          </div>
        ) : (
          <a
            href="/api/xero/auth"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <AriaAvatar size="xs" />
            Connect Xero
          </a>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Add Invoices
        </button>
      </div>

      {showModal && <CsvUploadModal onClose={() => setShowModal(false)} />}
    </>
  )
}
