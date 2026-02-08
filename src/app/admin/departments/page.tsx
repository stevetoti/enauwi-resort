'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

  ExternalLink,
  File,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  Video,
  Loader2,
  Eye,
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
  '#0D9488', '#0F766E', '#14B8A6', '#F59E0B', '#D97706',
  '#854B06', '#115E59', '#059669', '#10B981', '#047857'
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
  }

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
      </div>

      {/* Hero Section */}
      <div className="relative h-40 rounded-2xl overflow-hidden">
        <Image
          src="/images/resort/lagoon-island-view.jpg"
          alt="Department Management"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4">
          <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <Image src="/logo-enauwi.png" alt="E'Nauwi" width={48} height={48} className="object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Department Management</h2>
            <p className="text-white/80 text-sm">
              Organize your team into departments, manage announcements, and share important documents with the right people.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Create */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Create Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 rounded-xl"><Building2 className="h-5 w-5 text-teal-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{departments.length}</p><p className="text-sm text-gray-500">Departments</p></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl"><Users className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{departments.reduce((a, d) => a + (d.member_count || 0), 0)}</p><p className="text-sm text-gray-500">Total Staff</p></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-xl"><Megaphone className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{departments.length}</p><p className="text-sm text-gray-500">Active</p></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl"><FileText className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">—</p><p className="text-sm text-gray-500">Documents</p></div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => fetchDepartmentDetails(department.id)}
          >
            {/* Department Image - NO OVERLAY */}
            <div className="relative h-36">
              <Image
                src={department.image_url || '/images/resort/beach-resort-overview.jpg'}
                alt={department.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Minimal gradient only at bottom for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActionMenuId(actionMenuId === department.id ? null : department.id)
                  }}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-700" />
                </button>
                {actionMenuId === department.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActionMenuId(null) }} />
                    <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedDepartment(department as DepartmentWithDetails); setShowEditModal(true); setActionMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit2 className="h-4 w-4" />Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(department.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button>
                    </div>
                  </>
                )}
              </div>
              {/* Color accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: department.color || '#0D9488' }} />
              <div className="absolute bottom-3 left-3"><h3 className="font-bold text-white text-lg drop-shadow-lg">{department.name}</h3></div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{department.description || 'No description provided'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500"><Users className="h-4 w-4" /><span>{department.member_count || 0} members</span></div>
                <div className="flex items-center gap-1 text-sm text-teal-600 group-hover:text-teal-700"><span>View Details</span><ChevronRight className="h-4 w-4" /></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
          <p className="text-gray-500 mt-1">{searchQuery ? 'Try adjusting your search' : 'Create your first department to get started'}</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <DepartmentModal
          department={showEditModal ? selectedDepartment : null}
          onClose={() => { setShowCreateModal(false); setShowEditModal(false) }}
          onSuccess={() => { setShowCreateModal(false); setShowEditModal(false); fetchDepartments(); if (selectedDepartment) fetchDepartmentDetails(selectedDepartment.id) }}
        />
      )}

      {/* Detail Panel */}
      {showDetailPanel && selectedDepartment && (
        <DepartmentDetailPanel
          department={selectedDepartment}
          onClose={() => { setShowDetailPanel(false); setSelectedDepartment(null) }}
          onRefresh={() => fetchDepartmentDetails(selectedDepartment.id)}
        />
      )}
    </div>
  )
}

