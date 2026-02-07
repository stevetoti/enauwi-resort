'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Megaphone,
  FileText,
  ChevronRight,
  X,
  Pin,
  AlertCircle,
  ExternalLink,
  File,
  Link as LinkIcon,
  Upload,
} from 'lucide-react'
import { Department, DepartmentAnnouncement, DepartmentDocument, Staff } from '@/types'

interface DepartmentWithDetails extends Department {
  members?: Staff[]
  announcements?: DepartmentAnnouncement[]
  documents?: DepartmentDocument[]
}

const RESORT_IMAGES = [
  '/images/resort/beach-resort-overview.jpg',
  '/images/resort/resort-buildings-aerial.jpg',
  '/images/resort/lagoon-island-view.jpg',
  '/images/resort/hero-resort-lagoon.jpg',
  '/images/resort/resort-lagoon-aerial.jpg',
  '/images/resort/private-island-sandbar.jpg',
  '/images/resort/beach-kayaks-cove.jpg',
  '/images/resort/wedding-beach-couple.jpg',
]

const DEPARTMENT_COLORS = [
  '#0D4F8B', '#17A2B8', '#40916C', '#E8941C', '#C77B0A',
  '#854B06', '#093763', '#6366F1', '#EC4899', '#8B5CF6'
]

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentWithDetails | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      const data = await res.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const fetchDepartmentDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/departments/${id}`)
      const data = await res.json()
      setSelectedDepartment(data)
      setShowDetailPanel(true)
    } catch (error) {
      console.error('Error fetching department details:', error)
    }
  }

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return

    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to delete department')
        return
      }

      fetchDepartments()
      if (selectedDepartment?.id === id) {
        setShowDetailPanel(false)
        setSelectedDepartment(null)
      }
    } catch (error) {
      console.error('Error deleting department:', error)
    }
    setActionMenuId(null)
  }

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden">
        <Image
          src="/images/resort/beach-resort-overview.jpg"
          alt="E'Nauwi Resort Departments"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-900/40" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Department Management
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-lg">
              Organize your team into departments, manage announcements, and share important documents with the right people.
            </p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Department
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-sm text-gray-500">Departments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((acc, d) => acc + (d.member_count || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Megaphone className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.filter(d => d.is_active).length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => fetchDepartmentDetails(department.id)}
          >
            {/* Department Image */}
            <div className="relative h-32">
              <Image
                src={department.image_url || '/images/resort/beach-resort-overview.jpg'}
                alt={department.name}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${department.color}dd 0%, ${department.color}66 100%)`
                }}
              />
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActionMenuId(actionMenuId === department.id ? null : department.id)
                  }}
                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-white" />
                </button>
                {actionMenuId === department.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActionMenuId(null)
                      }}
                    />
                    <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDepartment(department as DepartmentWithDetails)
                          setShowEditModal(true)
                          setActionMenuId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDepartment(department.id)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="absolute bottom-3 left-3">
                <h3 className="font-bold text-white text-lg">{department.name}</h3>
              </div>
            </div>

            {/* Department Info */}
            <div className="p-4">
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {department.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{department.member_count || 0} members</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-600 group-hover:text-blue-700">
                  <span>View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first department to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <DepartmentModal
          department={showEditModal ? selectedDepartment : null}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            fetchDepartments()
            if (selectedDepartment) {
              fetchDepartmentDetails(selectedDepartment.id)
            }
          }}
        />
      )}

      {/* Detail Panel (Slide-in) */}
      {showDetailPanel && selectedDepartment && (
        <DepartmentDetailPanel
          department={selectedDepartment}
          onClose={() => {
            setShowDetailPanel(false)
            setSelectedDepartment(null)
          }}
          onRefresh={() => fetchDepartmentDetails(selectedDepartment.id)}
        />
      )}
    </div>
  )
}

// Department Create/Edit Modal
function DepartmentModal({
  department,
  onClose,
  onSuccess,
}: {
  department: DepartmentWithDetails | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    image_url: department?.image_url || RESORT_IMAGES[0],
    color: department?.color || DEPARTMENT_COLORS[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = department ? `/api/departments/${department.id}` : '/api/departments'
      const method = department ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save department')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {department ? 'Edit Department' : 'Create Department'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Front Desk"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Brief description of this department's responsibilities"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Color
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RESORT_IMAGES.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: img })}
                  className={`relative h-16 rounded-lg overflow-hidden ${
                    formData.image_url === img ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

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
              {loading ? 'Saving...' : department ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Department Detail Panel
function DepartmentDetailPanel({
  department,
  onClose,
  onRefresh,
}: {
  department: DepartmentWithDetails
  onClose: () => void
  onRefresh: () => void
}) {
  const [activeTab, setActiveTab] = useState<'members' | 'announcements' | 'documents'>('members')
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await fetch(`/api/departments/announcements/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await fetch(`/api/departments/documents/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="relative h-40">
          <Image
            src={department.image_url || '/images/resort/beach-resort-overview.jpg'}
            alt={department.name}
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${department.color}dd 0%, ${department.color}66 100%)`
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-bold text-white">{department.name}</h2>
            <p className="text-white/80 text-sm">{department.member_count || 0} members</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'members', label: 'Members', icon: Users },
              { key: 'announcements', label: 'Announcements', icon: Megaphone },
              { key: 'documents', label: 'Documents', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {department.members && department.members.length > 0 ? (
                department.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {member.profile_photo ? (
                      <Image
                        src={member.profile_photo}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No members in this department</p>
                  <p className="text-sm text-gray-400">
                    Assign staff to this department from Staff Management
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Announcement
              </button>

              {department.announcements && department.announcements.length > 0 ? (
                department.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg border ${
                      announcement.pinned ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {announcement.pinned && (
                        <Pin className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      {announcement.priority === 'urgent' && (
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                      {announcement.author && (
                        <>
                          <span>•</span>
                          <span>{announcement.author.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No announcements yet</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <button
                onClick={() => setShowDocumentModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Add Document/Link
              </button>

              {department.documents && department.documents.length > 0 ? (
                department.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {doc.file_type === 'link' ? (
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <File className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.category || 'General'} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No documents yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <AnnouncementModal
            departmentId={department.id}
            onClose={() => setShowAnnouncementModal(false)}
            onSuccess={() => {
              setShowAnnouncementModal(false)
              onRefresh()
            }}
          />
        )}

        {/* Document Modal */}
        {showDocumentModal && (
          <DocumentModal
            departmentId={department.id}
            onClose={() => setShowDocumentModal(false)}
            onSuccess={() => {
              setShowDocumentModal(false)
              onRefresh()
            }}
          />
        )}
      </div>
    </>
  )
}

// Announcement Modal
function AnnouncementModal({
  departmentId,
  onClose,
  onSuccess,
}: {
  departmentId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    pinned: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/departments/${departmentId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create announcement')
      onSuccess()
    } catch (error) {
      console.error('Error creating announcement:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">New Announcement</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Pin</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Document Modal
function DocumentModal({
  departmentId,
  onClose,
  onSuccess,
}: {
  departmentId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    file_type: 'link',
    category: 'General',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/departments/${departmentId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to add document')
      onSuccess()
    } catch (error) {
      console.error('Error adding document:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Add Document/Link</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Employee Handbook"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="General">General</option>
              <option value="SOP">SOP</option>
              <option value="Policy">Policy</option>
              <option value="Training">Training</option>
              <option value="Form">Form</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Brief description"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
