'use client'
import { useState } from 'react'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function BidsList({ bids, projectId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(null)

  async function acceptBid(bidId) {
    if (!confirm('Accept this bid? This will lock the project and initiate payment.')) return
    setLoading(bidId)
    try {
      const res = await fetch(`/api/bids/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.paymentUrl) window.location.href = data.paymentUrl
      else router.refresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(null)
    }
  }

  if (bids.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
      No bids yet. Check back soon!
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-5 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">Bids ({bids.length})</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {bids.map((bid) => (
          <div key={bid._id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {bid.developerId?.imageUrl ? (
                  <img src={bid.developerId.imageUrl} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {bid.developerId?.firstName?.[0]}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">
                    {bid.developerId?.firstName} {bid.developerId?.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{'★'.repeat(Math.round(bid.developerId?.averageRating || 0))} ({bid.developerId?.totalReviews || 0})</span>
                    <span>•</span>
                    <span>{timeAgo(bid.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600 text-lg">{formatCurrency(bid.amount)}</div>
                <div className="text-xs text-slate-400">{bid.deliveryDays} days delivery</div>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-3 line-clamp-3">{bid.proposal}</p>
            <div className="flex items-center gap-2">
              {bid.status === 'pending' && (
                <button
                  onClick={() => acceptBid(bid._id)}
                  disabled={loading === bid._id}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition-colors font-medium">
                  {loading === bid._id ? 'Processing...' : 'Accept & Pay'}
                </button>
              )}
              {bid.status === 'accepted' && (
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                  ✓ Accepted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
