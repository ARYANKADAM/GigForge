'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default function ReleasePaymentButton({ contractId, amount }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRelease() {
    if (!confirm(`Release ${formatCurrency(amount)} to the developer? This cannot be undone.`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/payments/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRelease}
      disabled={loading}
      className="text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
      {loading ? 'Processing...' : `✓ Release Payment (${formatCurrency(amount)})`}
    </button>
  )
}
