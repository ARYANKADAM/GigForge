import connectDB from '@/lib/db'
import Project from '@/models/Project'
import AdminProjectActions from '@/components/admin/AdminProjectActions'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  await connectDB()
  const projects = await Project.find().populate('clientId', 'firstName lastName').sort({ createdAt: -1 }).lean()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Project Moderation</h1>
      <div className="space-y-3">
        {projects.map(project => {
          const p = JSON.parse(JSON.stringify(project))
          return (
            <div key={p._id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{p.title}</h3>
                    {p.isModerated && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Moderated</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{p.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>By {p.clientId?.firstName} {p.clientId?.lastName}</span>
                    <span>{formatDate(p.createdAt)}</span>
                    <span>{formatCurrency(p.budget ?? p.budgetMin ?? 0)}</span>
                    <span className="capitalize">{p.status}</span>
                  </div>
                </div>
                <AdminProjectActions projectId={p._id} isModerated={p.isModerated} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
