'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ConciergeBell,
  Search,
  Filter,
  ChevronDown,
  Eye,
  X,
  Package,
  Users,
  Building2,
  UtensilsCrossed,
  Waves,
  Truck,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatVatu, formatDate } from '@/lib/utils'
import { Service, ConferenceBooking, ServiceOrder } from '@/types'

type ActiveTab = 'conference' | 'orders' | 'catalog'

type ConferenceStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'
type OrderStatus = 'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'

const CONFERENCE_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

const CATEGORY_LABELS: Record<string, string> = {
  conference: 'Conference',
  food_beverage: 'Food & Beverage',
  activities: 'Activities',
  other_services: 'Other Services',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  conference: <Building2 className="h-4 w-4" />,
  food_beverage: <UtensilsCrossed className="h-4 w-4" />,
  activities: <Waves className="h-4 w-4" />,
  other_services: <Truck className="h-4 w-4" />,
}

export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('conference')
  const [services, setServices] = useState<Service[]>([])
  const [conferenceBookings, setConferenceBookings] = useState<ConferenceBooking[]>([])
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [confStatusFilter, setConfStatusFilter] = useState<ConferenceStatus>('all')
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>('all')
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [selectedConference, setSelectedConference] = useState<ConferenceBooking | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const supabase = createClientSupabase()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })

      setServices(servicesData || [])

      // Fetch conference bookings
      let confQuery = supabase
        .from('conference_bookings')
        .select('*, service:services(*)')
        .order('created_at', { ascending: false })

      if (confStatusFilter !== 'all') {
        confQuery = confQuery.eq('status', confStatusFilter)
      }

      const { data: confData } = await confQuery
      setConferenceBookings(confData || [])

      // Fetch service orders
      let orderQuery = supabase
        .from('service_orders')
        .select('*, service:services(*)')
        .order('created_at', { ascending: false })

      if (orderStatusFilter !== 'all') {
        orderQuery = orderQuery.eq('status', orderStatusFilter)
      }

      const { data: orderData } = await orderQuery

      // Filter by category if needed
      let filteredOrders = orderData || []
      if (orderCategoryFilter !== 'all') {
        filteredOrders = filteredOrders.filter(
          (o: ServiceOrder) => o.service?.category === orderCategoryFilter
        )
      }

      setServiceOrders(filteredOrders)
    } catch (error) {
      console.error('Error fetching services data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, confStatusFilter, orderStatusFilter, orderCategoryFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateConferenceStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('conference_bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await fetchData()

      if (selectedConference?.id === id) {
        setSelectedConference((prev) =>
          prev ? { ...prev, status: newStatus as ConferenceBooking['status'] } : null
        )
      }
    } catch (error) {
      console.error('Error updating conference status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await fetchData()

      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus as ServiceOrder['status'] } : null
        )
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statusActionColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'delivered':
      case 'completed':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'cancelled':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  // Summary stats
  const todayStr = new Date().toISOString().split('T')[0]
  const todayConferenceBookings = conferenceBookings.filter(
    (b) => b.booking_date === todayStr && b.status !== 'cancelled'
  ).length
  const pendingConferenceBookings = conferenceBookings.filter(
    (b) => b.status === 'pending'
  ).length
  const todayOrders = serviceOrders.filter(
    (o) => o.created_at.startsWith(todayStr) && o.status !== 'cancelled'
  ).length
  const todayOrderRevenue = serviceOrders
    .filter((o) => o.created_at.startsWith(todayStr) && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_price || 0), 0)

  // Search filter
  const filteredConferences = conferenceBookings.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.contact_name.toLowerCase().includes(q) ||
      b.contact_email.toLowerCase().includes(q) ||
      (b.contact_phone && b.contact_phone.includes(q))
    )
  })

  const filteredOrders = serviceOrders.filter((o) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (o.guest_name && o.guest_name.toLowerCase().includes(q)) ||
      (o.guest_email && o.guest_email.toLowerCase().includes(q)) ||
      (o.room_number && o.room_number.toLowerCase().includes(q)) ||
      (o.service?.name && o.service.name.toLowerCase().includes(q))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Today&apos;s Conferences</p>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayConferenceBookings}</p>
          <p className="text-xs text-gray-500 mt-1">{pendingConferenceBookings} pending approval</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Service Orders Today</p>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Orders placed today</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Service Revenue Today</p>
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <ConciergeBell className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatVatu(todayOrderRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">From service orders</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Services Available</p>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <ConciergeBell className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{services.filter((s) => s.available).length}</p>
          <p className="text-xs text-gray-500 mt-1">Active services in catalog</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'conference' as ActiveTab, label: 'Conference Bookings', icon: Building2 },
              { key: 'orders' as ActiveTab, label: 'Service Orders', icon: Package },
              { key: 'catalog' as ActiveTab, label: 'Service Catalog', icon: ConciergeBell },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setSearchQuery('')
                }}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conference Bookings Tab */}
        {activeTab === 'conference' && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by contact name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={confStatusFilter}
                      onChange={(e) => setConfStatusFilter(e.target.value as ConferenceStatus)}
                      className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {filteredConferences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Date & Time</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Attendees</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredConferences.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.contact_name}</p>
                            <p className="text-xs text-gray-500">{booking.contact_email}</p>
                            {booking.contact_phone && (
                              <p className="text-xs text-gray-400">{booking.contact_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            <p>{formatDate(booking.booking_date)}</p>
                            <p className="text-xs text-gray-400">
                              {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          {booking.booking_type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Users className="h-4 w-4 text-gray-400" />
                            {booking.number_of_attendees}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {booking.total_price ? formatVatu(booking.total_price) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedConference(booking)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {CONFERENCE_STATUS_TRANSITIONS[booking.status]?.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => updateConferenceStatus(booking.id, nextStatus)}
                                disabled={updatingStatus}
                                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${statusActionColor(nextStatus)} disabled:opacity-50`}
                              >
                                {nextStatus}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No conference bookings</p>
                <p className="text-sm mt-1">Conference bookings will appear here when guests make inquiries.</p>
              </div>
            )}
          </div>
        )}

        {/* Service Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by guest name, email, room, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <select
                    value={orderCategoryFilter}
                    onChange={(e) => setOrderCategoryFilter(e.target.value)}
                    className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="food_beverage">Food & Beverage</option>
                    <option value="activities">Activities</option>
                    <option value="other_services">Other Services</option>
                  </select>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus)}
                      className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-3">Service</th>
                      <th className="px-6 py-3">Guest</th>
                      <th className="px-6 py-3">Room</th>
                      <th className="px-6 py-3">Qty</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Ordered</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.service?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{CATEGORY_LABELS[order.service?.category || ''] || 'Other'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">{order.guest_name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{order.guest_email || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.room_number || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.quantity}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatVatu(order.total_price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {ORDER_STATUS_TRANSITIONS[order.status]?.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                                disabled={updatingStatus}
                                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${statusActionColor(nextStatus)} disabled:opacity-50`}
                              >
                                {nextStatus}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No service orders</p>
                <p className="text-sm mt-1">Guest service orders will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Service Catalog Tab */}
        {activeTab === 'catalog' && (
          <div className="p-6">
            {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
              const catServices = services.filter((s) => s.category === catKey)
              if (catServices.length === 0) return null

              return (
                <div key={catKey} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    {CATEGORY_ICONS[catKey]}
                    <h3 className="text-lg font-semibold text-gray-900">{catLabel}</h3>
                    <span className="text-sm text-gray-400">({catServices.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catServices.map((service) => (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 ${
                          service.available
                            ? 'border-gray-200 bg-white'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                          {service.is_placeholder_price && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                              PLACEHOLDER
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {service.unit_price === 0 ? 'Free' : formatVatu(service.unit_price)}
                            </span>
                            {service.unit_price > 0 && (
                              <span className="text-xs text-gray-400 ml-1">/{service.price_unit}</span>
                            )}
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              service.available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {service.available ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {service.amenities && service.amenities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {service.amenities.slice(0, 5).map((a, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                            {service.amenities.length > 5 && (
                              <span className="text-[10px] text-gray-400">
                                +{service.amenities.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                        {service.notes && (
                          <p className="text-[10px] text-gray-400 mt-2 italic">{service.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Conference Booking Detail Modal */}
      {selectedConference && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Conference Booking Details</h3>
              <button onClick={() => setSelectedConference(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColor(selectedConference.status)}`}>
                  {selectedConference.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedConference.contact_name}</span></p>
                  <p><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedConference.contact_email}</span></p>
                  {selectedConference.contact_phone && (
                    <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedConference.contact_phone}</span></p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(selectedConference.booking_date)}</span></p>
                  <p><span className="text-gray-500">Time:</span> <span className="font-medium">{selectedConference.start_time.slice(0, 5)} - {selectedConference.end_time.slice(0, 5)}</span></p>
                  <p><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{selectedConference.booking_type.replace('_', ' ')}</span></p>
                  <p><span className="text-gray-500">Attendees:</span> <span className="font-medium">{selectedConference.number_of_attendees}</span></p>
                </div>
              </div>
              {selectedConference.total_price && (
                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Total Price</span>
                  <span className="text-lg font-bold text-gray-900">{formatVatu(selectedConference.total_price)}</span>
                </div>
              )}
              {selectedConference.special_requirements && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Special Requirements</h4>
                  <p className="text-sm text-yellow-700">{selectedConference.special_requirements}</p>
                </div>
              )}
              {selectedConference.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Notes</h4>
                  <p className="text-sm text-blue-700">{selectedConference.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-400">Booked on {formatDate(selectedConference.created_at)}</p>
              {CONFERENCE_STATUS_TRANSITIONS[selectedConference.status]?.length > 0 && (
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {CONFERENCE_STATUS_TRANSITIONS[selectedConference.status].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => updateConferenceStatus(selectedConference.id, nextStatus)}
                      disabled={updatingStatus}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statusActionColor(nextStatus)} disabled:opacity-50`}
                    >
                      {updatingStatus ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Service Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Service</h4>
                <p className="text-sm font-medium">{selectedOrder.service?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{CATEGORY_LABELS[selectedOrder.service?.category || '']}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Guest Details</h4>
                <div className="space-y-1 text-sm">
                  {selectedOrder.guest_name && <p><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedOrder.guest_name}</span></p>}
                  {selectedOrder.guest_email && <p><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.guest_email}</span></p>}
                  {selectedOrder.room_number && <p><span className="text-gray-500">Room:</span> <span className="font-medium">{selectedOrder.room_number}</span></p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">Quantity</h4>
                  <p className="text-sm font-medium">{selectedOrder.quantity}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">Unit Price</h4>
                  <p className="text-sm font-medium">{formatVatu(selectedOrder.unit_price)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">Total</h4>
                  <p className="text-sm font-bold">{formatVatu(selectedOrder.total_price)}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Notes</h4>
                  <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-400">
                Ordered on {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
              {ORDER_STATUS_TRANSITIONS[selectedOrder.status]?.length > 0 && (
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {ORDER_STATUS_TRANSITIONS[selectedOrder.status].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => updateOrderStatus(selectedOrder.id, nextStatus)}
                      disabled={updatingStatus}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statusActionColor(nextStatus)} disabled:opacity-50`}
                    >
                      {updatingStatus ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
