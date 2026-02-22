'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BidForm({ projectId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ amount: '', deliveryDays: '', proposal: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit bid')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Submit Your Bid</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Bid Amount ($)</label>
            <input
              type="number"
              required
              min="1"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery (Days)</label>
            <input
              type="number"
              required
              min="1"
              value={form.deliveryDays}
              onChange={e => setForm(f => ({ ...f, deliveryDays: e.target.value }))}
              placeholder="e.g. 7"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proposal</label>
          <textarea
            required
            rows={5}
            value={form.proposal}
            onChange={e => setForm(f => ({ ...f, proposal: e.target.value }))}
            placeholder="Describe your approach, relevant experience, and why you're the best fit..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
          {loading ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  )
}
