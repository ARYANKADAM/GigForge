import { formatCurrency } from '@/lib/utils'
import { TrendingUp, DollarSign, FileText, Clock } from 'lucide-react'

export default function DashboardStats({ stats, role }) {
  const clientStats = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FileText, color: 'blue' },
    { label: 'Open Projects', value: stats.openProjects, icon: Clock, color: 'amber' },
    { label: 'Active Contracts', value: stats.activeContracts, icon: TrendingUp, color: 'green' },
    { label: 'Total Spent', value: formatCurrency(stats.totalSpent || 0), icon: DollarSign, color: 'purple' },
  ]

  const devStats = [
    { label: 'Total Bids', value: stats.totalBids, icon: FileText, color: 'blue' },
    { label: 'Active Bids', value: stats.activeBids, icon: Clock, color: 'amber' },
    { label: 'Active Contracts', value: stats.activeContracts, icon: TrendingUp, color: 'green' },
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings || 0), icon: DollarSign, color: 'purple' },
  ]

  const items = role === 'client' ? clientStats : devStats
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">{label}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{value ?? 0}</div>
        </div>
      ))}
    </div>
  )
}
