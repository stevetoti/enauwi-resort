'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ConciergeBell,
  UserCog,
  MessageSquare,
  MessageCircle,
  Building2,
  Megaphone,
  Settings,
  Video,
  Wallet,
  UtensilsCrossed,
  CalendarCheck,
  Package,
  Sparkles,
  BarChart3,
  Bot,
  Share2,
} from 'lucide-react'
// Map sidebar items to their required permission keys
const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar, permission: 'bookings' },
  { href: '/admin/rooms', label: 'Rooms', icon: BedDouble, permission: 'rooms' },
  { href: '/admin/guests', label: 'Guests', icon: Users, permission: 'guests' },
  { href: '/admin/finance', label: 'Finance', icon: Wallet, permission: 'dashboard' },
  { href: '/admin/pos', label: 'Restaurant POS', icon: UtensilsCrossed, permission: 'dashboard' },
  { href: '/admin/events', label: 'Events', icon: CalendarCheck, permission: 'dashboard' },
  { href: '/admin/inventory', label: 'Inventory', icon: Package, permission: 'dashboard' },
  { href: '/admin/housekeeping', label: 'Housekeeping', icon: Sparkles, permission: 'dashboard' },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3, permission: 'dashboard' },
  { href: '/admin/services', label: 'Services', icon: ConciergeBell, permission: 'services' },
  { href: '/admin/staff', label: 'Staff', icon: UserCog, permission: 'staff' },
  { href: '/admin/departments', label: 'Departments', icon: Building2, permission: 'departments' },
  { href: '/admin/roles', label: 'Roles', icon: Shield, permission: 'roles' },
  { href: '/admin/communications', label: 'Communications', icon: MessageSquare, permission: 'communications' },
  { href: '/admin/conferences', label: 'Conferences', icon: Settings, permission: 'conferences' },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, permission: 'announcements' },
  { href: '/admin/videos', label: 'Videos', icon: Video, permission: 'announcements' },
  { href: '/admin/knowledge', label: 'AI Knowledge', icon: Bot, permission: 'dashboard' },
  { href: '/admin/social/calendar', label: 'Social Media', icon: Share2, permission: 'dashboard' },
  { href: '/staff/chat', label: 'Team Chat', icon: MessageCircle, permission: 'dashboard' },
]

// Check if user has permission to view a module
function hasPermission(permissions: Record<string, { view?: boolean }>, key: string): boolean {
  if (!permissions) return false
  const perm = permissions[key]
  return perm?.view === true
}

interface StaffUser {
  email: string
  name: string
  profile_photo?: string
  permissions: Record<string, { view?: boolean; edit?: boolean; create?: boolean; delete?: boolean }>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<StaffUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Skip auth check for login, forgot-password, and reset-password pages
  const isAuthPage = pathname === '/admin/login' || 
                     pathname === '/admin/forgot-password' || 
                     pathname === '/admin/reset-password'

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false)
      return
    }

    const checkAuth = () => {
      try {
        // Check localStorage for staff session
        const staffData = localStorage.getItem('staff')
        
        if (!staffData) {
          router.push('/admin/login')
          return
        }

        const staff = JSON.parse(staffData)
        
        if (!staff || !staff.email) {
          localStorage.removeItem('staff')
          router.push('/admin/login')
          return
        }

        const permissions = staff.permissions || {}
        
        // Check if user is an admin (has access to admin-level features)
        const isAdmin = permissions.staff?.view || 
                       permissions.roles?.view || 
                       permissions.bookings?.view ||
                       permissions.rooms?.edit ||
                       permissions.guests?.edit
        
        // If not admin, redirect to staff portal
        if (!isAdmin) {
          router.push('/staff/portal')
          return
        }

        setUser({ 
          email: staff.email, 
          name: staff.name,
          profile_photo: staff.profile_photo,
          permissions: permissions
        })
      } catch {
        localStorage.removeItem('staff')
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [isAuthPage, router])

  const handleLogout = () => {
    localStorage.removeItem('staff')
    router.push('/admin/login')
  }

  // Auth pages render without admin layout
  if (isAuthPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          <p className="text-gray-500 text-sm">Loading admin portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - E'Nauwi Dark Teal */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ backgroundColor: '#0F766E' }}
      >
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-teal-700">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo-enauwi.png"
                alt="E'Nauwi Resort"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-lg">E&apos;Nauwi</span>
              <span className="block text-[10px] uppercase tracking-widest text-teal-200">
                Admin Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-teal-200 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable middle section */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks
            .filter((link) => hasPermission(user.permissions, link.permission))
            .map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/admin' && pathname.startsWith(link.href))
              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto text-amber-400" />
                  )}
                </Link>
              )
            })}
        </nav>

        {/* User info / Logout - Fixed at bottom */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-teal-700" style={{ backgroundColor: '#0F766E' }}>
          <div className="flex items-center gap-3 px-3 mb-3">
            {user.profile_photo ? (
              <Image
                src={user.profile_photo}
                alt={user.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-teal-200 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-teal-100 hover:bg-teal-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 w-full px-3 py-2 mt-1 text-sm text-teal-100 hover:bg-teal-700 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-xs">←</span>
            <span>Back to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {sidebarLinks.find(
                (l) =>
                  l.href === pathname ||
                  (l.href !== '/admin' && pathname.startsWith(l.href))
              )?.label || 'Admin'}
            </h1>
          </div>
          {/* Small logo in header on mobile */}
          <div className="lg:hidden w-8 h-8 relative">
            <Image
              src="/logo-enauwi.png"
              alt="E'Nauwi"
              fill
              className="object-contain"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
