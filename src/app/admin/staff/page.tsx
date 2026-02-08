'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus,
  Search,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  Edit2,
  UserX,
  UserCheck,
  ChevronDown,
  DollarSign,
  Calendar,
  FileText,
  Eye,
  X,
  Upload,
  User,
  Shield,
  Briefcase,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Staff, Role, StaffAttendance, Department } from '@/types'

interface StaffWithAttendance extends Staff {
  todayAttendance?: StaffAttendance
  department_details?: Department
}

interface PendingInvitation {
  id: string
  name: string
  email: string
  role_id: string
  department: string
  status: string
  created_at: string
  expires_at: string
  role?: { name: string }
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffWithAttendance[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch staff
      try {
        const staffRes = await fetch('/api/staff')
        const staffData = await staffRes.json()
        
        if (Array.isArray(staffData)) {
          // Fetch today's attendance
          try {
            const attendanceRes = await fetch(`/api/attendance?date=${today}`)
            const attendanceData = await attendanceRes.json()
            
            const staffWithAttendance = staffData.map((s: Staff) => ({
              ...s,
              todayAttendance: Array.isArray(attendanceData) 
                ? attendanceData.find((a: StaffAttendance) => a.staff_id === s.id)
                : undefined,
            }))
            setStaff(staffWithAttendance)
          } catch {
            setStaff(staffData)
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error)
      }

      // Fetch roles
      try {
        const rolesRes = await fetch('/api/roles')
        const rolesData = await rolesRes.json()
        if (Array.isArray(rolesData)) {
          setRoles(rolesData)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
      }

      // Fetch departments
      try {
        const deptRes = await fetch('/api/departments')
        const deptData = await deptRes.json()
        if (Array.isArray(deptData)) {
          setDepartments(deptData)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      }

      // Fetch pending invitations
      try {
        const invitesRes = await fetch('/api/staff/invitations')
        const invitesData = await invitesRes.json()
        if (Array.isArray(invitesData)) {
          setPendingInvitations(invitesData.filter((i: PendingInvitation) => i.status === 'pending'))
        }
      } catch (error) {
        console.error('Error fetching invitations:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDeactivateStaff = async (staffId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating staff status:', error)
    }
    setActionMenuId(null)
  }

  const handleResendInvitation = async (invitationId: string) => {
    setResendingId(invitationId)
    try {
      const res = await fetch(`/api/staff/invitations/${invitationId}/resend`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend invitation')
      }

      // Refresh data to show updated expiry
      fetchData()
      alert('Invitation resent successfully!')
    } catch (error) {
      console.error('Error resending invitation:', error)
      alert(error instanceof Error ? error.message : 'Failed to resend invitation')
    } finally {
      setResendingId(null)
    }
  }

  const isOnline = (attendance?: StaffAttendance) => {
    if (!attendance?.clock_in) return false
    if (attendance?.clock_out) return false
    return true
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {staff.length} staff members • {staff.filter(s => s.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pending Invitations ({pendingInvitations.length})
          </h2>
          <div className="space-y-2">
            {pendingInvitations.map((invite) => {
              const isExpired = new Date(invite.expires_at) < new Date()
              return (
                <div key={invite.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      {invite.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invite.name}</p>
                      <p className="text-sm text-gray-500">{invite.email}</p>
                      {isExpired && (
                        <p className="text-xs text-red-500 font-medium">Invitation expired</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-600">{invite.role?.name || 'Staff'}</p>
                      <p className="text-xs text-gray-400">{invite.department}</p>
                    </div>
                    <button
                      onClick={() => handleResendInvitation(invite.id)}
                      disabled={resendingId === invite.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Resend invitation"
                    >
                      <RefreshCw className={`h-4 w-4 ${resendingId === invite.id ? 'animate-spin' : ''}`} />
                      {resendingId === invite.id ? 'Sending...' : 'Resend'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-amber-600 mt-3">
            Invited staff will appear here until they complete onboarding
          </p>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                {member.profile_photo ? (
                  <img
                    src={member.profile_photo}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    isOnline(member.todayAttendance) ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : member.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  {member.role_details?.name || member.role}
                </p>
                {member.department && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Building className="h-3 w-3" />
                    {member.department}
                  </div>
                )}
                {member.employment_type && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Briefcase className="h-3 w-3" />
                    {member.employment_type}
                  </div>
                )}
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setActionMenuId(actionMenuId === member.id ? null : member.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {actionMenuId === member.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActionMenuId(null)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button
                        onClick={() => {
                          setSelectedStaff(member)
                          setShowViewModal(true)
                          setActionMenuId(null)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStaff(member)
                          setShowEditModal(true)
                          setActionMenuId(null)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeactivateStaff(member.id, member.status)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {member.status === 'active' ? (
                          <>
                            <UserX className="h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>

            {/* Clock Status */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {isOnline(member.todayAttendance) ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Clocked in at{' '}
                    {new Date(member.todayAttendance!.clock_in!).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ) : member.todayAttendance?.clock_out ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    Worked {member.todayAttendance.hours_worked?.toFixed(1)}h today
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <XCircle className="h-4 w-4" />
                  <span>Not clocked in</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No staff members found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by inviting your first staff member'}
          </p>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteStaffModal
          roles={roles}
          departments={departments}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            fetchData()
          }}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedStaff && (
        <ViewStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowViewModal(false)
            setSelectedStaff(null)
          }}
          onEdit={() => {
            setShowViewModal(false)
            setShowEditModal(true)
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          roles={roles}
          departments={departments}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStaff(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedStaff(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

// Invite Staff Modal
function InviteStaffModal({
  roles,
  departments,
  onClose,
  onSuccess,
}: {
  roles: Role[]
  departments: Department[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_id: '',
    department_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitation')
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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invite Staff Member</h2>
            <p className="text-sm text-gray-500">Send an invitation email with onboarding link</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select department</option>
              {departments.filter(d => d.is_active).map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
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
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Staff Modal
function ViewStaffModal({
  staff,
  onClose,
  onEdit,
}: {
  staff: Staff
  onClose: () => void
  onEdit: () => void
}) {
  const formatDate = (date: string | undefined) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-VU', {
      style: 'currency',
      currency: 'VUV',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Staff Profile</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            {staff.profile_photo ? (
              <img
                src={staff.profile_photo}
                alt={staff.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-3xl border-4 border-gray-100">
                {staff.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{staff.name}</h3>
              <p className="text-gray-600">{staff.role_details?.name || staff.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  staff.status === 'active' ? 'bg-green-100 text-green-700' :
                  staff.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {staff.status}
                </span>
                {staff.employment_type && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {staff.employment_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium text-gray-900">{staff.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone</span>
                <p className="font-medium text-gray-900">{staff.phone || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500">Address</span>
                <p className="font-medium text-gray-900">{staff.address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date of Birth</span>
                <p className="font-medium text-gray-900">{formatDate(staff.date_of_birth)}</p>
              </div>
              <div>
                <span className="text-gray-500">Gender</span>
                <p className="font-medium text-gray-900 capitalize">{staff.gender?.replace('_', ' ') || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Nationality</span>
                <p className="font-medium text-gray-900">{staff.nationality || '—'}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-600" />
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Contact Name</span>
                <p className="font-medium text-gray-900">{staff.emergency_contact_name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Contact Phone</span>
                <p className="font-medium text-gray-900">{staff.emergency_contact_phone || '—'}</p>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal-600" />
              Employment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Department</span>
                <p className="font-medium text-gray-900">{staff.department || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Date Employed</span>
                <p className="font-medium text-gray-900">{formatDate(staff.date_employed)}</p>
              </div>
              <div>
                <span className="text-gray-500">Contract End Date</span>
                <p className="font-medium text-gray-900">{formatDate(staff.contract_end_date)}</p>
              </div>
            </div>
          </div>

          {/* Salary & Banking */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-teal-600" />
              Salary & Banking
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Salary</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(staff.salary)} {staff.salary_frequency ? `(${staff.salary_frequency})` : ''}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Tax ID</span>
                <p className="font-medium text-gray-900">{staff.tax_id || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Bank Name</span>
                <p className="font-medium text-gray-900">{staff.bank_name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Account Number</span>
                <p className="font-medium text-gray-900">
                  {staff.bank_account_number ? `****${staff.bank_account_number.slice(-4)}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {staff.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                Notes
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{staff.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Edit Staff Modal - Comprehensive
function EditStaffModal({
  staff,
  roles,
  departments,
  onClose,
  onSuccess,
}: {
  staff: Staff
  roles: Role[]
  departments: Department[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'banking'>('personal')
  const [formData, setFormData] = useState({
    name: staff.name,
    email: staff.email,
    phone: staff.phone || '',
    profile_photo: staff.profile_photo || '',
    date_of_birth: staff.date_of_birth || '',
    gender: staff.gender || '',
    nationality: staff.nationality || '',
    address: staff.address || '',
    emergency_contact_name: staff.emergency_contact_name || '',
    emergency_contact_phone: staff.emergency_contact_phone || '',
    role_id: staff.role_id || '',
    department_id: staff.department_id || '',
    date_employed: staff.date_employed || '',
    employment_type: staff.employment_type || 'full-time',
    contract_end_date: staff.contract_end_date || '',
    salary: staff.salary?.toString() || '',
    salary_frequency: staff.salary_frequency || 'monthly',
    bank_name: staff.bank_name || '',
    bank_account_number: staff.bank_account_number || '',
    tax_id: staff.tax_id || '',
    notes: staff.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('bucket', 'staff-photos')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      setFormData({ ...formData, profile_photo: data.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const updateData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      }

      const res = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update staff')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'banking', label: 'Banking', icon: CreditCard },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Staff Member</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {formData.profile_photo ? (
                    <img
                      src={formData.profile_photo}
                      alt={formData.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-2xl border-2 border-gray-200">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    {uploading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="+678 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., Ni-Vanuatu"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={2}
                  placeholder="Home address"
                />
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select department</option>
                    {departments.filter(d => d.is_active).map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as 'full-time' | 'part-time' | 'contract' | 'casual' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Employed</label>
                  <input
                    type="date"
                    value={formData.date_employed}
                    onChange={(e) => setFormData({ ...formData, date_employed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                  <input
                    type="date"
                    value={formData.contract_end_date}
                    onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank for permanent staff</p>
                </div>
              </div>

              {/* Salary */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                  Salary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Amount (VUV)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={formData.salary_frequency}
                      onChange={(e) => setFormData({ ...formData, salary_frequency: e.target.value as 'hourly' | 'weekly' | 'fortnightly' | 'monthly' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={4}
                  placeholder="Additional notes about this staff member..."
                />
              </div>
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === 'banking' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Banking information is sensitive. Only authorized personnel should view or modify these details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., ANZ, BSP, Bred Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Bank account number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / TIN</label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
