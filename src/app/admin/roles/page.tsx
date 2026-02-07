'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  X,
  Check,
  Lock,
  Eye,
  PenLine,
  Trash,
  UserPlus,
  Send,
} from 'lucide-react'
import { Role, PERMISSION_AREAS, Permissions } from '@/types'

interface RoleWithCount extends Role {
  member_count?: number
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleWithCount | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      
      // Fetch member counts for each role
      const rolesWithCounts = await Promise.all(
        data.map(async (role: Role) => {
          const countRes = await fetch(`/api/roles/${role.id}`)
          const roleData = await countRes.json()
          return { ...role, member_count: roleData.member_count || 0 }
        })
      )
      
      setRoles(rolesWithCounts)
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to delete role')
        return
      }

      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
    }
    setActionMenuId(null)
  }

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Count total permissions for a role
  const countPermissions = (permissions: Permissions): number => {
    let count = 0
    Object.values(permissions).forEach((area) => {
      if (area && typeof area === 'object') {
        Object.values(area).forEach((value) => {
          if (value === true) count++
        })
      }
    })
    return count
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
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define roles and their permissions to control staff access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    role.is_system_role 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      {role.is_system_role && (
                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {role.member_count || 0} members
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActionMenuId(actionMenuId === role.id ? null : role.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {actionMenuId === role.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActionMenuId(null)}
                      />
                      <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        <button
                          onClick={() => {
                            setSelectedRole(role)
                            setShowEditModal(true)
                            setActionMenuId(null)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        {!role.is_system_role && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {role.description && (
                <p className="text-sm text-gray-600 mt-3">{role.description}</p>
              )}

              {/* Permission Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Permissions</span>
                  <span className="font-medium text-gray-900">
                    {countPermissions(role.permissions)} enabled
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Object.entries(role.permissions).map(([area, perms]) => {
                    if (!perms || typeof perms !== 'object') return null
                    const hasAnyPermission = Object.values(perms).some(v => v === true)
                    if (!hasAnyPermission) return null
                    
                    return (
                      <span
                        key={area}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full"
                      >
                        {area}
                      </span>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedRole(role)
                  setShowEditModal(true)
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span>Configure Permissions</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No roles found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first role to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <RoleModal
          role={showEditModal ? selectedRole : null}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedRole(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedRole(null)
            fetchRoles()
          }}
        />
      )}
    </div>
  )
}

// Role Create/Edit Modal with Permission Matrix
function RoleModal({
  role,
  onClose,
  onSuccess,
}: {
  role: RoleWithCount | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || {} as Permissions,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  // Get permission value
  const getPermission = (area: string, action: string): boolean => {
    const areaPerms = formData.permissions[area as keyof Permissions]
    if (!areaPerms || typeof areaPerms !== 'object') return false
    return (areaPerms as Record<string, boolean>)[action] === true
  }

  // Set permission value
  const setPermission = (area: string, action: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [area]: {
          ...(prev.permissions[area as keyof Permissions] as Record<string, boolean> || {}),
          [action]: value
        }
      }
    }))
  }

  // Toggle all permissions for an area
  const toggleAreaAll = (area: string, actions: { key: string }[]) => {
    const allEnabled = actions.every(a => getPermission(area, a.key))
    actions.forEach(a => setPermission(area, a.key, !allEnabled))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = role ? `/api/roles/${role.id}` : '/api/roles'
      const method = role ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save role')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Get icon for action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return Eye
      case 'create': return UserPlus
      case 'edit': return PenLine
      case 'delete': return Trash
      case 'send': return Send
      default: return Check
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {role ? 'Edit Role' : 'Create Role'}
            </h2>
            {role?.is_system_role && (
              <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                <Lock className="h-3.5 w-3.5" />
                System role - name cannot be changed
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 flex-shrink-0">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'permissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Permissions
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={role?.is_system_role}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., Front Desk Manager"
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
                    placeholder="Brief description of this role's responsibilities"
                  />
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Configure what this role can access. Enable specific actions for each area.
                </p>

                <div className="space-y-3">
                  {PERMISSION_AREAS.map((area) => {
                    const allEnabled = area.actions.every(a => getPermission(area.key, a.key))
                    const someEnabled = area.actions.some(a => getPermission(area.key, a.key))
                    
                    return (
                      <div
                        key={area.key}
                        className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                      >
                        {/* Area Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                          <div>
                            <h4 className="font-medium text-gray-900">{area.label}</h4>
                            <p className="text-xs text-gray-500">{area.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleAreaAll(area.key, area.actions)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              allEnabled
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : someEnabled
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {allEnabled ? 'Disable All' : 'Enable All'}
                          </button>
                        </div>

                        {/* Action Toggles */}
                        <div className="px-4 py-3 flex flex-wrap gap-3">
                          {area.actions.map((action) => {
                            const isEnabled = getPermission(area.key, action.key)
                            const Icon = getActionIcon(action.key)
                            
                            return (
                              <label
                                key={action.key}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                  isEnabled
                                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={(e) => setPermission(area.key, action.key, e.target.checked)}
                                  className="sr-only"
                                />
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{action.label}</span>
                                {isEnabled && (
                                  <Check className="h-4 w-4 text-blue-600" />
                                )}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
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
              {loading ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
