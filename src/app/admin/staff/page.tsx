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
} from 'lucide-react'
import { Staff, Role, StaffAttendance, Department } from '@/types'

interface StaffWithAttendance extends Staff {
  todayAttendance?: StaffAttendance
  department_details?: Department
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffWithAttendance[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch staff
      const staffRes = await fetch('/api/staff')
      const staffData = await staffRes.json()

      // Fetch today's attendance
      const attendanceRes = await fetch(`/api/attendance?date=${today}`)
      const attendanceData = await attendanceRes.json()

      // Merge attendance with staff
      const staffWithAttendance = staffData.map((s: Staff) => ({
        ...s,
        todayAttendance: attendanceData.find((a: StaffAttendance) => a.staff_id === s.id),
      }))

      setStaff(staffWithAttendance)

      // Fetch roles
      const rolesRes = await fetch('/api/roles')
      const rolesData = await rolesRes.json()
      setRoles(rolesData)

      // Fetch departments
      const deptRes = await fetch('/api/departments')
      const deptData = await deptRes.json()
      setDepartments(deptData)
    } catch (error) {
      console.error('Error fetching data:', error)
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
                {/* Online indicator */}
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

// Invite Staff Modal Component
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invite Staff Member</h2>
          <p className="text-sm text-gray-500">Send an invitation email with onboarding link</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select department</option>
              {departments.filter(d => d.is_active).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
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

// Edit Staff Modal Component
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
  const [formData, setFormData] = useState({
    name: staff.name,
    email: staff.email,
    role_id: staff.role_id || '',
    department_id: (staff as StaffWithAttendance & { department_id?: string }).department_id || '',
    phone: staff.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Staff Member</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="+678 1234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select department</option>
              {departments.filter(d => d.is_active).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
