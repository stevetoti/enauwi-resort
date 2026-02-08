'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock,
  LogIn,
  LogOut,
  Megaphone,
  Calendar,
  CheckCircle,

  Building2,
  Pin,
  Home,
  History,
  FileText,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Users,
  BookOpen,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Staff {
  id: string
  name: string
  email: string
  role: string
  role_id: string
  department?: string
  department_id?: string
  profile_photo?: string
  phone?: string
  position?: string
  permissions?: Record<string, { view?: boolean }>
}

interface Department {
  id: string
  name: string
  description?: string
  manager_id?: string
  manager?: { name: string; email: string }
}

interface DepartmentDocument {
  id: string
  title: string
  content?: string
  document_type: string
  hero_image?: string
  attachments?: { name: string; url: string; type: string }[]
  links?: { title: string; url: string }[]
  created_at: string
}

interface DepartmentAnnouncement {
  id: string
  title: string
  content: string
  priority?: string
  hero_image?: string
  attachments?: { name: string; url: string; type: string }[]
  created_at: string
}

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  pinned: boolean
  hero_image?: string
  attachments?: { name: string; url: string; type: string }[]
  links?: { title: string; url: string }[]
  created_at: string
  is_read?: boolean
}

interface Attendance {
  id: string
  date: string
  clock_in?: string
  clock_out?: string
  status: string
  total_hours?: number
}