// Department Create/Edit Modal
function DepartmentModal({ department, onClose, onSuccess }: { department: DepartmentWithDetails | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    image_url: department?.image_url || RESORT_IMAGES[0],
    color: department?.color || DEPARTMENT_COLORS[0],
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [imageMode, setImageMode] = useState<'preset' | 'custom'>(department?.image_url && !RESORT_IMAGES.includes(department.image_url) ? 'custom' : 'preset')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5MB'); return }

    setUploading(true); setError('')
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('bucket', 'departments')
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload')
      setFormData({ ...formData, image_url: data.url })
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to upload') } finally { setUploading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const url = department ? `/api/departments/${department.id}` : '/api/departments'
      const res = await fetch(url, { method: department ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      onSuccess()
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{department ? 'Edit Department' : 'Create Department'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><div className="flex flex-wrap gap-2">{DEPARTMENT_COLORS.map((color) => (<button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent'}`} style={{ backgroundColor: color }} />))}</div></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="flex gap-2 mb-3"><button type="button" onClick={() => setImageMode('preset')} className={`px-3 py-1.5 text-sm rounded-lg ${imageMode === 'preset' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>Preset</button><button type="button" onClick={() => setImageMode('custom')} className={`px-3 py-1.5 text-sm rounded-lg ${imageMode === 'custom' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>Upload Custom</button></div>
            {imageMode === 'preset' ? (
              <div className="grid grid-cols-4 gap-2">{RESORT_IMAGES.map((img) => (<button key={img} type="button" onClick={() => setFormData({ ...formData, image_url: img })} className={`relative aspect-video rounded-lg overflow-hidden border-2 ${formData.image_url === img ? 'border-teal-500 ring-2 ring-teal-200' : 'border-transparent'}`}><Image src={img} alt="" fill className="object-cover" /></button>))}</div>
            ) : (
              <label className="block cursor-pointer"><div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-teal-400">{formData.image_url && !RESORT_IMAGES.includes(formData.image_url) ? (<><Image src={formData.image_url} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Upload className="h-8 w-8 text-white" /></div></>) : (<div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">{uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <><Upload className="h-8 w-8 mb-2" /><span className="text-sm">Click to upload</span></>}</div>)}</div><input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" /></label>
            )}
          </div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading || uploading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{loading ? 'Saving...' : department ? 'Save Changes' : 'Create'}</button></div>
        </form>
      </div>
    </div>
  )
}

// Department Detail Panel
function DepartmentDetailPanel({ department, onClose, onRefresh }: { department: DepartmentWithDetails; onClose: () => void; onRefresh: () => void }) {
  const [activeTab, setActiveTab] = useState<'members' | 'announcements' | 'documents'>('members')
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<DepartmentAnnouncement | null>(null)

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try { await fetch(`/api/departments/announcements/${id}`, { method: 'DELETE' }); onRefresh() } catch (error) { console.error(error) }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try { await fetch(`/api/departments/documents/${id}`, { method: 'DELETE' }); onRefresh() } catch (error) { console.error(error) }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header - NO OVERLAY */}
        <div className="relative h-44">
          <Image src={department.image_url || '/images/resort/beach-resort-overview.jpg'} alt={department.name} fill className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm"><X className="h-5 w-5 text-gray-700" /></button>
          <div className="absolute bottom-4 left-4">
            <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: department.color || '#0D9488' }} />
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{department.name}</h2>
            <p className="text-white/90 text-sm drop-shadow">{department.member_count || 0} members</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">{[{ key: 'members', label: 'Members', icon: Users }, { key: 'announcements', label: 'Announcements', icon: Megaphone }, { key: 'documents', label: 'Documents', icon: FileText }].map((tab) => (<button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><tab.icon className="h-4 w-4" />{tab.label}</button>))}</div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'members' && (
            <div className="space-y-3">
              {department.members && department.members.length > 0 ? (
                department.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {member.profile_photo ? <Image src={member.profile_photo} alt={member.name} width={40} height={40} className="rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">{member.name.charAt(0).toUpperCase()}</div>}
                    <div className="flex-1"><p className="font-medium text-gray-900">{member.name}</p><p className="text-sm text-gray-500">{member.email}</p></div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{member.status}</span>
                  </div>
                ))
              ) : (<div className="text-center py-8"><Users className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">No members in this department</p></div>)}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <button onClick={() => setShowAnnouncementModal(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"><Plus className="h-4 w-4" />New Announcement</button>
              {department.announcements && department.announcements.length > 0 ? (
                department.announcements.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {ann.hero_image && (<div className="relative h-32"><Image src={ann.hero_image} alt={ann.title} fill className="object-cover" /></div>)}
                    <div className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {ann.pinned && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1"><Pin className="h-3 w-3" />Pinned</span>}
                        {ann.priority === 'urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>}
                      </div>
                      <h4 className="font-semibold text-gray-900">{ann.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ann.content}</p>
                      {((ann.attachments && ann.attachments.length > 0) || (ann.links && ann.links.length > 0)) && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          {ann.attachments && ann.attachments.length > 0 && <span className="flex items-center gap-1"><File className="h-3 w-3" />{ann.attachments.length} files</span>}
                          {ann.links && ann.links.length > 0 && <span className="flex items-center gap-1"><LinkIcon className="h-3 w-3" />{ann.links.length} links</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedAnnouncement(ann)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (<div className="text-center py-8"><Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">No announcements yet</p></div>)}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <button onClick={() => setShowDocumentModal(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"><Plus className="h-4 w-4" />Add Document/SOP</button>
              {department.documents && department.documents.length > 0 ? (
                department.documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {doc.hero_image && (<div className="relative h-28"><Image src={doc.hero_image} alt={doc.name} fill className="object-cover" /></div>)}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">{doc.file_type === 'link' ? <LinkIcon className="h-5 w-5 text-teal-600" /> : <File className="h-5 w-5 text-gray-600" />}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.category || 'General'} • {new Date(doc.created_at).toLocaleDateString()}</p>
                          {doc.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>}
                        </div>
                      </div>
                      {((doc.attachments && doc.attachments.length > 0) || (doc.links && doc.links.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {doc.attachments?.map((att, idx) => (<a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">{att.type?.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : att.type?.startsWith('video/') ? <Video className="h-3 w-3" /> : <File className="h-3 w-3" />}{att.name}</a>))}
                          {doc.links?.map((link, idx) => (<a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs text-blue-700"><ExternalLink className="h-3 w-3" />{link.title}</a>))}
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><ExternalLink className="h-4 w-4" /></a>}
                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (<div className="text-center py-8"><FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">No documents yet</p></div>)}
            </div>
          )}
        </div>

        {showAnnouncementModal && (<AnnouncementModal departmentId={department.id} onClose={() => setShowAnnouncementModal(false)} onSuccess={() => { setShowAnnouncementModal(false); onRefresh() }} />)}
        {showDocumentModal && (<DocumentModal departmentId={department.id} onClose={() => setShowDocumentModal(false)} onSuccess={() => { setShowDocumentModal(false); onRefresh() }} />)}
        {selectedAnnouncement && (<AnnouncementViewModal announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />)}
      </div>
    </>
  )
}

// Announcement View Modal
function AnnouncementViewModal({ announcement, onClose }: { announcement: DepartmentAnnouncement; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {announcement.hero_image && (<div className="relative h-48"><Image src={announcement.hero_image} alt={announcement.title} fill className="object-cover rounded-t-2xl" /><button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><X className="h-5 w-5" /></button></div>)}
        <div className="p-6">
          {!announcement.hero_image && (<div className="flex justify-end mb-4"><button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button></div>)}
          <div className="flex items-center gap-2 flex-wrap mb-3">{announcement.pinned && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Pinned</span>}{announcement.priority === 'urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>}</div>
          <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{new Date(announcement.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="mt-4 text-gray-700 whitespace-pre-wrap">{announcement.content}</div>
          {announcement.attachments && announcement.attachments.length > 0 && (<div className="mt-6 pt-4 border-t border-gray-200"><h4 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h4><div className="flex flex-wrap gap-2">{announcement.attachments.map((att, idx) => (<a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"><File className="h-4 w-4" />{att.name}</a>))}</div></div>)}
          {announcement.links && announcement.links.length > 0 && (<div className="mt-4 pt-4 border-t border-gray-200"><h4 className="text-sm font-semibold text-gray-900 mb-2">Links</h4><div className="flex flex-wrap gap-2">{announcement.links.map((link, idx) => (<a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700"><ExternalLink className="h-4 w-4" />{link.title}</a>))}</div></div>)}
        </div>
      </div>
    </div>
  )
}

// Enhanced Announcement Modal
function AnnouncementModal({ departmentId, onClose, onSuccess }: { departmentId: string; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'normal', pinned: false, hero_image: '', attachments: [] as { name: string; url: string; type: string }[], links: [] as { title: string; url: string }[] })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'announcements')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormData({ ...formData, hero_image: data.url })
    } catch (err) { console.error(err) } finally { setUploading(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'announcements')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, url: data.url, type: file.type }] }))
      }
    } catch (err) { console.error(err) } finally { setUploading(false) }
  }

  const addLink = () => { if (newLink.title && newLink.url) { setFormData({ ...formData, links: [...formData.links, newLink] }); setNewLink({ title: '', url: '' }) } }
  const removeAttachment = (idx: number) => setFormData({ ...formData, attachments: formData.attachments.filter((_, i) => i !== idx) })
  const removeLink = (idx: number) => setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch(`/api/departments/${departmentId}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) throw new Error('Failed')
      onSuccess()
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-lg font-semibold">New Announcement</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image (optional)</label>
            {formData.hero_image ? (
              <div className="relative h-32 rounded-xl overflow-hidden"><Image src={formData.hero_image} alt="" fill className="object-cover" /><button type="button" onClick={() => setFormData({ ...formData, hero_image: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="h-4 w-4" /></button></div>
            ) : (
              <button type="button" onClick={() => heroInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-400 flex flex-col items-center justify-center text-gray-400 hover:text-teal-600">{uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><ImageIcon className="h-6 w-6 mb-1" /><span className="text-sm">Add hero image</span></>}</button>
            )}
            <input ref={heroInputRef} type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Content *</label><textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" rows={4} /></div>
          <div className="flex gap-4"><div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div><div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer pb-2"><input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })} className="w-4 h-4 text-teal-600 border-gray-300 rounded" /><span className="text-sm text-gray-700">Pin</span></label></div></div>
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            {formData.attachments.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{formData.attachments.map((att, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"><File className="h-4 w-4 text-gray-500" />{att.name}<button type="button" onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button></div>))}</div>)}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Add files</button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
          </div>
          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Links</label>
            {formData.links.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{formData.links.map((link, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-sm text-blue-700"><LinkIcon className="h-4 w-4" />{link.title}<button type="button" onClick={() => removeLink(idx)} className="text-blue-400 hover:text-red-500"><X className="h-3 w-3" /></button></div>))}</div>)}
            <div className="flex gap-2"><input type="text" placeholder="Title" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><input type="url" placeholder="https://..." value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><button type="button" onClick={addLink} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus className="h-4 w-4" /></button></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{loading ? 'Posting...' : 'Post'}</button></div>
        </form>
      </div>
    </div>
  )
}

// Enhanced Document Modal
function DocumentModal({ departmentId, onClose, onSuccess }: { departmentId: string; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: '', description: '', url: '', file_type: 'link', category: 'General', hero_image: '', attachments: [] as { name: string; url: string; type: string }[], links: [] as { title: string; url: string }[] })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'documents')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormData({ ...formData, hero_image: data.url })
    } catch (err) { console.error(err) } finally { setUploading(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData(); fd.append('file', file); fd.append('bucket', 'documents')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, url: data.url, type: file.type }] }))
      }
    } catch (err) { console.error(err) } finally { setUploading(false) }
  }

  const addLink = () => { if (newLink.title && newLink.url) { setFormData({ ...formData, links: [...formData.links, newLink] }); setNewLink({ title: '', url: '' }) } }
  const removeAttachment = (idx: number) => setFormData({ ...formData, attachments: formData.attachments.filter((_, i) => i !== idx) })
  const removeLink = (idx: number) => setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch(`/api/departments/${departmentId}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) throw new Error('Failed')
      onSuccess()
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-lg font-semibold">Add Document/SOP</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image (optional)</label>
            {formData.hero_image ? (
              <div className="relative h-32 rounded-xl overflow-hidden"><Image src={formData.hero_image} alt="" fill className="object-cover" /><button type="button" onClick={() => setFormData({ ...formData, hero_image: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="h-4 w-4" /></button></div>
            ) : (
              <button type="button" onClick={() => heroInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-400 flex flex-col items-center justify-center text-gray-400 hover:text-teal-600">{uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><ImageIcon className="h-6 w-6 mb-1" /><span className="text-sm">Add cover image</span></>}</button>
            )}
            <input ref={heroInputRef} type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="e.g., Employee Handbook" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="General">General</option><option value="SOP">SOP</option><option value="Policy">Policy</option><option value="Training">Training</option><option value="Form">Form</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Brief description" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Main URL (optional)</label><input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://..." /></div>
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Attachments</label>
            {formData.attachments.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{formData.attachments.map((att, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"><File className="h-4 w-4 text-gray-500" />{att.name}<button type="button" onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button></div>))}</div>)}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Upload files</button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
          </div>
          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Related Links</label>
            {formData.links.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{formData.links.map((link, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-sm text-blue-700"><LinkIcon className="h-4 w-4" />{link.title}<button type="button" onClick={() => removeLink(idx)} className="text-blue-400 hover:text-red-500"><X className="h-3 w-3" /></button></div>))}</div>)}
            <div className="flex gap-2"><input type="text" placeholder="Title" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><input type="url" placeholder="https://..." value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><button type="button" onClick={addLink} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus className="h-4 w-4" /></button></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{loading ? 'Adding...' : 'Add Document'}</button></div>
        </form>
      </div>
    </div>
  )
}
