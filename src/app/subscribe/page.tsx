// Shown when user is authenticated but subscription is inactive
export default function SubscribePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Required</h1>
        <p className="mt-2 text-gray-600">
          A PayPilot subscription is required to access the dashboard.
        </p>
      </div>
    </main>
  )
}
