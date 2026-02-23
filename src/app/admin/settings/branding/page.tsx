'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'

interface BrandingData {
  siteName: string
  logo: string | null
  favicon: string | null
  primaryColor: string
  accentColor: string
}

const defaultBranding: BrandingData = {
  siteName: "E'Nauwi Beach Resort",
  logo: null,
  favicon: null,
  primaryColor: '#0A4B78',
  accentColor: '#D4A853',
}

export default function BrandingPage() {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    loadBranding()
  }, [])

  async function loadBranding() {
    try {
      const response = await fetch('/api/admin/settings?key=branding')
      const result = await response.json()
      if (result.data?.value) {
        setBranding({ ...defaultBranding, ...result.data.value })
      }
    } catch (error) {
      console.error('Error loading branding:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(field)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', `branding/${field}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url } = await response.json()
      setBranding(prev => ({ ...prev, [field]: url }))
      toast.success(`${field === 'logo' ? 'Logo' : 'Favicon'} uploaded!`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  async function saveBranding() {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'branding', value: branding })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success('Branding settings saved!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div></div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toaster richColors position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Branding Settings</h1>
      
      <div className="space-y-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Site Name</label>
          <input
            type="text"
            value={branding.siteName}
            onChange={e => setBranding(prev => ({ ...prev, siteName: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Logo</label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="h-20 mx-auto mb-2" />
            ) : (
              <div className="h-20 flex items-center justify-center text-gray-400">No logo uploaded</div>
            )}
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload" className="cursor-pointer inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
              {uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
            </label>
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Favicon (Square PNG)</label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {branding.favicon ? (
              <img src={branding.favicon} alt="Favicon" className="h-16 w-16 mx-auto mb-2" />
            ) : (
              <div className="h-16 w-16 mx-auto flex items-center justify-center text-gray-400 bg-gray-100 rounded">?</div>
            )}
            <input type="file" accept="image/png" onChange={e => handleImageUpload(e, 'favicon')} className="hidden" id="favicon-upload" />
            <label htmlFor="favicon-upload" className="cursor-pointer inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 mt-2">
              {uploading === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
            </label>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex gap-2">
              <input type="color" value={branding.primaryColor} onChange={e => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))} className="h-10 w-16 rounded cursor-pointer" />
              <input type="text" value={branding.primaryColor} onChange={e => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))} className="flex-1 px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex gap-2">
              <input type="color" value={branding.accentColor} onChange={e => setBranding(prev => ({ ...prev, accentColor: e.target.value }))} className="h-10 w-16 rounded cursor-pointer" />
              <input type="text" value={branding.accentColor} onChange={e => setBranding(prev => ({ ...prev, accentColor: e.target.value }))} className="flex-1 px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveBranding}
          disabled={saving}
          className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Branding Settings'}
        </button>
      </div>
    </div>
  )
}
