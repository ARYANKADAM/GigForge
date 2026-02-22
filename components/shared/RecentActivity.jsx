import { formatCurrency, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function RecentActivity({ items, role }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">
          {role === 'client' ? 'Recent Projects' : 'Recent Bids'}
        </h2>
        <Link href={role === 'client' ? '/dashboard/projects' : '/dashboard/bids'}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {items?.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            No activity yet. {role === 'client' ? 'Post your first project!' : 'Browse projects to start bidding!'}
          </div>
        )}
        {items?.map((item) => (
          <div key={item._id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {role === 'client' ? item.title : item.projectId?.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {role === 'client' && (
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(item.budget ?? item.budgetMin)}
                    {item.budgetMin && item.budgetMax ? ` - ${formatCurrency(item.budgetMax)}` : ''}
                  </span>
                )}
                {role === 'developer' && (
                  <span className="text-sm font-medium text-blue-600">
                    {formatCurrency(item.amount)}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                  item.status === 'open' || item.status === 'pending'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'in_progress' || item.status === 'accepted'
                    ? 'bg-blue-100 text-blue-700'
                    : item.status === 'completed'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {item.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
