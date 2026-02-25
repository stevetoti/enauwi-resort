'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BarChart3,
  TrendingUp,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
  RefreshCw,
  AlertCircle,
  Eye,
  MousePointer,
  Target,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface SEOSettings {
  id: string
  google_search_console_connected: boolean
  google_analytics_connected: boolean
  gsc_property_url: string | null
  ga_property_id: string | null
  meta_title: string | null
  meta_description: string | null
  updated_at: string
}

// Mock data for demonstration
const MOCK_SEARCH_CONSOLE_DATA = {
  clicks: 1247,
  impressions: 45892,
  ctr: 2.72,
  position: 18.4,
  topQueries: [
    { query: 'enauwi resort', clicks: 342, impressions: 1245, ctr: 27.5, position: 2.1 },
    { query: 'vanuatu beach resort', clicks: 186, impressions: 5632, ctr: 3.3, position: 12.4 },
    { query: 'efate island accommodation', clicks: 124, impressions: 2341, ctr: 5.3, position: 8.7 },
    { query: 'vanuatu family resort', clicks: 98, impressions: 3421, ctr: 2.9, position: 15.2 },
    { query: 'port vila resort', clicks: 87, impressions: 4521, ctr: 1.9, position: 22.1 },
  ],
  topPages: [
    { page: '/', clicks: 523, impressions: 12453, ctr: 4.2, position: 8.3 },
    { page: '/activities', clicks: 234, impressions: 5632, ctr: 4.2, position: 11.5 },
    { page: '/book', clicks: 187, impressions: 3421, ctr: 5.5, position: 6.2 },
    { page: '/contact', clicks: 145, impressions: 2341, ctr: 6.2, position: 4.8 },
  ],
}

