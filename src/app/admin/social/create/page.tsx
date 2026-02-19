'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Facebook,
  Instagram,
  Calendar,
  Hash,
  Save,
  Eye,
  Loader2,
  Globe,
  Wand2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { toast, Toaster } from 'sonner'

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'twitter', name: 'X (Twitter)', icon: () => <span className="font-bold">𝕏</span>, color: '#000000' }
]

const POST_TYPES = [
  { id: 'room_promo', label: 'Room Promotion', emoji: '🏠' },
  { id: 'activity', label: 'Activity', emoji: '🤿' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'testimonial', label: 'Testimonial', emoji: '⭐' },
  { id: 'seasonal', label: 'Seasonal', emoji: '🌺' },
  { id: 'general', label: 'General', emoji: '📝' }
]

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'bis', name: 'Bislama', flag: '🇻🇺' },
  { code: 'fr', name: 'French', flag: '🇫🇷' }
]

const SUGGESTED_TIMES = [
  { time: '09:00', label: 'Morning (9 AM)' },
  { time: '12:00', label: 'Midday (12 PM)' },
  { time: '15:00', label: 'Afternoon (3 PM)' },
  { time: '18:00', label: 'Evening (6 PM)' },
  { time: '20:00', label: 'Night (8 PM)' }
]

