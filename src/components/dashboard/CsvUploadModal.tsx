'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
}

const REQUIRED = ['debtor_name', 'debtor_email', 'amount_owed', 'due_date']

export function CsvUploadModal({ onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  function parseFile(file: File) {
    setError('')
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const cols = results.meta.fields ?? []
        const missing = REQUIRED.filter(r => !cols.includes(r))
        if (missing.length) {
          setError(`Missing required columns: ${missing.join(', ')}`)
          return
        }
        setHeaders(cols)
        setRows(results.data)
      },
      error(err) {
        setError(`Parse error: ${err.message}`)
      },
    })
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  async function handleUpload() {
    if (!rows.length) return
    setUploading(true)
    setError('')
    try {
      const res = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Upload failed')
        return
      }
      router.refresh()
      onClose()
    } catch {
      setError('Network error — please try again')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Import Invoices from CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Required columns note */}
          <p className="text-sm text-gray-500">
            Required columns: <code className="text-xs bg-gray-100 px-1 rounded">debtor_name</code>,{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">debtor_email</code>,{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">amount_owed</code>,{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">due_date</code> (YYYY-MM-DD).
            Optional: <code className="text-xs bg-gray-100 px-1 rounded">debtor_company</code>,{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">debtor_phone</code>,{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">invoice_number</code>.
          </p>

          {/* Drop zone */}
          {!rows.length && (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
                cursor-pointer py-12 transition-colors
                ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
            >
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-600">Drop CSV here or click to browse</p>
              <input ref={inputRef} type="file" accept=".csv" onChange={onFileChange} className="hidden" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{rows.length} invoices ready to import</p>
                <button
                  onClick={() => { setRows([]); setHeaders([]); setError('') }}
                  className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-48 overflow-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      {headers.map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {headers.map(h => (
                          <td key={h} className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-[160px] truncate">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length > 10 && (
                      <tr>
                        <td colSpan={headers.length} className="px-3 py-2 text-gray-400 text-center">
                          + {rows.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!rows.length || uploading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Importing…' : `Import ${rows.length || ''} invoices`}
          </button>
        </div>
      </div>
    </div>
  )
}
