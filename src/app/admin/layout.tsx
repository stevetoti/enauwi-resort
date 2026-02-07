'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
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
  Building2,
  Megaphone,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/admin/guests', label: 'Guests', icon: Users },
  { href: '/admin/services', label: 'Services', icon: ConciergeBell },
  { href: '/admin/staff', label: 'Staff', icon: UserCog },
  { href: '/admin/communications', label: 'Communications', icon: MessageSquare },
  { href: '/admin/conferences', label: 'Conferences', icon: Building2 },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = createClientSupabase()

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/admin/login')
          return
        }

        // Check staff table
        const { data: staff } = await supabase
          .from('staff')
          .select('name, email, role')
          .eq('email', authUser.email)
          .single()

        if (!staff) {
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }

        setUser({ email: staff.email, name: staff.name })
      } catch {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [isLoginPage, router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // Login page renders without admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">E&apos;Nauwi</span>
              <span className="block text-[10px] uppercase tracking-widest text-blue-300">
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-blue-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => {
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
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info / Logout */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-blue-800">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-blue-300 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-blue-200 hover:bg-blue-800/50 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 w-full px-3 py-2 mt-1 text-sm text-blue-200 hover:bg-blue-800/50 hover:text-white rounded-lg transition-colors"
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
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