export default function CreatePostPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [contentBislama, setContentBislama] = useState('')
  const [contentFrench, setContentFrench] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram'])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [postType, setPostType] = useState('general')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [mediaUrls] = useState<string[]>([])
  
  // AI generation states
  const [generating, setGenerating] = useState(false)
  const [aiLanguage, setAiLanguage] = useState<'en' | 'bis' | 'fr'>('en')
  const [aiPlatform, setAiPlatform] = useState<'facebook' | 'instagram' | 'all'>('all')
  const [customPrompt, setCustomPrompt] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  
  // Saving states
  const [saving, setSaving] = useState(false)

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '')
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
      setHashtagInput('')
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag))
  }

  const generateContent = async () => {
    if (!postType) {
      toast.error('Please select a post type')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType,
          language: aiLanguage,
          platform: aiPlatform,
          context: {
            customPrompt: customPrompt || undefined
          }
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      if (data.posts && data.posts.length > 0) {
        const post = data.posts[0]
        
        // Set content based on language
        if (aiLanguage === 'en') {
          setContent(post.content)
        } else if (aiLanguage === 'bis') {
          setContentBislama(post.content)
        } else if (aiLanguage === 'fr') {
          setContentFrench(post.content)
        }
        
        // Set hashtags
        if (post.hashtags && post.hashtags.length > 0) {
          setHashtags(post.hashtags)
        }
        
        // Set suggested time if provided
        if (post.suggestedTime) {
          const suggestedHour = post.suggestedTime.match(/(\d{1,2})/)?.[1]
          if (suggestedHour) {
            const hour = post.suggestedTime.toLowerCase().includes('pm') && parseInt(suggestedHour) !== 12
              ? parseInt(suggestedHour) + 12
              : parseInt(suggestedHour)
            setScheduledTime(`${hour.toString().padStart(2, '0')}:00`)
          }
        }
        
        toast.success('Content generated successfully!')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const translateContent = async (targetLang: 'bis' | 'fr') => {
    if (!content) {
      toast.error('Please enter English content first')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'general',
          language: targetLang,
          platform: 'all',
          context: {
            customPrompt: `Translate this social media post to ${targetLang === 'bis' ? 'Bislama' : 'French'}: "${content}"`
          }
        })
      })

      const data = await response.json()
      
      if (data.posts && data.posts.length > 0) {
        if (targetLang === 'bis') {
          setContentBislama(data.posts[0].content)
        } else {
          setContentFrench(data.posts[0].content)
        }
        toast.success(`Translated to ${targetLang === 'bis' ? 'Bislama' : 'French'}!`)
      }
    } catch {
      toast.error('Translation failed')
    } finally {
      setGenerating(false)
    }
  }

  const savePost = async (status: 'draft' | 'review' | 'scheduled') => {
    if (!content) {
      toast.error('Please enter post content')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    if (status === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      toast.error('Please select date and time for scheduling')
      return
    }

    setSaving(true)
    try {
      const scheduledAt = status === 'scheduled' && scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : null

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          content_bislama: contentBislama || null,
          content_french: contentFrench || null,
          platforms: selectedPlatforms,
          scheduled_at: scheduledAt,
          status,
          hashtags,
          post_type: postType,
          media_urls: mediaUrls,
          ai_generated: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      toast.success(
        status === 'draft' 
          ? 'Post saved as draft' 
          : status === 'review'
          ? 'Post sent for review'
          : 'Post scheduled successfully'
      )
      
      router.push('/admin/social')
    } catch {
      toast.error('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const characterCount = content.length
  const twitterLimit = 280
  const isOverTwitterLimit = selectedPlatforms.includes('twitter') && characterCount > twitterLimit

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/social" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600">Compose and schedule your social media content</p>
          </div>
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showAiPanel 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            AI Assistant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Panel */}
          {showAiPanel && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                AI Content Generator
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Post Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    {POST_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value as 'en' | 'bis' | 'fr')}
                    className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Optimize For</label>
                  <select
                    value={aiPlatform}
                    onChange={(e) => setAiPlatform(e.target.value as 'facebook' | 'instagram' | 'all')}
                    className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Focus on diving activities, mention special offer..."
                  className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={generateContent}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          )}

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Post Content
            </h3>

            {/* English Content */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  🇬🇧 English (Primary)
                </label>
                <span className={`text-sm ${isOverTwitterLimit ? 'text-red-600' : 'text-gray-500'}`}>
                  {characterCount} characters
                  {selectedPlatforms.includes('twitter') && ` / ${twitterLimit}`}
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Write your post content here... Use emojis to make it engaging! 🌴🏝️"
                className={`w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  isOverTwitterLimit ? 'border-red-500' : ''
                }`}
              />
              {isOverTwitterLimit && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Content exceeds Twitter character limit
                </p>
              )}
            </div>

            {/* Bislama Content */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  🇻🇺 Bislama (Optional)
                </label>
                <button
                  onClick={() => translateContent('bis')}
                  disabled={generating || !content}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-translate
                </button>
              </div>
              <textarea
                value={contentBislama}
                onChange={(e) => setContentBislama(e.target.value)}
                rows={3}
                placeholder="Optional Bislama version..."
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* French Content */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  🇫🇷 French (Optional)
                </label>
                <button
                  onClick={() => translateContent('fr')}
                  disabled={generating || !content}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-translate
                </button>
              </div>
              <textarea
                value={contentFrench}
                onChange={(e) => setContentFrench(e.target.value)}
                rows={3}
                placeholder="Version française optionnelle..."
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-600" />
              Hashtags
            </h3>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="Add hashtag..."
                className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => removeHashtag(tag)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              {hashtags.length === 0 && (
                <p className="text-gray-500 text-sm">No hashtags added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platforms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publish To</h3>
            <div className="space-y-3">
              {PLATFORMS.map(platform => (
                <label
                  key={platform.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() => togglePlatform(platform.id)}
                    className="sr-only"
                  />
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: platform.color }}
                  >
                    <platform.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                  {selectedPlatforms.includes(platform.id) && (
                    <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select time...</option>
                  {SUGGESTED_TIMES.map(t => (
                    <option key={t.time} value={t.time}>{t.label}</option>
                  ))}
                </select>
              </div>

              {scheduledDate && scheduledTime && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Scheduled for: <strong>{format(new Date(`${scheduledDate}T${scheduledTime}`), 'PPP')} at {scheduledTime}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Post Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Post Type</h3>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              {POST_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            <button
              onClick={() => savePost('scheduled')}
              disabled={saving || !content || !scheduledDate || !scheduledTime}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
              Schedule Post
            </button>

            <button
              onClick={() => savePost('review')}
              disabled={saving || !content}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-medium py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Eye className="w-5 h-5" />
              Send for Review
            </button>

            <button
              onClick={() => savePost('draft')}
              disabled={saving || !content}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
