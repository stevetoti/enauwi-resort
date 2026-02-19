'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BedDouble,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  ConciergeBell,
  Package,
  Plus,
  MessageSquare,
  Share2,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatVatu, formatDate } from '@/lib/utils'
import { Booking, Room } from '@/types'
import { 
  StatCard, 
  Card, 
  PageTransition, 
  EmptyState, 
  Badge,
  LoadingGrid,
  QuickAction,
} from '@/components/ui'

interface DashboardStats {
  totalBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  totalRevenue: number
  pendingBookings: number
  totalRooms: number
  totalGuests: number
  serviceOrdersToday: number
  serviceRevenueToday: number
  pendingConferences: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    totalRooms: 0,
    totalGuests: 0,
    serviceOrdersToday: 0,
    serviceRevenueToday: 0,
    pendingConferences: 0,
  })
  const [recentBookings, setRecentBookings] = useState<(Booking & { room?: Room })[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Admin')

  const supabase = createClientSupabase()

  useEffect(() => {
    // Get user name from localStorage
    try {
      const staffData = localStorage.getItem('staff')
      if (staffData) {
        const staff = JSON.parse(staffData)
        if (staff.name) setUserName(staff.name)
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch all bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, room:rooms(*)')
        .order('created_at', { ascending: false })

      // Fetch rooms
      const { data: rooms } = await supabase.from('rooms').select('*')

      // Fetch guests
      const { data: guests } = await supabase.from('guests').select('id')

      // Fetch service orders for today
      const { data: serviceOrders } = await supabase
        .from('service_orders')
        .select('*')
        .gte('created_at', today + 'T00:00:00')
        .lte('created_at', today + 'T23:59:59')

      // Fetch pending conference bookings
      const { data: confBookings } = await supabase
        .from('conference_bookings')
        .select('*')
        .eq('status', 'pending')

      const allBookings = bookings || []
      const allRooms = rooms || []

      // Calculate stats
      const todayCheckIns = allBookings.filter(
        (b) => b.check_in === today && ['confirmed', 'checked_in'].includes(b.status)
      ).length

      const todayCheckOuts = allBookings.filter(
        (b) => b.check_out === today && ['checked_in', 'checked_out'].includes(b.status)
      ).length

      const activeBookings = allBookings.filter(
        (b) =>
          ['confirmed', 'checked_in'].includes(b.status) &&
          b.check_in <= today &&
          b.check_out >= today
      ).length

      const occupancyRate =
        allRooms.length > 0
          ? Math.round((activeBookings / allRooms.length) * 100)
          : 0

      const totalRevenue = allBookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.total_price || 0), 0)

      const pendingBookings = allBookings.filter(
        (b) => b.status === 'pending'
      ).length

      const allServiceOrders = (serviceOrders || []).filter(
        (o: { status: string }) => o.status !== 'cancelled'
      )
      const serviceRevenueToday = allServiceOrders.reduce(
        (sum: number, o: { total_price?: number }) => sum + (o.total_price || 0),
        0
      )

      setStats({
        totalBookings: allBookings.length,
        todayCheckIns,
        todayCheckOuts,
        occupancyRate,
        totalRevenue,
        pendingBookings,
        totalRooms: allRooms.length,
        totalGuests: guests?.length || 0,
        serviceOrdersToday: allServiceOrders.length,
        serviceRevenueToday,
        pendingConferences: confBookings?.length || 0,
      })

      setRecentBookings(allBookings.slice(0, 8))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'info'
      case 'checked_in':
        return 'success'
      case 'checked_out':
        return 'default'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' }
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' }
    return { text: 'Good evening', emoji: '🌙' }
  }

  const greeting = getGreeting()

  if (loading) {
    return (
      <PageTransition className="space-y-6">
        <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        <LoadingGrid count={4} />
        <LoadingGrid count={3} />
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {greeting.text}, {userName.split(' ')[0]} {greeting.emoji}
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening at E&apos;Nauwi Beach Resort today
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-medium text-sm hover:from-teal-700 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toString()}
          icon={<Calendar className="h-5 w-5" />}
          color="teal"
          subtitle={`${stats.pendingBookings} pending`}
          delay={0}
        />
        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckIns.toString()}
          icon={<ArrowUpRight className="h-5 w-5" />}
          color="green"
          subtitle="Arriving today"
          delay={0.1}
        />
        <StatCard
          title="Today's Check-outs"
          value={stats.todayCheckOuts.toString()}
          icon={<ArrowDownRight className="h-5 w-5" />}
          color="amber"
          subtitle="Departing today"
          delay={0.2}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon={<BedDouble className="h-5 w-5" />}
          color="purple"
          subtitle={`${stats.totalRooms} rooms total`}
          delay={0.3}
        />
      </div>

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500 mb-3">Quick Actions</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            <QuickAction
              icon={<Calendar className="h-5 w-5" />}
              label="Bookings"
              href="/admin/bookings"
              color="teal"
            />
            <QuickAction
              icon={<BedDouble className="h-5 w-5" />}
              label="Rooms"
              href="/admin/rooms"
              color="amber"
            />
            <QuickAction
              icon={<Users className="h-5 w-5" />}
              label="Guests"
              href="/admin/guests"
              color="blue"
            />
            <QuickAction
              icon={<Share2 className="h-5 w-5" />}
              label="Social"
              href="/admin/social/calendar"
              color="purple"
            />
            <QuickAction
              icon={<MessageSquare className="h-5 w-5" />}
              label="Chat"
              href="/staff/chat"
              color="teal"
            />
            <QuickAction
              icon={<ConciergeBell className="h-5 w-5" />}
              label="Services"
              href="/admin/services"
              color="amber"
            />
            <QuickAction
              icon={<FileText className="h-5 w-5" />}
              label="Reports"
              href="/admin/reports"
              color="blue"
            />
            <QuickAction
              icon={<DollarSign className="h-5 w-5" />}
              label="Finance"
              href="/admin/finance"
              color="purple"
            />
          </div>
        </Card>
      </motion.div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">{formatVatu(stats.totalRevenue)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Guests</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalGuests}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-yellow-100 to-amber-50 rounded-xl">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Bookings</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Orders Today</p>
                <p className="text-xl font-bold text-gray-900">{stats.serviceOrdersToday}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                <ConciergeBell className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Revenue Today</p>
                <p className="text-xl font-bold text-gray-900">{formatVatu(stats.serviceRevenueToday)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.01 }}
        >
          <Link href="/admin/conferences">
            <Card className="p-5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Conferences</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pendingConferences}</p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
                      <th className="px-6 py-3">Guest</th>
                      <th className="px-6 py-3">Room</th>
                      <th className="px-6 py-3">Check-in</th>
                      <th className="px-6 py-3">Check-out</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.guest_name}</p>
                            <p className="text-xs text-gray-500">{booking.guest_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {booking.room?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(booking.check_in)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(booking.check_out)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColor(booking.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {booking.total_price ? formatVatu(booking.total_price) : '—'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="No bookings yet"
                description="Bookings will appear here once guests start booking."
                action={
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Create first booking
                  </Link>
                }
              />
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </PageTransition>
  )
}