const MOCK_ANALYTICS_DATA = {
  users: 3842,
  sessions: 5234,
  pageviews: 15678,
  bounceRate: 42.3,
  avgSessionDuration: '2:34',
  trafficSources: [
    { source: 'Organic Search', sessions: 2341, percentage: 44.7 },
    { source: 'Direct', sessions: 1456, percentage: 27.8 },
    { source: 'Social', sessions: 876, percentage: 16.7 },
    { source: 'Referral', sessions: 421, percentage: 8.0 },
    { source: 'Email', sessions: 140, percentage: 2.7 },
  ],
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'search-console', label: 'Search Console', icon: Search },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function SEOHubPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [settings, setSettings] = useState<SEOSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Edit states
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/seo')
      if (!res.ok) throw new Error('Failed to fetch SEO settings')
      const data = await res.json()
      setSettings(data)
      setEditTitle(data?.meta_title || '')
      setEditDescription(data?.meta_description || '')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: editTitle,
          meta_description: editDescription,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save settings')
      
      const data = await res.json()
      setSettings(data)
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-teal-600" />
            SEO Hub
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor search performance and optimize your website
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Connection Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Search Console */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Search Console</h3>
                    <p className="text-sm text-gray-500">Search performance data</p>
                  </div>
                </div>
                {settings?.google_search_console_connected ? (
                  <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <XCircle className="h-4 w-4" />
                    Not Connected
                  </span>
                )}
              </div>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                {settings?.google_search_console_connected ? 'View Dashboard' : 'Connect Account'}
              </button>
            </div>

            {/* Google Analytics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Analytics</h3>
                    <p className="text-sm text-gray-500">Website traffic data</p>
                  </div>
                </div>
                {settings?.google_analytics_connected ? (
                  <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <XCircle className="h-4 w-4" />
                    Not Connected
                  </span>
                )}
              </div>
              <button className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors">
                {settings?.google_analytics_connected ? 'View Dashboard' : 'Connect Account'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-teal-100 text-sm mb-1">
                <MousePointer className="h-4 w-4" />
                Clicks (30d)
              </div>
              <div className="text-3xl font-bold">{MOCK_SEARCH_CONSOLE_DATA.clicks.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-teal-100 mt-1">
                <ArrowUp className="h-3 w-3" />
                +12.4%
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                <Eye className="h-4 w-4" />
                Impressions (30d)
              </div>
              <div className="text-3xl font-bold">{MOCK_SEARCH_CONSOLE_DATA.impressions.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-blue-100 mt-1">
                <ArrowUp className="h-3 w-3" />
                +8.7%
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-purple-100 text-sm mb-1">
                <Target className="h-4 w-4" />
                CTR
              </div>
              <div className="text-3xl font-bold">{MOCK_SEARCH_CONSOLE_DATA.ctr}%</div>
              <div className="flex items-center gap-1 text-sm text-purple-100 mt-1">
                <ArrowUp className="h-3 w-3" />
                +0.3%
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-amber-100 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Avg. Position
              </div>
              <div className="text-3xl font-bold">{MOCK_SEARCH_CONSOLE_DATA.position}</div>
              <div className="flex items-center gap-1 text-sm text-amber-100 mt-1">
                <ArrowDown className="h-3 w-3" />
                -2.1
              </div>
            </div>
          </div>

          {/* SEO Checklist */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">SEO Health Checklist</h3>
            <div className="space-y-3">
              {[
                { label: 'Meta title set', status: !!settings?.meta_title },
                { label: 'Meta description set', status: !!settings?.meta_description },
                { label: 'Google Search Console connected', status: settings?.google_search_console_connected },
                { label: 'Google Analytics connected', status: settings?.google_analytics_connected },
                { label: 'Sitemap.xml exists', status: true },
                { label: 'Robots.txt configured', status: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{item.label}</span>
                  {item.status ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Console Tab */}
      {activeTab === 'search-console' && (
        <div className="space-y-6">
          {!settings?.google_search_console_connected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Google Search Console</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Connect your Google Search Console account to see search performance data, top queries, and page rankings.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Connect Search Console
              </button>
            </div>
          ) : (
            <>
              {/* Top Queries */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Top Queries</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_SEARCH_CONSOLE_DATA.topQueries.map((query, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{query.query}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{query.clicks.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{query.impressions.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{query.ctr}%</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{query.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Top Pages</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_SEARCH_CONSOLE_DATA.topPages.map((page, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.page}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{page.clicks.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{page.impressions.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{page.ctr}%</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{page.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {!settings?.google_analytics_connected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Google Analytics</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Connect your Google Analytics account to see detailed traffic data, user behavior, and conversion metrics.
              </p>
              <button className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors">
                Connect Analytics
              </button>
            </div>
          ) : (
            <>
              {/* Traffic Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500 mb-1">Users</div>
                  <div className="text-2xl font-bold text-gray-900">{MOCK_ANALYTICS_DATA.users.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500 mb-1">Sessions</div>
                  <div className="text-2xl font-bold text-gray-900">{MOCK_ANALYTICS_DATA.sessions.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500 mb-1">Page Views</div>
                  <div className="text-2xl font-bold text-gray-900">{MOCK_ANALYTICS_DATA.pageviews.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500 mb-1">Bounce Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{MOCK_ANALYTICS_DATA.bounceRate}%</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500 mb-1">Avg. Duration</div>
                  <div className="text-2xl font-bold text-gray-900">{MOCK_ANALYTICS_DATA.avgSessionDuration}</div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                <div className="space-y-4">
                  {MOCK_ANALYTICS_DATA.trafficSources.map((source, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{source.source}</span>
                        <span className="text-sm text-gray-500">{source.sessions.toLocaleString()} ({source.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${source.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Meta Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Meta Tags</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                  <span className="text-gray-400 font-normal ml-2">({editTitle.length}/60)</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={60}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="E'Nauwi Beach Resort | Beachfront Paradise in Vanuatu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                  <span className="text-gray-400 font-normal ml-2">({editDescription.length}/160)</span>
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  placeholder="Experience the perfect island getaway at E'Nauwi Beach Resort..."
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Search Result Preview</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-blue-700 text-lg hover:underline cursor-pointer">
                {editTitle || 'E\'Nauwi Beach Resort | Beachfront Paradise in Vanuatu'}
              </div>
              <div className="text-green-700 text-sm mt-1">
                https://enauwi.com
              </div>
              <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                {editDescription || 'Experience the perfect island getaway at E\'Nauwi Beach Resort on Efate Island, Vanuatu. Beachfront bungalows, swimming pool, and warm hospitality.'}
              </div>
            </div>
          </div>

          {/* Technical SEO */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Technical SEO</h3>
            <div className="space-y-3">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-700">sitemap.xml</span>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-700">robots.txt</span>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              <a
                href="https://pagespeed.web.dev/analysis?url=https://enauwi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-700">PageSpeed Insights</span>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
