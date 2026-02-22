import connectDB from '@/lib/db'
import User from '@/models/User'
import AdminUserActions from '@/components/admin/AdminUserActions'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  await connectDB()
  const users = await User.find().sort({ createdAt: -1 }).lean()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">User</th>
              <th className="text-left p-4 font-medium text-slate-600">Role</th>
              <th className="text-left p-4 font-medium text-slate-600">Joined</th>
              <th className="text-left p-4 font-medium text-slate-600">Status</th>
              <th className="text-left p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => {
              const u = JSON.parse(JSON.stringify(user))
              return (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.imageUrl && <img src={u.imageUrl} alt="" className="w-8 h-8 rounded-full" />}
                      <div>
                        <div className="font-medium text-slate-900">{u.firstName} {u.lastName}</div>
                        <div className="text-slate-400 text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs capitalize">{u.role}</span>
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <AdminUserActions userId={u._id} isBanned={u.isBanned} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
