'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
  { href: '/admin/settings/branding', label: 'Branding', icon: Settings, permission: 'dashboard' },
  { href: '/admin/settings/seo', label: 'SEO Settings', icon: Settings, permission: 'dashboard' },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full"
          />
          <p className="text-gray-500 text-sm font-medium">Loading admin portal...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/20">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - E'Nauwi Dark Teal */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 z-50 h-full w-72 text-white flex flex-col lg:translate-x-0"
        style={{ backgroundColor: '#0F766E' }}
      >
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-5 border-b border-teal-700/50">
          <Link href="/admin" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 relative"
            >
              <Image
                src="/logo-enauwi.png"
                alt="E'Nauwi Resort"
                fill
                className="object-contain"
              />
            </motion.div>
            <div>
              <span className="font-bold text-lg block group-hover:text-amber-400 transition-colors">E&apos;Nauwi</span>
              <span className="block text-[10px] uppercase tracking-widest text-teal-200">
                Admin Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-teal-200 hover:text-white hover:bg-teal-700/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable middle section */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-700 scrollbar-track-transparent">
          {sidebarLinks
            .filter((link) => hasPermission(user.permissions, link.permission))
            .map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/admin' && pathname.startsWith(link.href))
              const Icon = link.icon

              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                        : 'text-teal-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={isActive ? 'text-amber-400' : ''}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto"
                      >
                        <ChevronRight className="h-4 w-4 text-amber-400" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
        </nav>

        {/* User info / Logout - Fixed at bottom */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-teal-700/50 bg-teal-800/30">
          <div className="flex items-center gap-3 px-3 mb-3">
            {user.profile_photo ? (
              <Image
                src={user.profile_photo}
                alt={user.name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/30"
              />
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
              >
                {user.name.charAt(0).toUpperCase()}
              </motion.div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-teal-200 truncate">{user.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ x: 3 }}
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-teal-100 hover:bg-white/10 hover:text-white rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </motion.button>
          <Link
            href="/"
            className="flex items-center gap-3 w-full px-3 py-2 mt-1 text-sm text-teal-100 hover:bg-white/10 hover:text-white rounded-xl transition-all"
          >
            <span className="text-xs">←</span>
            <span>Back to Website</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="h-6 w-6" />
          </motion.button>
          <div className="flex-1">
            <motion.h1 
              key={pathname}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-gray-900"
            >
              {sidebarLinks.find(
                (l) =>
                  l.href === pathname ||
                  (l.href !== '/admin' && pathname.startsWith(l.href))
              )?.label || 'Admin'}
            </motion.h1>
          </div>
          {/* Small logo in header on mobile */}
          <div className="lg:hidden w-10 h-10 relative">
            <Image
              src="/logo-enauwi.png"
              alt="E'Nauwi"
              fill
              className="object-contain"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
