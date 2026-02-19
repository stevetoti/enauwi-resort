'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  Facebook,
  Instagram,
  Calendar,
  Hash,
  Save,
  Eye,
  Globe,
  Wand2,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast, Toaster } from 'sonner'
import { Card, Button, PageTransition } from '@/components/ui'

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'twitter', name: 'X (Twitter)', icon: () => <span className="font-bold text-sm">𝕏</span>, color: '#000000' }
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
  { time: '09:00', label: 'Morning (9 AM)', icon: '🌅' },
  { time: '12:00', label: 'Midday (12 PM)', icon: '☀️' },
  { time: '15:00', label: 'Afternoon (3 PM)', icon: '🌤️' },
  { time: '18:00', label: 'Evening (6 PM)', icon: '🌅' },
  { time: '20:00', label: 'Night (8 PM)', icon: '🌙' }
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
        
        if (aiLanguage === 'en') {
          setContent(post.content)
        } else if (aiLanguage === 'bis') {
          setContentBislama(post.content)
        } else if (aiLanguage === 'fr') {
          setContentFrench(post.content)
        }
        
        if (post.hashtags && post.hashtags.length > 0) {
          setHashtags(post.hashtags)
        }
        
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
      
      router.push('/admin/social/calendar')
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
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 -m-4 sm:-m-6 p-4 md:p-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link 
          href="/admin/social/calendar" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calendar
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-500 mt-1">Compose and schedule your social media content</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
              showAiPanel 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200' 
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            AI Assistant
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Panel */}
          <AnimatePresence>
            {showAiPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-purple-100">
                  <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 p-6">
                    <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Wand2 className="w-5 h-5" />
                      </motion.div>
                      AI Content Generator
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                        <select
                          value={postType}
                          onChange={(e) => setPostType(e.target.value)}
                          className="w-full rounded-xl border-gray-200 bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                        >
                          {POST_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.emoji} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={aiLanguage}
                          onChange={(e) => setAiLanguage(e.target.value as 'en' | 'bis' | 'fr')}
                          className="w-full rounded-xl border-gray-200 bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Optimize For</label>
                        <select
                          value={aiPlatform}
                          onChange={(e) => setAiPlatform(e.target.value as 'facebook' | 'instagram' | 'all')}
                          className="w-full rounded-xl border-gray-200 bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                        >
                          <option value="all">All Platforms</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., Focus on diving activities, mention special offer..."
                        className="w-full rounded-xl border-gray-200 bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    <Button
                      onClick={generateContent}
                      loading={generating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      icon={<Sparkles className="w-5 h-5" />}
                    >
                      Generate Content
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                Post Content
              </h3>

              {/* English Content */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-base">🇬🇧</span> English (Primary)
                  </label>
                  <span className={`text-sm font-medium ${isOverTwitterLimit ? 'text-red-600' : 'text-gray-400'}`}>
                    {characterCount} characters
                    {selectedPlatforms.includes('twitter') && ` / ${twitterLimit}`}
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Write your post content here... Use emojis to make it engaging! 🌴🏝️"
                  className={`w-full rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all resize-none ${
                    isOverTwitterLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {isOverTwitterLimit && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-2 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Content exceeds Twitter character limit
                  </motion.p>
                )}
              </div>

              {/* Bislama Content */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-base">🇻🇺</span> Bislama (Optional)
                  </label>
                  <button
                    onClick={() => translateContent('bis')}
                    disabled={generating || !content}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50 transition-colors"
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
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all resize-none"
                />
              </div>

              {/* French Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-base">🇫🇷</span> French (Optional)
                  </label>
                  <button
                    onClick={() => translateContent('fr')}
                    disabled={generating || !content}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50 transition-colors"
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
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all resize-none"
                />
              </div>
            </Card>
          </motion.div>

          {/* Hashtags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Hash className="w-4 h-4 text-teal-600" />
                </div>
                Hashtags
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  placeholder="Add hashtag..."
                  className="flex-1 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                />
                <Button onClick={addHashtag} variant="secondary" icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {hashtags.map(tag => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100"
                    >
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="text-teal-500 hover:text-teal-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {hashtags.length === 0 && (
                  <p className="text-gray-400 text-sm">No hashtags added yet</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platforms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Publish To</h3>
              <div className="space-y-3">
                {PLATFORMS.map(platform => (
                  <motion.label
                    key={platform.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
                      className="sr-only"
                    />
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: platform.color }}
                    >
                      <platform.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{platform.name}</span>
                    <AnimatePresence>
                      {selectedPlatforms.includes(platform.id) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="ml-auto"
                        >
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.label>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Scheduling */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                Schedule
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SUGGESTED_TIMES.map(t => (
                      <motion.button
                        key={t.time}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setScheduledTime(t.time)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          scheduledTime === t.time
                            ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500/30'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                        title={t.label}
                      >
                        <span className="text-lg">{t.icon}</span>
                        <span className="block text-xs mt-0.5">{t.time}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {scheduledDate && scheduledTime && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100"
                    >
                      <p className="text-sm text-teal-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          <strong>{format(new Date(`${scheduledDate}T${scheduledTime}`), 'PPP')}</strong> at <strong>{scheduledTime}</strong>
                        </span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Post Type */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Post Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {POST_TYPES.map(type => (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPostType(type.id)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      postType === type.id
                        ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-500/30'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{type.emoji}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 space-y-3">
              <Button
                onClick={() => savePost('scheduled')}
                disabled={saving || !content || !scheduledDate || !scheduledTime}
                loading={saving}
                className="w-full"
                icon={<Calendar className="w-5 h-5" />}
              >
                Schedule Post
              </Button>

              <Button
                onClick={() => savePost('review')}
                disabled={saving || !content}
                variant="secondary"
                className="w-full bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                icon={<Eye className="w-5 h-5" />}
              >
                Send for Review
              </Button>

              <Button
                onClick={() => savePost('draft')}
                disabled={saving || !content}
                variant="ghost"
                className="w-full"
                icon={<Save className="w-5 h-5" />}
              >
                Save as Draft
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
