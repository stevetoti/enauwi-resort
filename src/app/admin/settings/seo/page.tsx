'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast, Toaster } from 'sonner'

interface SEOData {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  googleAnalyticsId: string
  facebookPixelId: string
}

const defaultSEO: SEOData = {
  metaTitle: "E'Nauwi Beach Resort | Family-Friendly Island Retreat in Vanuatu",
  metaDescription: "E'Nauwi Beach Resort is a family-friendly island retreat on Efate Island, Vanuatu.",
  metaKeywords: "Vanuatu resort, beach resort, family accommodation",
  googleAnalyticsId: '',
  facebookPixelId: '',
}

export default function SEOPage() {
  const [seo, setSEO] = useState<SEOData>(defaultSEO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSEO()
  }, [])

  async function loadSEO() {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'seo')
        .single()
      if (data?.value) {
        setSEO({ ...defaultSEO, ...data.value })
      }
    } catch (error) {
      console.error('Error loading SEO:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSEO() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'seo', value: seo, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) throw error
      toast.success('SEO settings saved!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save')
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
      <h1 className="text-2xl font-bold mb-6">SEO & Analytics Settings</h1>
      
      <div className="space-y-6">
        {/* Meta Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Meta Title</label>
          <input
            type="text"
            value={seo.metaTitle}
            onChange={e => setSEO(prev => ({ ...prev, metaTitle: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">{seo.metaTitle.length}/60 characters</p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Meta Description</label>
          <textarea
            value={seo.metaDescription}
            onChange={e => setSEO(prev => ({ ...prev, metaDescription: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">{seo.metaDescription.length}/160 characters</p>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium mb-2">Keywords</label>
          <input
            type="text"
            value={seo.metaKeywords}
            onChange={e => setSEO(prev => ({ ...prev, metaKeywords: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        {/* Analytics */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
              <input
                type="text"
                value={seo.googleAnalyticsId}
                onChange={e => setSEO(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
              <input
                type="text"
                value={seo.facebookPixelId}
                onChange={e => setSEO(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="123456789"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveSEO}
          disabled={saving}
          className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </div>
  )
}
