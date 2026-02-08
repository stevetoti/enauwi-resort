'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Megaphone,
  Plus,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Clock,
  X,
  Loader2,

  Image as ImageIcon,
  FileText,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Paperclip,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Author {
  id: string
  name: string
  email: string
  profile_photo?: string
}

interface Attachment {
  name: string
  url: string
  type: string
  size?: number
}

interface LinkItem {
  title: string
  url: string
}

interface Announcement {
  id: string
  title: string
  content: string
  author_id?: string
  author?: Author
  hero_image?: string
  attachments?: Attachment[]
  links?: LinkItem[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  pinned: boolean
  target_roles: string[]
  expires_at?: string
  created_at: string
  updated_at: string
}

interface Role {
  id: string
  name: string
}

type Priority = 'low' | 'normal' | 'high' | 'urgent'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [announcementsRes, rolesRes] = await Promise.all([
        fetch('/api/announcements?includeExpired=true'),
        fetch('/api/roles'),
      ])

      if (announcementsRes.ok) {
        const data = await announcementsRes.json()
        setAnnouncements(data)
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !announcement.pinned }),
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    setDeleting(announcementId)
    try {
      const res = await fetch(`/api/announcements/${announcementId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setDeleting(null)
    }
  }

  const isExpired = (ann: Announcement) => ann.expires_at && new Date(ann.expires_at) < new Date()

  const getPriorityBadge = (priority: Priority) => {
    const styles: Record<Priority, string> = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-teal-100 text-teal-700',
      low: 'bg-gray-100 text-gray-700',
    }
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[priority]}`}>{priority}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Create and manage staff announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg"><Megaphone className="h-5 w-5 text-teal-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Pin className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{announcements.filter(a => a.pinned).length}</p>
              <p className="text-xs text-gray-500">Pinned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><Clock className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{announcements.filter(a => a.priority === 'urgent').length}</p>
              <p className="text-xs text-gray-500">Urgent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><Clock className="h-5 w-5 text-gray-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{announcements.filter(a => isExpired(a)).length}</p>
              <p className="text-xs text-gray-500">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Announcements</h2>
        </div>

        {announcements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${isExpired(announcement) ? 'opacity-50' : ''}`}
              >
                {/* Hero Image */}
                {announcement.hero_image && (
                  <div className="mb-4 rounded-lg overflow-hidden relative h-48 bg-gray-100">
                    <Image src={announcement.hero_image} alt={announcement.title} fill className="object-cover" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${announcement.pinned ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    {announcement.pinned ? <Pin className="h-5 w-5 text-purple-600" /> : <Megaphone className="h-5 w-5 text-gray-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      {announcement.pinned && <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Pinned</span>}
                      {getPriorityBadge(announcement.priority)}
                      {isExpired(announcement) && <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Expired</span>}
                    </div>

                    <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap line-clamp-3">{announcement.content}</p>

                    {/* Attachments Preview */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {announcement.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700"
                          >
                            {att.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> :
                             att.type.startsWith('video/') ? <Video className="h-3 w-3" /> :
                             <FileText className="h-3 w-3" />}
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Links Preview */}
                    {announcement.links && announcement.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {announcement.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs text-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link.title || link.url}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDate(announcement.created_at)}</span>
                      {announcement.author && <span>by {announcement.author.name}</span>}
                      {announcement.expires_at && <span>Expires: {formatDate(announcement.expires_at)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleTogglePin(announcement)} className={`p-2 rounded-lg transition-colors ${announcement.pinned ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`} title={announcement.pinned ? 'Unpin' : 'Pin'}>
                      {announcement.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </button>
                    <button onClick={() => { setEditingAnnouncement(announcement); setShowModal(true) }} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(announcement.id)} disabled={deleting === announcement.id} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                      {deleting === announcement.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
            <p className="text-gray-500 mt-1">Create your first announcement to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AnnouncementModal
          announcement={editingAnnouncement}
          roles={roles}
          onClose={() => { setShowModal(false); setEditingAnnouncement(null) }}
          onSuccess={() => { setShowModal(false); setEditingAnnouncement(null); fetchData() }}
        />
      )}
    </div>
  )
}

function AnnouncementModal({
  announcement,
  roles,
  onClose,
  onSuccess,
}: {
  announcement: Announcement | null
  roles: Role[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'normal',
    pinned: announcement?.pinned || false,
    target_roles: announcement?.target_roles || [],
    expires_at: announcement?.expires_at ? announcement.expires_at.split('T')[0] : '',
    hero_image: announcement?.hero_image || '',
    attachments: announcement?.attachments || [] as Attachment[],
    links: announcement?.links || [] as LinkItem[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const heroInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File, isHero: boolean = false) => {
    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('bucket', 'announcements')

      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { url } = await res.json()

      if (isHero) {
        setFormData({ ...formData, hero_image: url })
      } else {
        setFormData({
          ...formData,
          attachments: [...formData.attachments, { name: file.name, url, type: file.type, size: file.size }],
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setFormData({ ...formData, attachments: formData.attachments.filter((_, i) => i !== index) })
  }

  const handleAddLink = () => {
    if (!newLink.url) return
    setFormData({ ...formData, links: [...formData.links, { title: newLink.title || newLink.url, url: newLink.url }] })
    setNewLink({ title: '', url: '' })
  }

  const handleRemoveLink = (index: number) => {
    setFormData({ ...formData, links: formData.links.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const staffData = localStorage.getItem('staff')
      const staff = staffData ? JSON.parse(staffData) : null

      const url = announcement ? `/api/announcements/${announcement.id}` : '/api/announcements'
      const method = announcement ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author_id: staff?.id,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save announcement')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = (roleId: string) => {
    const newRoles = formData.target_roles.includes(roleId)
      ? formData.target_roles.filter((id) => id !== roleId)
      : [...formData.target_roles, roleId]
    setFormData({ ...formData, target_roles: newRoles })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{announcement ? 'Edit Announcement' : 'New Announcement'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Banner (optional)</label>
            {formData.hero_image ? (
              <div className="relative rounded-lg overflow-hidden h-40 bg-gray-100">
                <Image src={formData.hero_image} alt="Hero" fill className="object-cover" />
                <button type="button" onClick={() => setFormData({ ...formData, hero_image: '' })} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div
                onClick={() => heroInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload hero image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], true)} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Announcement title" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none" placeholder="Write your announcement here..." />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <div className="space-y-2">
              {formData.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  {att.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-gray-500" /> :
                   att.type.startsWith('video/') ? <Video className="h-4 w-4 text-gray-500" /> :
                   <FileText className="h-4 w-4 text-gray-500" />}
                  <span className="flex-1 text-sm text-gray-700 truncate">{att.name}</span>
                  <button type="button" onClick={() => handleRemoveAttachment(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Add Attachment'}
              </button>
            </div>
            <input ref={attachmentInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], false)} />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Links</label>
            <div className="space-y-2">
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <LinkIcon className="h-4 w-4 text-blue-500" />
                  <span className="flex-1 text-sm text-blue-700 truncate">{link.title}</span>
                  <button type="button" onClick={() => handleRemoveLink(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" placeholder="Link title (optional)" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                <input type="url" placeholder="https://..." value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                <button type="button" onClick={handleAddLink} disabled={!newLink.url} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 disabled:opacity-50"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Priority & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
              <input type="date" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          {/* Pin */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
            <span className="text-sm font-medium text-gray-700">Pin this announcement</span>
          </label>

          {/* Target Roles */}
          {roles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles (leave empty for all)</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label key={role.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${formData.target_roles.includes(role.id) ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                    <input type="checkbox" checked={formData.target_roles.includes(role.id)} onChange={() => handleRoleToggle(role.id)} className="sr-only" />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading || uploading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Saving...' : announcement ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
