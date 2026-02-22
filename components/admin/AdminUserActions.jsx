'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUserActions({ userId, isBanned }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleBan() {
    setLoading(true)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !isBanned }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={toggleBan} disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isBanned
        ? 'bg-green-100 hover:bg-green-200 text-green-700'
        : 'bg-red-100 hover:bg-red-200 text-red-700'}`}>
      {loading ? '...' : isBanned ? 'Unban' : 'Ban'}
    </button>
  )
}