export default function StaffPortalPage() {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [departmentDocs, setDepartmentDocs] = useState<DepartmentDocument[]>([])
  const [departmentAnnouncements, setDepartmentAnnouncements] = useState<DepartmentAnnouncement[]>([])
  const [companyAnnouncements, setCompanyAnnouncements] = useState<Announcement[]>([])
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])
  const [teamMembers, setTeamMembers] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'department' | 'announcements' | 'attendance'>('dashboard')

  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      // Check localStorage for staff session
      const staffData = localStorage.getItem('staff')
      if (!staffData) {
        router.push('/admin/login')
        return
      }

      const staffInfo = JSON.parse(staffData)
      setStaff(staffInfo)

      const today = new Date().toISOString().split('T')[0]

      // Fetch today's attendance
      const attendanceRes = await fetch(`/api/attendance?staffId=${staffInfo.id}&date=${today}`)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setTodayAttendance(Array.isArray(attendanceData) ? attendanceData[0] : null)
      }

      // Fetch attendance history (last 14 days)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const startDate = twoWeeksAgo.toISOString().split('T')[0]
      
      const historyRes = await fetch(`/api/attendance?staffId=${staffInfo.id}&startDate=${startDate}&endDate=${today}`)
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        if (Array.isArray(historyData)) {
          setAttendanceHistory(historyData.sort((a: Attendance, b: Attendance) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ))
        }
      }

      // Fetch company-wide announcements
      const announcementsRes = await fetch(`/api/announcements?staffId=${staffInfo.id}`)
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setCompanyAnnouncements(announcementsData.slice(0, 5))
      }

      // Fetch department info if staff has a department
      if (staffInfo.department_id) {
        // Fetch department details
        const deptRes = await fetch(`/api/departments/${staffInfo.department_id}`)
        if (deptRes.ok) {
          const deptData = await deptRes.json()
          setDepartment(deptData)
        }

        // Fetch department documents (SOPs, guidelines)
        const docsRes = await fetch(`/api/departments/${staffInfo.department_id}/documents`)
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setDepartmentDocs(docsData)
        }

        // Fetch department announcements
        const deptAnnRes = await fetch(`/api/departments/${staffInfo.department_id}/announcements`)
        if (deptAnnRes.ok) {
          const deptAnnData = await deptAnnRes.json()
          setDepartmentAnnouncements(deptAnnData)
        }

        // Fetch team members
        const teamRes = await fetch(`/api/staff?department_id=${staffInfo.department_id}`)
        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeamMembers(teamData.filter((m: Staff) => m.id !== staffInfo.id))
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

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
        body: JSON.stringify({ staff_id: staff.id, action: 'clock_in' }),
      })
      if (res.ok) fetchData()
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
        body: JSON.stringify({ staff_id: staff.id, action: 'clock_out' }),
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error clocking out:', error)
    } finally {
      setClockingOut(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('staff')
    router.push('/admin/login')
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-gray-500">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!staff) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                {staff.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-semibold">Welcome, {staff.name.split(' ')[0]}!</h1>
                <p className="text-sm text-teal-200">{staff.position || staff.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-teal-200 hover:text-white flex items-center gap-1">
                <Home className="h-4 w-4" /> Website
              </Link>
              <button onClick={handleLogout} className="text-sm text-teal-200 hover:text-white flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'department', label: 'My Department', icon: Building2 },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'attendance', label: 'Attendance', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Clock In/Out Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-teal-600" />
                    Time Clock
                  </h2>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{getCurrentTime()}</p>
                  <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {!todayAttendance?.clock_in ? (
                    <button
                      onClick={handleClockIn}
                      disabled={clockingIn}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                    >
                      {clockingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                      Clock In
                    </button>
                  ) : !todayAttendance?.clock_out ? (
                    <button
                      onClick={handleClockOut}
                      disabled={clockingOut}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
                    >
                      {clockingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                      Clock Out
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Completed for today
                    </div>
                  )}
                  {todayAttendance && (
                    <div className="text-sm text-gray-500 text-center">
                      {todayAttendance.clock_in && <span>In: {new Date(todayAttendance.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                      {todayAttendance.clock_out && <span> • Out: {new Date(todayAttendance.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg"><Calendar className="h-5 w-5 text-teal-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{attendanceHistory.filter(a => a.clock_in).length}</p>
                    <p className="text-xs text-gray-500">Days Present (14d)</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><Megaphone className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{companyAnnouncements.filter(a => !a.is_read).length}</p>
                    <p className="text-xs text-gray-500">Unread Announcements</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                    <p className="text-xs text-gray-500">Team Members</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><BookOpen className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{departmentDocs.length}</p>
                    <p className="text-xs text-gray-500">SOPs & Guidelines</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Announcements</h2>
                <button onClick={() => setActiveTab('announcements')} className="text-sm text-teal-600 hover:text-teal-700">View All</button>
              </div>
              {companyAnnouncements.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {companyAnnouncements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        {ann.pinned && <Pin className="h-4 w-4 text-purple-600 mt-1" />}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{ann.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(ann.created_at)}</p>
                        </div>
                        {ann.priority === 'urgent' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No announcements yet</div>
              )}
            </div>
          </div>
        )}

        {/* Department Tab */}
        {activeTab === 'department' && (
          <div className="space-y-6">
            {department ? (
              <>
                {/* Department Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 rounded-xl">
                      <Building2 className="h-8 w-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{department.name}</h2>
                      {department.description && <p className="text-gray-600 mt-1">{department.description}</p>}
                      {department.manager && (
                        <p className="text-sm text-gray-500 mt-2">Manager: {department.manager.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-600" />
                      Team Members ({teamMembers.length})
                    </h2>
                  </div>
                  {teamMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.position || member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No other team members</div>
                  )}
                </div>

                {/* SOPs & Guidelines */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-600" />
                      SOPs & Guidelines
                    </h2>
                  </div>
                  {departmentDocs.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {departmentDocs.map((doc) => (
                        <div key={doc.id} className="p-6">
                          {doc.hero_image && (
                            <div className="relative h-32 rounded-lg overflow-hidden mb-4 bg-gray-100">
                              <Image src={doc.hero_image} alt={doc.title} fill className="object-cover" />
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">{doc.document_type}</span>
                              </div>
                              {doc.content && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{doc.content}</p>}
                              
                              {/* Attachments */}
                              {doc.attachments && doc.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {doc.attachments.map((att, idx) => (
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

                              {/* Links */}
                              {doc.links && doc.links.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {doc.links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs text-blue-700"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {link.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No documents available yet</div>
                  )}
                </div>

                {/* Department Announcements */}
                {departmentAnnouncements.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-teal-600" />
                        Department Announcements
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {departmentAnnouncements.map((ann) => (
                        <div key={ann.id} className="p-6">
                          {ann.hero_image && (
                            <div className="relative h-32 rounded-lg overflow-hidden mb-4 bg-gray-100">
                              <Image src={ann.hero_image} alt={ann.title} fill className="object-cover" />
                            </div>
                          )}
                          <h3 className="font-medium text-gray-900">{ann.title}</h3>
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{ann.content}</p>
                          <p className="text-xs text-gray-400 mt-3">{formatDate(ann.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Department Assigned</h3>
                <p className="text-gray-500 mt-2">Contact your administrator to be assigned to a department</p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">All Announcements</h2>
              </div>
              {companyAnnouncements.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {companyAnnouncements.map((ann) => (
                    <div key={ann.id} className="p-6">
                      {ann.hero_image && (
                        <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                          <Image src={ann.hero_image} alt={ann.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        {ann.pinned && <Pin className="h-4 w-4 text-purple-600 mt-1" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                            {ann.priority === 'urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>}
                            {ann.pinned && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Pinned</span>}
                          </div>
                          <p className="text-gray-600 mt-2 whitespace-pre-wrap">{ann.content}</p>
                          
                          {/* Attachments */}
                          {ann.attachments && ann.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {ann.attachments.map((att, idx) => (
                                <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">
                                  <FileText className="h-3 w-3" />{att.name}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          {/* Links */}
                          {ann.links && ann.links.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {ann.links.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs text-blue-700">
                                  <ExternalLink className="h-3 w-3" />{link.title}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-3">{formatDate(ann.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">No announcements yet</div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Attendance History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Attendance History (Last 14 Days)</h2>
              </div>
              {attendanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{formatDate(record.date)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.clock_in ? new Date(record.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.clock_out ? new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.total_hours ? `${record.total_hours.toFixed(1)}h` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.status === 'present' ? 'bg-green-100 text-green-700' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {record.status || 'Present'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">No attendance records yet</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
