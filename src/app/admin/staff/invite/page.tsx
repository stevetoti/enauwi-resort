'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Trash2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StaffInvitation, Role } from '@/types'

export default function StaffInvitePage() {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_id: '',
    department: '',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [invitationsRes, rolesRes] = await Promise.all([
        fetch('/api/staff/invitations'),
        fetch('/api/roles'),
      ])

      const invitationsData = await invitationsRes.json()
      const rolesData = await rolesRes.json()

      setInvitations(invitationsData)
      setRoles(rolesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingInvite(true)
    setFormError('')
    setFormSuccess('')

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

      setFormSuccess(`Invitation sent to ${formData.email}`)
      setFormData({ name: '', email: '', role_id: '', department: '' })
      fetchData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSendingInvite(false)
    }
  }

  const handleResendInvite = async (invitation: StaffInvitation) => {
    try {
      const res = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitation.email,
          name: invitation.name,
          role_id: invitation.role_id,
          department: invitation.department,
        }),
      })

      if (res.ok) {
        setFormSuccess(`Invitation resent to ${invitation.email}`)
        fetchData()
      }
    } catch (error) {
      console.error('Error resending invite:', error)
    }
  }

  const handleCancelInvite = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/staff/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error cancelling invite:', error)
    }
  }

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date() && status === 'pending'

    if (isExpired || status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          <AlertCircle className="h-3 w-3" />
          Expired
        </span>
      )
    }

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending')
  const pastInvitations = invitations.filter((inv) => inv.status !== 'pending')

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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/staff"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invite Staff</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send invitations and manage pending invites
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Send Invitation</h2>
            <p className="text-sm text-gray-500">
              The invitee will receive an email with an onboarding link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {formSuccess}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select department</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
              {sendingInvite ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>

        {/* Pending Invitations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Invitations ({pendingInvitations.length})
            </h2>
          </div>

          {pendingInvitations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {invitation.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{invitation.name}</h3>
                        <p className="text-sm text-gray-500">{invitation.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {invitation.role && (
                            <span className="text-xs text-gray-500">{invitation.role.name}</span>
                          )}
                          {invitation.department && (
                            <span className="text-xs text-gray-400">• {invitation.department}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(invitation.status, invitation.expires_at)}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Sent {formatDate(invitation.created_at)}
                      {invitation.inviter && ` by ${invitation.inviter.name}`}
                    </span>
                    <span>Expires {formatDate(invitation.expires_at)}</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleResendInvite(invitation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend
                    </button>
                    <button
                      onClick={() => handleCancelInvite(invitation.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No pending invitations</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Invitations */}
      {pastInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Past Invitations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pastInvitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invitation.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{invitation.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {invitation.role?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invitation.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
