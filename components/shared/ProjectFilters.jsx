'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProjectFilters({ categories }) {
  const router = useRouter()
  const sp = useSearchParams()

  function updateFilter(key, value) {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <aside className="w-64 shrink-0 space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !sp.get('category') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}>
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sp.get('category') === cat ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Budget Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min ($)"
            defaultValue={sp.get('minBudget') || ''}
            onBlur={e => updateFilter('minBudget', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max ($)"
            defaultValue={sp.get('maxBudget') || ''}
            onBlur={e => updateFilter('maxBudget', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </aside>
  )
}
