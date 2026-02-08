'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {

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
  Settings,
  Camera,
  X,
  Eye,
  ChevronRight,
  Bell,
  Menu,
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

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  pinned: boolean
  hero_image?: string
  attachments?: { name: string; url: string; type: string }[]
  links?: { title: string; url: string }[]
  author?: { name: string }
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
  const [companyAnnouncements, setCompanyAnnouncements] = useState<Announcement[]>([])
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])
  const [teamMembers, setTeamMembers] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'department' | 'announcements' | 'attendance' | 'settings'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const staffData = localStorage.getItem('staff')
      if (!staffData) {
        router.push('/admin/login')
        return
      }

      let staffInfo = JSON.parse(staffData)
      
      // Always refresh staff data from server to get latest department_id
      try {
        const refreshRes = await fetch(`/api/staff/${staffInfo.id}`)
        if (refreshRes.ok) {
          const freshData = await refreshRes.json()
          // Merge fresh data with existing (keep permissions from login)
          staffInfo = {
            ...staffInfo,
            department: freshData.department,
            department_id: freshData.department_id,
            position: freshData.position,
            profile_photo: freshData.profile_photo,
            phone: freshData.phone,
          }
          localStorage.setItem('staff', JSON.stringify(staffInfo))
        }
      } catch (e) {
        console.error('Failed to refresh staff data:', e)
      }
      
      setStaff(staffInfo)

      const today = new Date().toISOString().split('T')[0]

      // Fetch today's attendance
      const attendanceRes = await fetch(`/api/attendance?staffId=${staffInfo.id}&date=${today}`)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setTodayAttendance(Array.isArray(attendanceData) ? attendanceData[0] : null)
      }

      // Fetch attendance history
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

      // Fetch announcements
      const announcementsRes = await fetch(`/api/announcements?staffId=${staffInfo.id}`)
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setCompanyAnnouncements(announcementsData)
      }

      // Fetch department info
      if (staffInfo.department_id) {
        const deptRes = await fetch(`/api/departments/${staffInfo.department_id}`)
        if (deptRes.ok) {
          const deptData = await deptRes.json()
          setDepartment(deptData)
        }

        const docsRes = await fetch(`/api/departments/${staffInfo.department_id}/documents`)
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setDepartmentDocs(docsData)
        }

        const teamRes = await fetch(`/api/staff?department_id=${staffInfo.department_id}`)
        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeamMembers(teamData.filter((m: Staff) => m.id !== staffInfo.id))
        }
      } else if (staffInfo.department) {
        // If department_id not in localStorage, try to fetch by department name
        const deptsRes = await fetch('/api/departments')
        if (deptsRes.ok) {
          const depts = await deptsRes.json()
          const matchingDept = depts.find((d: Department) => 
            d.name.toLowerCase() === staffInfo.department?.toLowerCase()
          )
          if (matchingDept) {
            setDepartment(matchingDept)
            // Update localStorage with department_id
            const updatedStaff = { ...staffInfo, department_id: matchingDept.id }
            localStorage.setItem('staff', JSON.stringify(updatedStaff))
            setStaff(updatedStaff)
            
            // Fetch docs and team
            const docsRes = await fetch(`/api/departments/${matchingDept.id}/documents`)
            if (docsRes.ok) setDepartmentDocs(await docsRes.json())
            
            const teamRes = await fetch(`/api/staff?department_id=${matchingDept.id}`)
            if (teamRes.ok) {
              const teamData = await teamRes.json()
              setTeamMembers(teamData.filter((m: Staff) => m.id !== staffInfo.id))
            }
          }
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !staff) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'profiles')

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Upload failed')

      const { url } = await uploadRes.json()

      // Update staff profile
      const updateRes = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_photo: url }),
      })

      if (updateRes.ok) {
        const updatedStaff = { ...staff, profile_photo: url }
        localStorage.setItem('staff', JSON.stringify(updatedStaff))
        setStaff(updatedStaff)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('staff')
    router.push('/admin/login')
  }

  const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'department', label: 'My Department', icon: Building2 },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: companyAnnouncements.filter(a => !a.is_read).length },
    { id: 'attendance', label: 'Attendance', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Clean without overlays */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ backgroundColor: '#0F766E' }}>
        {/* Logo & User */}
        <div className="p-4 border-b border-teal-600">
          <div className="flex items-center gap-3">
            <div className="relative">
              {staff.profile_photo ? (
                <Image src={staff.profile_photo} alt={staff.name} width={48} height={48} className="rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-lg font-bold">
                  {staff.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-teal-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{staff.name}</p>
              <p className="text-xs text-teal-200 truncate">{staff.position || staff.department || staff.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as typeof activeTab); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? 'bg-teal-800 text-white' : 'text-teal-100 hover:bg-teal-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>
              ) : activeTab === item.id ? (
                <ChevronRight className="h-4 w-4 text-amber-400" />
              ) : null}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-teal-600">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-teal-100 hover:bg-teal-600 rounded-lg text-sm">
            <Home className="h-4 w-4" /> Back to Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-teal-100 hover:bg-teal-600 rounded-lg text-sm mt-1">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">{navItems.find(n => n.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              {companyAnnouncements.filter(a => !a.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {companyAnnouncements.filter(a => !a.is_read).length}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Clock Card */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-teal-100 text-sm">Current Time</p>
                    <p className="text-4xl font-bold mt-1">{getCurrentTime()}</p>
                    <p className="text-teal-200 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!todayAttendance?.clock_in ? (
                      <button onClick={handleClockIn} disabled={clockingIn} className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-teal-700 rounded-xl hover:bg-teal-50 font-semibold shadow-lg disabled:opacity-50">
                        {clockingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                        Clock In
                      </button>
                    ) : !todayAttendance?.clock_out ? (
                      <button onClick={handleClockOut} disabled={clockingOut} className="flex items-center justify-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold shadow-lg disabled:opacity-50">
                        {clockingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                        Clock Out
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-6 py-3 bg-white/20 rounded-xl">
                        <CheckCircle className="h-5 w-5" /> Day Complete
                      </div>
                    )}
                    {todayAttendance && (
                      <p className="text-sm text-teal-100 text-center">
                        {todayAttendance.clock_in && `In: ${new Date(todayAttendance.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                        {todayAttendance.clock_out && ` • Out: ${new Date(todayAttendance.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-100 rounded-xl"><Calendar className="h-5 w-5 text-teal-600" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{attendanceHistory.filter(a => a.clock_in).length}</p>
                      <p className="text-xs text-gray-500">Days Present</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 rounded-xl"><Megaphone className="h-5 w-5 text-purple-600" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{companyAnnouncements.length}</p>
                      <p className="text-xs text-gray-500">Announcements</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl"><Users className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{teamMembers.length + 1}</p>
                      <p className="text-xs text-gray-500">Team Size</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 rounded-xl"><BookOpen className="h-5 w-5 text-green-600" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{departmentDocs.length}</p>
                      <p className="text-xs text-gray-500">SOPs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Announcements</h2>
                  <button onClick={() => setActiveTab('announcements')} className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All →</button>
                </div>
                {companyAnnouncements.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {companyAnnouncements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="px-5 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAnnouncement(ann)}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${ann.priority === 'urgent' ? 'bg-red-100' : ann.pinned ? 'bg-purple-100' : 'bg-gray-100'}`}>
                            {ann.pinned ? <Pin className="h-4 w-4 text-purple-600" /> : <Megaphone className="h-4 w-4 text-gray-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 truncate">{ann.title}</h3>
                              {ann.priority === 'urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ann.content}</p>
                          </div>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">No announcements</div>
                )}
              </div>
            </div>
          )}

          {/* Department Tab */}
          {activeTab === 'department' && (
            <div className="space-y-6">
              {department ? (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl"><Building2 className="h-8 w-8" /></div>
                      <div>
                        <h2 className="text-2xl font-bold">{department.name}</h2>
                        {department.description && <p className="text-blue-100 mt-1">{department.description}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Users className="h-5 w-5 text-teal-600" /> Team ({teamMembers.length + 1})</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Current user */}
                      <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-200">
                        {staff.profile_photo ? (
                          <Image src={staff.profile_photo} alt={staff.name} width={40} height={40} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold">{staff.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{staff.name} <span className="text-xs text-teal-600">(You)</span></p>
                          <p className="text-sm text-gray-500">{staff.position || staff.role}</p>
                        </div>
                      </div>
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          {member.profile_photo ? (
                            <Image src={member.profile_photo} alt={member.name} width={40} height={40} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-semibold">{member.name.charAt(0)}</div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.position || member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SOPs */}
                  {departmentDocs.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="h-5 w-5 text-teal-600" /> SOPs & Guidelines</h2>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {departmentDocs.map((doc) => (
                          <div key={doc.id} className="p-5">
                            {doc.hero_image && (
                              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                                <Image src={doc.hero_image} alt={doc.title} fill className="object-cover" />
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">{doc.document_type}</span>
                              <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                            </div>
                            {doc.content && <p className="text-sm text-gray-600 whitespace-pre-wrap">{doc.content}</p>}
                            {doc.attachments && doc.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {doc.attachments.map((att, idx) => (
                                  <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700">
                                    {att.type.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5" /> : att.type.startsWith('video/') ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                                    {att.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Department Assigned</h3>
                  <p className="text-gray-500 mt-2">Contact your administrator to be assigned to a department.</p>
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {companyAnnouncements.length > 0 ? (
                companyAnnouncements.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAnnouncement(ann)}>
                    {ann.hero_image && (
                      <div className="relative h-48">
                        <Image src={ann.hero_image} alt={ann.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {ann.pinned && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>}
                            {ann.priority === 'urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">{ann.title}</h3>
                          <p className="text-gray-600 mt-2 line-clamp-2">{ann.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>{formatDate(ann.created_at)}</span>
                            {ann.author && <span>by {ann.author.name}</span>}
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 flex items-center gap-1">
                          <Eye className="h-4 w-4" /> View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Announcements</h3>
                  <p className="text-gray-500 mt-2">Check back later for updates.</p>
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Attendance History (Last 14 Days)</h2>
              </div>
              {attendanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Clock In</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Clock Out</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hours</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{formatDate(record.date)}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{record.clock_in ? new Date(record.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{record.clock_out ? new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{record.total_hours ? `${record.total_hours.toFixed(1)}h` : '—'}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-700' : record.status === 'late' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
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
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Profile Settings</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      {staff.profile_photo ? (
                        <Image src={staff.profile_photo} alt={staff.name} width={120} height={120} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-28 h-28 bg-teal-600 text-white rounded-full flex items-center justify-center text-4xl font-bold">
                          {staff.name.charAt(0)}
                        </div>
                      )}
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-lg disabled:opacity-50"
                      >
                        {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </button>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900">{staff.name}</h3>
                      <p className="text-gray-500">{staff.email}</p>
                      {staff.phone && <p className="text-gray-500">{staff.phone}</p>}
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-900 mt-1">{staff.department || department?.name || 'Not assigned'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium text-gray-900 mt-1">{staff.position || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium text-gray-900 mt-1 capitalize">{staff.role}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 mt-1">{staff.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {selectedAnnouncement.hero_image && (
              <div className="relative h-56">
                <Image src={selectedAnnouncement.hero_image} alt={selectedAnnouncement.title} fill className="object-cover rounded-t-2xl" />
                <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6">
              {!selectedAnnouncement.hero_image && (
                <div className="flex justify-end mb-4">
                  <button onClick={() => setSelectedAnnouncement(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {selectedAnnouncement.pinned && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Pinned</span>}
                {selectedAnnouncement.priority === 'urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedAnnouncement.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span>{formatDate(selectedAnnouncement.created_at)}</span>
                {selectedAnnouncement.author && <span>by {selectedAnnouncement.author.name}</span>}
              </div>
              <div className="mt-6 text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedAnnouncement.content}</div>
              
              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnnouncement.attachments.map((att, idx) => (
                      <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">
                        <FileText className="h-4 w-4" /> {att.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnnouncement.links && selectedAnnouncement.links.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnnouncement.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700">
                        <ExternalLink className="h-4 w-4" /> {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
