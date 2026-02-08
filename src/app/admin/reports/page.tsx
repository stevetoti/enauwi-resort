'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart3,
  TrendingUp,
  BedDouble,
  DollarSign,
  Users,
  Download,
  Calendar,
  PieChart as PieChartIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns'

interface FinanceTransaction {
  id: string
  date: string
  category: string
  amount: number
  type: 'income' | 'expense'
}

interface Booking {
  id: string
  room_id: string
  check_in: string
  check_out: string
  total_price: number
  status: string
  rooms?: { name: string; price_vt: number }
}

interface Room {
  id: string
  name: string
  price_vt: number
}

const COLORS = ['#0D4F8B', '#E8941C', '#17A2B8', '#40916C', '#C77B0A', '#854B06']

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const getDateRange = useCallback(() => {
    const today = new Date()
    switch (dateRange) {
      case 'week':
        return { start: format(subDays(today, 7), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
      case 'month':
        return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end: format(endOfMonth(today), 'yyyy-MM-dd') }
      case '3months':
        return { start: format(subMonths(today, 3), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
      case 'year':
        return { start: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
      default:
        return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end: format(endOfMonth(today), 'yyyy-MM-dd') }
    }
  }, [dateRange])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { start, end } = getDateRange()

    // Fetch transactions
    const { data: txData } = await supabase
      .from('finance_transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date')

    // Fetch bookings
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*, rooms(name, price_vt)')
      .gte('check_in', start)
      .lte('check_in', end)
      .in('status', ['confirmed', 'checked_in', 'checked_out'])

    // Fetch rooms
    const { data: roomData } = await supabase
      .from('rooms')
      .select('id, name, price_vt')

    setTransactions(txData || [])
    setBookings((bookingData as unknown as Booking[]) || [])
    setRooms(roomData || [])
    setLoading(false)
  }, [getDateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
  const netRevenue = totalIncome - totalExpense

  // Revenue by category
  const revenueByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

  const categoryChartData = Object.entries(revenueByCategory).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value)

  // Daily revenue trend
  const { start, end } = getDateRange()
  const days = eachDayOfInterval({ start: new Date(start), end: new Date(end) })
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayTx = transactions.filter(t => t.date === dateStr)
    return {
      date: format(day, 'MMM dd'),
      income: dayTx.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0),
      expense: dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0),
    }
  })

  // Occupancy calculation
  const totalRoomNights = rooms.length * days.length
  const bookedRoomNights = bookings.reduce((acc, b) => {
    const checkIn = new Date(b.check_in)
    const checkOut = new Date(b.check_out)
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    return acc + nights
  }, 0)
  const occupancyRate = totalRoomNights > 0 ? (bookedRoomNights / totalRoomNights * 100) : 0

  // RevPAR
  const roomRevenue = transactions
    .filter(t => t.category === 'Rooms' && t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const revPAR = totalRoomNights > 0 ? (roomRevenue / totalRoomNights) : 0

  // ADR (Average Daily Rate)
  const adr = bookedRoomNights > 0 ? (roomRevenue / bookedRoomNights) : 0

  // Top performing rooms
  const roomBookingCount = bookings.reduce((acc, b) => {
    const roomName = b.rooms?.name || 'Unknown'
    acc[roomName] = (acc[roomName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topRooms = Object.entries(roomBookingCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Monthly comparison
  const thisMonth = format(new Date(), 'yyyy-MM')
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM')
  
  const thisMonthIncome = transactions
    .filter(t => t.date.startsWith(thisMonth) && t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Income', `${totalIncome} VT`],
      ['Total Expenses', `${totalExpense} VT`],
      ['Net Revenue', `${netRevenue} VT`],
      ['Occupancy Rate', `${occupancyRate.toFixed(1)}%`],
      ['RevPAR', `${revPAR.toFixed(0)} VT`],
      ['ADR', `${adr.toFixed(0)} VT`],
      ['Total Bookings', bookings.length.toString()],
      ...categoryChartData.map(c => [`${c.name} Revenue`, `${c.value} VT`]),
    ]

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resort-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-500">Analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{totalIncome.toLocaleString()} VT</p>
              <p className="text-xs text-green-600 mt-1">+{((thisMonthIncome / (totalIncome || 1)) * 100).toFixed(0)}% this period</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{bookedRoomNights} of {totalRoomNights} room nights</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BedDouble className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">RevPAR</p>
              <p className="text-2xl font-bold text-gray-900">{revPAR.toLocaleString(undefined, { maximumFractionDigits: 0 })} VT</p>
              <p className="text-xs text-gray-500 mt-1">Revenue per available room</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ADR</p>
              <p className="text-2xl font-bold text-gray-900">{adr.toLocaleString(undefined, { maximumFractionDigits: 0 })} VT</p>
              <p className="text-xs text-gray-500 mt-1">Average daily rate</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} VT`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#40916C" name="Income" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#dc2626" name="Expense" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} VT`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Rooms */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Top Performing Rooms</h3>
          <div className="space-y-3">
            {topRooms.length === 0 ? (
              <p className="text-gray-500 text-sm">No booking data</p>
            ) : (
              topRooms.map((room, idx) => (
                <div key={room.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                    idx === 0 ? 'bg-amber-500' :
                    idx === 1 ? 'bg-gray-400' :
                    idx === 2 ? 'bg-amber-700' :
                    'bg-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{room.name}</p>
                    <p className="text-xs text-gray-500">{room.count} bookings</p>
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-ocean-600 h-2 rounded-full"
                      style={{ width: `${(room.count / (topRooms[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">Total Income</span>
              <span className="font-bold text-green-800">{totalIncome.toLocaleString()} VT</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-red-800">Total Expenses</span>
              <span className="font-bold text-red-800">{totalExpense.toLocaleString()} VT</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-ocean-50 rounded-lg border-2 border-ocean-200">
              <span className="text-ocean-800 font-medium">Net Revenue</span>
              <span className="font-bold text-ocean-800 text-lg">{netRevenue.toLocaleString()} VT</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Profit Margin: {totalIncome > 0 ? ((netRevenue / totalIncome) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryChartData.map((cat, idx) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {cat.name}
                  </span>
                  <span className="font-medium">{cat.value.toLocaleString()} VT</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: COLORS[idx % COLORS.length],
                      width: `${(cat.value / totalIncome) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Stats */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Booking Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-ocean-600">{bookings.length}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{bookings.filter(b => b.status === 'checked_in').length}</p>
            <p className="text-sm text-gray-500">Checked In</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-600">{bookings.filter(b => b.status === 'checked_out').length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-ocean-200 text-sm">Highest Revenue Day</p>
            <p className="text-xl font-bold">
              {dailyData.length > 0 
                ? dailyData.reduce((max, d) => d.income > max.income ? d : max, dailyData[0]).date
                : 'N/A'
              }
            </p>
            <p className="text-sm text-ocean-200">
              {dailyData.length > 0 
                ? `${dailyData.reduce((max, d) => d.income > max.income ? d : max, dailyData[0]).income.toLocaleString()} VT`
                : ''
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-ocean-200 text-sm">Top Revenue Category</p>
            <p className="text-xl font-bold">
              {categoryChartData[0]?.name || 'N/A'}
            </p>
            <p className="text-sm text-ocean-200">
              {categoryChartData[0]?.value.toLocaleString() || 0} VT
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-ocean-200 text-sm">Average Booking Value</p>
            <p className="text-xl font-bold">
              {bookings.length > 0 
                ? (bookings.reduce((acc, b) => acc + (Number(b.total_price) || 0), 0) / bookings.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : 0
              } VT
            </p>
            <p className="text-sm text-ocean-200">per booking</p>
          </div>
        </div>
      </div>
    </div>
  )
}
