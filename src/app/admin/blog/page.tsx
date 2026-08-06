'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Sparkles, Plus, ExternalLink, Trash2, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'

interface Post {
  id: string
  slug: string
  title: string
  status: string
  ai_generated: boolean
  published_at: string | null
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blog')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function action(kind: 'seed' | 'generate') {
    setBusy(kind)
    setMsg(null)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: kind }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error([data.error, data.detail].filter(Boolean).join(' — '))
      setMsg(kind === 'seed' ? `Published ${data.seeded} starter articles.` : `Generated: "${data.post?.title}"`)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  async function toggle(p: Post) {
    setBusy(p.id)
    try {
      await fetch(`/api/blog/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: p.status === 'published' ? 'draft' : 'published' }),
      })
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function remove(p: Post) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    setBusy(p.id)
    try {
      await fetch(`/api/blog/${p.id}`, { method: 'DELETE' })
      await load()
    } finally {
      setBusy(null)
    }
  }

  const published = posts.filter((p) => p.status === 'published').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog &amp; SEO Articles</h1>
          <p className="mt-1 text-sm text-gray-500">
            {published} published · new articles auto-publish weekly to grow search traffic
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => action('seed')}
            disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-50"
          >
            {busy === 'seed' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Publish 10 starter articles
          </button>
          <button
            onClick={() => action('generate')}
            disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {busy === 'generate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate one now (AI)
          </button>
        </div>
      </div>

      {msg && <div className="rounded-lg bg-teal-50 px-4 py-2 text-sm text-teal-800">{msg}</div>}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 shrink-0" />
        The system automatically writes &amp; publishes a fresh, resort-focused article every week. You can unpublish or delete any article below at any time.
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText className="mb-3 h-8 w-8 text-gray-400" />
            <h3 className="font-semibold text-gray-900">No articles yet</h3>
            <p className="mt-1 text-sm text-gray-500">Click &ldquo;Publish 10 starter articles&rdquo; to get indexed content live now.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Source</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.ai_generated ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.ai_generated ? 'AI' : 'Curated'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View" className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-teal-700">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => toggle(p)} disabled={busy === p.id} title={p.status === 'published' ? 'Unpublish' : 'Publish'} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-700">
                        {p.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => remove(p)} disabled={busy === p.id} title="Delete" className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
