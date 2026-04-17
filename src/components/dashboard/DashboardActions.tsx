'use client'

import { useState } from 'react'
import { CsvUploadModal } from './CsvUploadModal'

interface Props {
  isXeroConnected: boolean
}

export function DashboardActions({ isXeroConnected }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex gap-3">
        {isXeroConnected ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Xero connected
          </span>
        ) : (
          <a
            href="/api/xero/auth"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Connect Xero
          </a>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Add Invoices
        </button>
      </div>

      {showModal && <CsvUploadModal onClose={() => setShowModal(false)} />}
    </>
  )
}
