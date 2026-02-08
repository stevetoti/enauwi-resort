'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Video,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  Eye,
  Clock,
  Building2,
  Star,
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  Youtube,
  Globe,


} from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  description?: string
  video_url: string
  video_type: 'upload' | 'youtube' | 'vimeo'
  thumbnail_url?: string
  category: string
  department_id?: string
  department?: { id: string; name: string }
  is_company_wide: boolean
  duration_seconds?: number
  file_size_bytes?: number
  uploader?: { id: string; name: string; profile_photo?: string }
  view_count: number
  is_featured: boolean
  is_active: boolean
  created_at: string
}

interface Department {
  id: string
  name: string
}

const CATEGORIES = [
  { value: 'training', label: 'Training', color: 'bg-blue-100 text-blue-700' },
  { value: 'safety', label: 'Safety', color: 'bg-red-100 text-red-700' },
  { value: 'company_update', label: 'Company Update', color: 'bg-purple-100 text-purple-700' },
  { value: 'onboarding', label: 'Onboarding', color: 'bg-green-100 text-green-700' },
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
]

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(data)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      const data = await res.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
    fetchDepartments()
  }, [fetchVideos, fetchDepartments])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const handleToggleFeatured = async (video: VideoItem) => {
    try {
      await fetch(`/api/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !video.is_featured })
      })
      fetchVideos()
    } catch (error) {
      console.error('Error updating video:', error)
    }
  }

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !filterCategory || v.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCategoryStyle = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="text-gray-500 mt-1">Manage training videos and company content</p>
        </div>
        <button
          onClick={() => { setEditingVideo(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Video
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 rounded-xl"><Video className="h-5 w-5 text-teal-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{videos.length}</p><p className="text-sm text-gray-500">Total Videos</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl"><Globe className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{videos.filter(v => v.is_company_wide).length}</p><p className="text-sm text-gray-500">Company-wide</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl"><Star className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{videos.filter(v => v.is_featured).length}</p><p className="text-sm text-gray-500">Featured</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl"><Eye className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{videos.reduce((a, v) => a + v.view_count, 0)}</p><p className="text-sm text-gray-500">Total Views</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-900 cursor-pointer" onClick={() => setSelectedVideo(video)}>
              {video.thumbnail_url ? (
                <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <Video className="h-12 w-12 text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-4 bg-white/20 backdrop-blur rounded-full">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
              </div>
              {video.is_featured && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Featured
                </div>
              )}
              {video.duration_seconds && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {formatDuration(video.duration_seconds)}
                </div>
              )}
              {/* Actions */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === video.id ? null : video.id) }}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow"
                >
                  <MoreVertical className="h-4 w-4 text-gray-700" />
                </button>
                {actionMenuId === video.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                    <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-lg shadow-lg border py-1">
                      <button onClick={() => { setEditingVideo(video); setShowModal(true); setActionMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"><Edit2 className="h-4 w-4" />Edit</button>
                      <button onClick={() => { handleToggleFeatured(video); setActionMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"><Star className="h-4 w-4" />{video.is_featured ? 'Unfeature' : 'Feature'}</button>
                      <button onClick={() => { handleDelete(video.id); setActionMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Info */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryStyle(video.category)}`}>
                  {CATEGORIES.find(c => c.value === video.category)?.label}
                </span>
                {video.is_company_wide ? (
                  <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full flex items-center gap-1"><Globe className="h-3 w-3" />All Staff</span>
                ) : video.department && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"><Building2 className="h-3 w-3" />{video.department.name}</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
              {video.description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{video.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{video.view_count} views</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No videos found</h3>
          <p className="text-gray-500 mt-1">Upload your first video to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <VideoModal
          video={editingVideo}
          departments={departments}
          onClose={() => { setShowModal(false); setEditingVideo(null) }}
          onSuccess={() => { setShowModal(false); setEditingVideo(null); fetchVideos() }}
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
}

// Video Add/Edit Modal
function VideoModal({ video, departments, onClose, onSuccess }: { video: VideoItem | null; departments: Department[]; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    video_url: video?.video_url || '',
    video_type: video?.video_type || 'upload',
    thumbnail_url: video?.thumbnail_url || '',
    category: video?.category || 'general',
    department_id: video?.department_id || '',
    is_company_wide: video?.is_company_wide ?? true,
    is_featured: video?.is_featured || false,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'videos')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setFormData({ ...formData, video_url: data.url, video_type: 'upload' })
      }
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'thumbnails')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setFormData({ ...formData, thumbnail_url: data.url })
      }
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = video ? `/api/videos/${video.id}` : '/api/videos'
      const res = await fetch(url, {
        method: video ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          department_id: formData.is_company_wide ? null : formData.department_id || null
        })
      })
      if (res.ok) onSuccess()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{video ? 'Edit Video' : 'Add Video'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Video Upload/URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video Source</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setFormData({ ...formData, video_type: 'upload' })} className={`flex-1 py-2 rounded-lg text-sm ${formData.video_type === 'upload' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}><Upload className="h-4 w-4 inline mr-1" />Upload</button>
              <button type="button" onClick={() => setFormData({ ...formData, video_type: 'youtube' })} className={`flex-1 py-2 rounded-lg text-sm ${formData.video_type === 'youtube' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}><Youtube className="h-4 w-4 inline mr-1" />YouTube</button>
              <button type="button" onClick={() => setFormData({ ...formData, video_type: 'vimeo' })} className={`flex-1 py-2 rounded-lg text-sm ${formData.video_type === 'vimeo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}><LinkIcon className="h-4 w-4 inline mr-1" />URL</button>
            </div>
            {formData.video_type === 'upload' ? (
              <div>
                {formData.video_url && formData.video_type === 'upload' ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                    <Video className="h-4 w-4" /> Video uploaded
                    <button type="button" onClick={() => setFormData({ ...formData, video_url: '' })} className="ml-auto text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full py-8 border-2 border-dashed rounded-xl text-gray-500 hover:border-teal-400 hover:text-teal-600">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <><Upload className="h-6 w-6 mx-auto mb-2" /><span>Click to upload video</span></>}
                  </button>
                )}
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </div>
            ) : (
              <input type="url" placeholder={formData.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (optional)</label>
            {formData.thumbnail_url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image src={formData.thumbnail_url} alt="" fill className="object-cover" />
                <button type="button" onClick={() => setFormData({ ...formData, thumbnail_url: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => thumbInputRef.current?.click()} className="w-full py-6 border-2 border-dashed rounded-xl text-gray-400 hover:border-teal-400">
                <Upload className="h-5 w-5 mx-auto mb-1" /><span className="text-sm">Upload thumbnail</span>
              </button>
            )}
            <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbUpload} className="hidden" />
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Audience</label><select value={formData.is_company_wide ? 'all' : 'department'} onChange={(e) => setFormData({ ...formData, is_company_wide: e.target.value === 'all' })} className="w-full px-3 py-2 border rounded-lg"><option value="all">All Staff</option><option value="department">Specific Department</option></select></div>
          </div>

          {!formData.is_company_wide && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">Select department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          )}

          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 text-amber-500" /><span className="text-sm text-gray-700">Featured video (shown prominently)</span></label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading || !formData.video_url} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{loading ? 'Saving...' : video ? 'Save' : 'Add Video'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Video Player Modal
function VideoPlayerModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const getEmbedUrl = () => {
    if (video.video_type === 'youtube') {
      const match = video.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
      return match ? `https://www.youtube.com/embed/${match[1]}` : video.video_url
    }
    if (video.video_type === 'vimeo') {
      const match = video.video_url.match(/vimeo\.com\/(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : video.video_url
    }
    return video.video_url
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={onClose}>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white"><X className="h-6 w-6" /></button>
        </div>
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          {video.video_type === 'upload' ? (
            <video src={video.video_url} controls autoPlay className="w-full h-full" />
          ) : (
            <iframe src={getEmbedUrl()} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
          )}
        </div>
        <div className="mt-4 text-white">
          <h2 className="text-xl font-bold">{video.title}</h2>
          {video.description && <p className="text-white/70 mt-2">{video.description}</p>}
        </div>
      </div>
    </div>
  )
}
