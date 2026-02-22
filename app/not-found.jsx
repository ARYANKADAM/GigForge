import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  )
}
