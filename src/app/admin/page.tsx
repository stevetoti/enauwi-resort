'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatVatu, formatDate } from '@/lib/utils'
import { Booking, Room } from '@/types'

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

  const supabase = createClientSupabase()

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

      setRecentBookings(allBookings.slice(0, 10))
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
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toString()}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
          subtitle={`${stats.pendingBookings} pending`}
        />
        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckIns.toString()}
          icon={<ArrowUpRight className="h-5 w-5" />}
          color="green"
          subtitle="Arriving today"
        />
        <StatCard
          title="Today's Check-outs"
          value={stats.todayCheckOuts.toString()}
          icon={<ArrowDownRight className="h-5 w-5" />}
          color="orange"
          subtitle="Departing today"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon={<BedDouble className="h-5 w-5" />}
          color="purple"
          subtitle={`${stats.totalRooms} rooms total`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatVatu(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Guests</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalGuests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Bookings</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Service Orders Today</p>
              <p className="text-xl font-bold text-gray-900">{stats.serviceOrdersToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ConciergeBell className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Service Revenue Today</p>
              <p className="text-xl font-bold text-gray-900">{formatVatu(stats.serviceRevenueToday)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <Link href="/admin/services" className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Conferences</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingConferences}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <Link
            href="/admin/bookings"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Room</th>
                  <th className="px-6 py-3">Check-in</th>
                  <th className="px-6 py-3">Check-out</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.total_price ? formatVatu(booking.total_price) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Bookings will appear here once guests start booking.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
  subtitle: string
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}
