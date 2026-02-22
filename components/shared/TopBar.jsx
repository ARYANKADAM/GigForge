'use client'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'

export default function TopBar({ user }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, developers..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="text-sm text-slate-600">
          {user.firstName} {user.lastName}
        </div>
      </div>
    </header>
  )
}
