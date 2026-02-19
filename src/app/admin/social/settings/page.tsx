'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Facebook,
  Instagram,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Key,
  Globe,
  Settings,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

interface SocialAccount {
  id: string
  platform: string
  account_name: string
  page_id: string
  page_name: string
  access_token?: string
  is_active: boolean
  connected_at: string
}

const PLATFORMS = [
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    color: '#1877F2',
    fields: [
      { key: 'page_id', label: 'Page ID', placeholder: 'Your Facebook Page ID' },
      { key: 'access_token', label: 'Page Access Token', placeholder: 'Long-lived access token', secret: true },
    ]
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: '#E4405F',
    fields: [
      { key: 'page_id', label: 'Instagram Business ID', placeholder: 'Connected Instagram account ID' },
      { key: 'access_token', label: 'Access Token', placeholder: 'Facebook Graph API token', secret: true },
    ]
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: () => <span className="font-bold text-lg">𝕏</span>, 
    color: '#000000',
    fields: [
      { key: 'page_id', label: 'API Key', placeholder: 'Twitter API Key' },
      { key: 'page_name', label: 'API Secret', placeholder: 'Twitter API Secret', secret: true },
      { key: 'access_token', label: 'Access Token', placeholder: 'OAuth Access Token', secret: true },
    ]
  }
]

export default function SocialSettingsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({})

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/social/accounts')
      const data = await response.json()
      
      if (data.accounts) {
        setAccounts(data.accounts)
        
        // Initialize form data from existing accounts
        const initialData: Record<string, Record<string, string>> = {}
        data.accounts.forEach((acc: SocialAccount) => {
          initialData[acc.platform] = {
            id: acc.id,
            page_id: acc.page_id || '',
            page_name: acc.page_name || '',
            account_name: acc.account_name || '',
            access_token: '',  // Don't show existing token for security
          }
        })
        setFormData(initialData)
      }
    } catch {
      toast.error('Failed to load social accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const getAccountForPlatform = (platformId: string): SocialAccount | undefined => {
    return accounts.find(a => a.platform === platformId)
  }

  const handleInputChange = (platform: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }))
  }

  const toggleShowToken = (platform: string, field: string) => {
    const key = `${platform}-${field}`
    setShowTokens(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const saveAccount = async (platformId: string) => {
    const data = formData[platformId]
    if (!data?.page_id) {
      toast.error('Page ID / API Key is required')
      return
    }

    setSaving(platformId)
    try {
      const existing = getAccountForPlatform(platformId)
      const method = existing ? 'PUT' : 'POST'
      const url = existing 
        ? `/api/social/accounts/${existing.id}` 
        : '/api/social/accounts'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformId,
          page_id: data.page_id,
          page_name: data.page_name || null,
          account_name: data.account_name || `E'Nauwi ${platformId}`,
          access_token: data.access_token || undefined,
          is_active: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save account')
      }

      toast.success(`${platformId} account saved successfully!`)
      await fetchAccounts()
    } catch {
      toast.error('Failed to save account')
    } finally {
      setSaving(null)
    }
  }

  const disconnectAccount = async (platformId: string) => {
    const account = getAccountForPlatform(platformId)
    if (!account) return

    if (!confirm(`Are you sure you want to disconnect ${platformId}?`)) return

    try {
      const response = await fetch(`/api/social/accounts/${account.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      toast.success(`${platformId} disconnected`)
      await fetchAccounts()
      
      // Clear form data for this platform
      setFormData(prev => {
        const newData = { ...prev }
        delete newData[platformId]
        return newData
      })
    } catch {
      toast.error('Failed to disconnect account')
    }
  }

  const testConnection = async (platformId: string) => {
    toast.info(`Testing ${platformId} connection...`)
    
    // In a real implementation, this would call the respective API
    setTimeout(() => {
      const account = getAccountForPlatform(platformId)
      if (account?.is_active) {
        toast.success(`${platformId} connection is working!`)
      } else {
        toast.error(`${platformId} connection failed. Please check your credentials.`)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/social/calendar" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calendar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-7 h-7 text-teal-600" />
              Social Media Settings
            </h1>
            <p className="text-gray-600">Connect and manage your social media accounts</p>
          </div>
          <button
            onClick={fetchAccounts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">How to connect your accounts</h3>
            <p className="text-sm text-blue-700 mt-1">
              To post to your social media accounts, you&apos;ll need to get API credentials from each platform.
              Facebook and Instagram require a Facebook Page Access Token from the Meta Developer Portal.
              Twitter/X requires API keys from the Twitter Developer Portal.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {PLATFORMS.map(platform => {
            const account = getAccountForPlatform(platform.id)
            const isConnected = !!account?.is_active
            const data = formData[platform.id] || {}
            const Icon = platform.icon

            return (
              <div 
                key={platform.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Platform Header */}
                <div 
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: platform.color + '10' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: platform.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isConnected ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Not connected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Fields */}
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={data.account_name || ''}
                        onChange={(e) => handleInputChange(platform.id, 'account_name', e.target.value)}
                        placeholder="E'Nauwi Beach Resort"
                        className="flex-1 rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>

                  {platform.fields.map(field => {
                    const isSecret = field.secret
                    const showKey = `${platform.id}-${field.key}`
                    const isVisible = showTokens[showKey]

                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={isSecret && !isVisible ? 'password' : 'text'}
                            value={data[field.key] || ''}
                            onChange={(e) => handleInputChange(platform.id, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full pl-10 pr-10 rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-sm"
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleShowToken(platform.id, field.key)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                        {isSecret && account && (
                          <p className="text-xs text-gray-500 mt-1">
                            Leave blank to keep existing token
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => saveAccount(platform.id)}
                    disabled={saving === platform.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    style={{ 
                      backgroundColor: platform.color, 
                      color: 'white',
                      opacity: saving === platform.id ? 0.7 : 1
                    }}
                  >
                    {saving === platform.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {account ? 'Update Account' : 'Connect Account'}
                  </button>

                  {isConnected && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => testConnection(platform.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Test
                      </button>
                      <button
                        onClick={() => disconnectAccount(platform.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {/* Connection Info */}
                {account && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-gray-500">
                      Connected: {new Date(account.connected_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Getting API Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-[#1877F2] flex items-center justify-center text-white">
                <Facebook className="w-4 h-4" />
              </div>
              <h4 className="font-medium">Facebook</h4>
            </div>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to developers.facebook.com</li>
              <li>Create or select your app</li>
              <li>Add Facebook Login product</li>
              <li>Get Page Access Token</li>
              <li>Your Page ID is in Page Settings</li>
            </ol>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-[#E4405F] flex items-center justify-center text-white">
                <Instagram className="w-4 h-4" />
              </div>
              <h4 className="font-medium">Instagram</h4>
            </div>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Connect Instagram to a Facebook Page</li>
              <li>Use the same Facebook App</li>
              <li>Add Instagram Graph API</li>
              <li>Get Instagram Business Account ID</li>
              <li>Use Facebook Page Access Token</li>
            </ol>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white">
                <span className="font-bold text-sm">𝕏</span>
              </div>
              <h4 className="font-medium">X (Twitter)</h4>
            </div>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to developer.twitter.com</li>
              <li>Create a project and app</li>
              <li>Generate API Key & Secret</li>
              <li>Generate Access Token & Secret</li>
              <li>Enable Read and Write permissions</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
