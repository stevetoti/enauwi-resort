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
  ChevronRight,
  User,
  Building,
  Pin,
  Home,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Staff, StaffAttendance, Announcement, StaffShift, StaffTask } from '@/types'

export default function StaffPortalPage() {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<StaffAttendance | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [tasks, setTasks] = useState<StaffTask[]>([])
  const [shifts, setShifts] = useState<StaffShift[]>([])
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)

  const router = useRouter()
  const supabase = createClientSupabase()

  const fetchData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin/login')
        return
      }

      // Fetch staff info
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

      // Fetch announcements
      const announcementsRes = await fetch(`/api/announcements?staffId=${staffData.id}`)
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.slice(0, 5))
      }

      // Fetch tasks (if endpoint exists)
      try {
        const tasksRes = await fetch(`/api/tasks?assignedTo=${staffData.id}&status=pending`)
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }
      } catch {
        // Tasks endpoint might not exist yet
      }

      // Fetch shifts (if endpoint exists)
      try {
        const shiftsRes = await fetch(`/api/shifts?staffId=${staffData.id}&startDate=${today}`)
        if (shiftsRes.ok) {
          const shiftsData = await shiftsRes.json()
          setShifts(shiftsData)
        }
      } catch {
        // Shifts endpoint might not exist yet
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
      <header className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center font-bold">
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-semibold">{staff.name}</h1>
              <p className="text-xs text-blue-300">
                {staff.role_details?.name || staff.role} • {staff.department || 'No Department'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition-colors"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Clock In/Out Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Today&apos;s Attendance</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">
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
              {/* Status */}
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

              {/* Action Button */}
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
            <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
            <p className="text-xs text-gray-500">Upcoming Shifts</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {todayAttendance?.hours_worked?.toFixed(1) || '0'}h
            </p>
            <p className="text-xs text-gray-500">Hours Today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Today&apos;s Tasks</h2>
              </div>
              <span className="text-sm text-gray-500">{tasks.length} pending</span>
            </div>

            {tasks.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 p-1 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-600'
                            : task.priority === 'high'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {task.priority === 'urgent' || task.priority === 'high' ? (
                          <AlertCircle className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        {task.due_time && (
                          <p className="text-xs text-gray-500">Due at {task.due_time}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending tasks</p>
              </div>
            )}
          </div>

          {/* My Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">My Schedule</h2>
              </div>
            </div>

            {shifts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {shifts.slice(0, 5).map((shift) => (
                  <div key={shift.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(shift.date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {shift.start_time} - {shift.end_time}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          shift.shift_type === 'regular'
                            ? 'bg-blue-100 text-blue-700'
                            : shift.shift_type === 'overtime'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {shift.shift_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No upcoming shifts scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Feed */}
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
                    !announcement.is_read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 p-1.5 rounded-lg ${
                        announcement.pinned
                          ? 'bg-purple-100 text-purple-600'
                          : announcement.priority === 'urgent'
                          ? 'bg-red-100 text-red-600'
                          : announcement.priority === 'high'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {announcement.pinned ? (
                        <Pin className="h-4 w-4" />
                      ) : announcement.priority === 'urgent' ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Megaphone className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        {!announcement.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{formatDate(announcement.created_at)}</span>
                        {announcement.author && <span>by {announcement.author.name}</span>}
                      </div>
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

        {/* My Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {staff.profile_photo ? (
                <img
                  src={staff.profile_photo}
                  alt={staff.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{staff.name}</h3>
              <p className="text-sm text-gray-600">{staff.role_details?.name || staff.role}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                {staff.department && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {staff.department}
                  </span>
                )}
                <span>{staff.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
