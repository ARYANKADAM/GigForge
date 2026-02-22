'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProjectActions({ projectId, isModerated }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleModerate() {
    setLoading(true)
    try {
      await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, isModerated: !isModerated }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={toggleModerate} disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isModerated
        ? 'bg-green-100 hover:bg-green-200 text-green-700'
        : 'bg-red-100 hover:bg-red-200 text-red-700'}`}>
      {loading ? '...' : isModerated ? 'Restore' : 'Remove'}
    </button>
  )
}
