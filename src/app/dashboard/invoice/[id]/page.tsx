// Full implementation in Step 10
export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Invoice detail for {id} — coming in Step 10</p>
    </main>
  )
}
