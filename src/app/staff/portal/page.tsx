'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  LogIn,
  LogOut,
  Megaphone,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Pin,
  Home,
  History,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Shield,
  X,
  Save,
  Upload,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Staff, StaffAttendance, Announcement, StaffTask } from '@/types'

interface AttendanceRecord extends StaffAttendance {
  date: string
}

export default function StaffPortalPage() {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<StaffAttendance | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [tasks, setTasks] = useState<StaffTask[]>([])
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'attendance'>('dashboard')

  const router = useRouter()
  const supabase = createClientSupabase()

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: staffData } = await supabase
        .from('staff')
        .select(`
          *,
          role_details:roles(*)
        `)
        .eq('email', user.email)
        .single()

      if (!staffData) {
        router.push('/admin/login')
        return
      }

      setStaff(staffData)

      const today = new Date().toISOString().split('T')[0]

      // Fetch today's attendance
      const attendanceRes = await fetch(`/api/attendance?staffId=${staffData.id}&date=${today}`)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setTodayAttendance(attendanceData[0] || null)
      }

      // Fetch attendance history (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const startDate = thirtyDaysAgo.toISOString().split('T')[0]
      
      try {
        const historyRes = await fetch(`/api/attendance?staffId=${staffData.id}&startDate=${startDate}&endDate=${today}`)
        if (historyRes.ok) {
          const historyData = await historyRes.json()
          if (Array.isArray(historyData)) {
            setAttendanceHistory(historyData.sort((a: AttendanceRecord, b: AttendanceRecord) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ))
          }
        }
      } catch {
        // Attendance history endpoint might not exist
      }

      // Fetch announcements
      const announcementsRes = await fetch(`/api/announcements?staffId=${staffData.id}`)
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.slice(0, 5))
      }

      // Fetch tasks
      try {
        const tasksRes = await fetch(`/api/tasks?assignedTo=${staffData.id}&status=pending`)
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }
      } catch {
        // Tasks endpoint might not exist
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleClockIn = async () => {
    if (!staff) return
    setClockingIn(true)

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staff.id,
          action: 'clock_in',
        }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error clocking in:', error)
    } finally {
      setClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    if (!staff) return
    setClockingOut(true)

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staff.id,
          action: 'clock_out',
        }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error clocking out:', error)
    } finally {
      setClockingOut(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const markAnnouncementAsRead = async (announcementId: string) => {
    if (!staff) return

    try {
      await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staff.id }),
      })
    } catch {
      // Silently fail
    }
  }

  const isClockedIn = todayAttendance?.clock_in && !todayAttendance?.clock_out

  // Calculate this month's stats
  const thisMonthStats = attendanceHistory.reduce((acc, record) => {
    const recordDate = new Date(record.date)
    const now = new Date()
    if (recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()) {
      acc.daysWorked++
      acc.hoursWorked += record.hours_worked || 0
    }
    return acc
  }, { daysWorked: 0, hoursWorked: 0 })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          <p className="text-gray-500 text-sm">Loading staff portal...</p>
        </div>
      </div>
    )
  }

  if (!staff) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {staff.profile_photo ? (
              <img
                src={staff.profile_photo}
                alt={staff.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                {staff.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-lg">{staff.name}</h1>
              <p className="text-xs text-teal-100">
                {staff.role_details?.name || staff.role} • {staff.department || 'No Department'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'attendance', label: 'Attendance', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-50 text-teal-700'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Clock In/Out Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Today&apos;s Attendance</span>
                </div>
                <p className="text-teal-100 text-sm mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isClockedIn ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {isClockedIn ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <Clock className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-semibold text-lg ${
                          isClockedIn ? 'text-green-600' : 'text-gray-700'
                        }`}
                      >
                        {isClockedIn ? 'On Duty' : 'Off Duty'}
                      </p>
                      {todayAttendance?.clock_in && (
                        <p className="text-sm text-gray-500">
                          Clocked in at{' '}
                          {new Date(todayAttendance.clock_in).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                      {todayAttendance?.clock_out && (
                        <p className="text-sm text-gray-500">
                          Clocked out at{' '}
                          {new Date(todayAttendance.clock_out).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {todayAttendance.hours_worked && (
                            <span className="ml-2">
                              ({todayAttendance.hours_worked.toFixed(1)}h worked)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {!todayAttendance?.clock_out && (
                    <button
                      onClick={isClockedIn ? handleClockOut : handleClockIn}
                      disabled={clockingIn || clockingOut}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        isClockedIn
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isClockedIn ? (
                        <>
                          <LogOut className="h-5 w-5" />
                          {clockingOut ? 'Clocking Out...' : 'Clock Out'}
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5" />
                          {clockingIn ? 'Clocking In...' : 'Clock In'}
                        </>
                      )}
                    </button>
                  )}

                  {todayAttendance?.clock_out && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Shift completed for today</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                <p className="text-xs text-gray-500">Pending Tasks</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {announcements.filter((a) => !a.is_read).length}
                </p>
                <p className="text-xs text-gray-500">Unread Announcements</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{thisMonthStats.daysWorked}</p>
                <p className="text-xs text-gray-500">Days This Month</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {thisMonthStats.hoursWorked.toFixed(1)}h
                </p>
                <p className="text-xs text-gray-500">Hours This Month</p>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Announcements</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {announcements.filter((a) => !a.is_read).length} unread
                </span>
              </div>

              {announcements.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      onClick={() => markAnnouncementAsRead(announcement.id)}
                      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                        !announcement.is_read ? 'bg-teal-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg ${
                            announcement.pinned
                              ? 'bg-purple-100 text-purple-600'
                              : announcement.priority === 'urgent'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-teal-100 text-teal-600'
                          }`}
                        >
                          {announcement.pinned ? (
                            <Pin className="h-4 w-4" />
                          ) : (
                            <Megaphone className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                            {!announcement.is_read && (
                              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(announcement.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Megaphone className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No announcements</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
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
                    <h2 className="text-2xl font-bold text-gray-900">{staff.name}</h2>
                    <p className="text-gray-600">{staff.role_details?.name || staff.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-teal-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{staff.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{staff.address || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Contact Name</p>
                  <p className="font-medium text-gray-900">{staff.emergency_contact_name || 'Not set'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Contact Phone</p>
                  <p className="font-medium text-gray-900">{staff.emergency_contact_phone || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-teal-600" />
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{staff.department || 'Not assigned'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Date Employed</p>
                  <p className="font-medium text-gray-900">
                    {staff.date_employed ? new Date(staff.date_employed).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Employment Type</p>
                  <p className="font-medium text-gray-900 capitalize">{staff.employment_type || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  Today&apos;s Status
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isClockedIn ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isClockedIn ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isClockedIn ? 'text-green-600' : 'text-gray-600'}`}>
                      {isClockedIn ? 'Currently on duty' : 'Not clocked in'}
                    </p>
                    {todayAttendance?.clock_in && (
                      <p className="text-sm text-gray-500">
                        Started at {new Date(todayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
                
                {!todayAttendance?.clock_out && (
                  <button
                    onClick={isClockedIn ? handleClockOut : handleClockIn}
                    disabled={clockingIn || clockingOut}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isClockedIn
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isClockedIn ? 'Clock Out' : 'Clock In'}
                  </button>
                )}
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                This Month&apos;s Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-3xl font-bold text-teal-600">{thisMonthStats.daysWorked}</p>
                  <p className="text-sm text-gray-600">Days Worked</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-3xl font-bold text-teal-600">{thisMonthStats.hoursWorked.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-teal-600" />
                  Recent Attendance
                </h3>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              
              {attendanceHistory.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {attendanceHistory.slice(0, 10).map((record) => (
                    <div key={record.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          record.status === 'present' ? 'bg-green-500' :
                          record.status === 'late' ? 'bg-yellow-500' :
                          record.status === 'absent' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.clock_in && new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {record.clock_out && ` - ${new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {record.status}
                        </span>
                        {record.hours_worked && (
                          <p className="text-sm text-gray-500 mt-1">{record.hours_worked.toFixed(1)}h</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <History className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No attendance records yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          staff={staff}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

// Edit Profile Modal (self-service - limited fields)
function EditProfileModal({
  staff,
  onClose,
  onSuccess,
}: {
  staff: Staff
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    phone: staff.phone || '',
    address: staff.address || '',
    emergency_contact_name: staff.emergency_contact_name || '',
    emergency_contact_phone: staff.emergency_contact_phone || '',
    profile_photo: staff.profile_photo || '',
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
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
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
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
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

          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            {formData.profile_photo ? (
              <img
                src={formData.profile_photo}
                alt={staff.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl border-2 border-gray-200">
                {staff.name.charAt(0).toUpperCase()}
              </div>
            )}
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
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="+678 1234567"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={2}
              placeholder="Your home address"
            />
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-600" />
              Emergency Contact
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Family member or friend"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="+678 1234567"
                />
              </div>
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
              disabled={loading || uploading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
