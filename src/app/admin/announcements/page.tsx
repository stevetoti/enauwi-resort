'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Megaphone,
  Plus,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Eye,
  Clock,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Announcement, Role } from '@/types'

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

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    setDeleting(announcementId)
    try {
      const res = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getPriorityBadge = (priority: Priority) => {
    const styles: Record<Priority, string> = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700',
    }

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const isExpired = (announcement: Announcement) => {
    if (!announcement.expires_at) return false
    return new Date(announcement.expires_at) < new Date()
  }

  const stats = {
    total: announcements.length,
    pinned: announcements.filter((a) => a.pinned).length,
    active: announcements.filter((a) => !isExpired(a)).length,
    urgent: announcements.filter((a) => a.priority === 'urgent').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage staff announcements
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAnnouncement(null)
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Megaphone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Pin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pinned</p>
              <p className="text-xl font-bold text-gray-900">{stats.pinned}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Urgent</p>
              <p className="text-xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Announcements</h2>
        </div>

        {announcements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                  isExpired(announcement) ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg ${
                      announcement.pinned ? 'bg-purple-100' : 'bg-gray-100'
                    }`}
                  >
                    {announcement.pinned ? (
                      <Pin className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Megaphone className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      {announcement.pinned && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          Pinned
                        </span>
                      )}
                      {getPriorityBadge(announcement.priority)}
                      {isExpired(announcement) && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Expired
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap line-clamp-3">
                      {announcement.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(announcement.created_at)}
                      </span>
                      {announcement.author && (
                        <span>by {announcement.author.name}</span>
                      )}
                      {announcement.expires_at && (
                        <span className="flex items-center gap-1">
                          Expires: {formatDate(announcement.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.pinned
                          ? 'text-purple-600 hover:bg-purple-50'
                          : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      title={announcement.pinned ? 'Unpin' : 'Pin'}
                    >
                      {announcement.pinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAnnouncement(announcement)
                        setShowModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      disabled={deleting === announcement.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === announcement.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <AnnouncementModal
          announcement={editingAnnouncement}
          roles={roles}
          onClose={() => {
            setShowModal(false)
            setEditingAnnouncement(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setEditingAnnouncement(null)
            fetchData()
          }}
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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = announcement
        ? `/api/announcements/${announcement.id}`
        : '/api/announcements'
      const method = announcement ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
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
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {announcement ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Announcement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Write your announcement here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires On
              </label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Pin this announcement</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Pinned announcements appear at the top
            </p>
          </div>

          {roles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Roles (leave empty for all)
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                      formData.target_roles.includes(role.id)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.target_roles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="sr-only"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : announcement ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
