'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  X,
  Edit,
  Trash2,
  Phone,
  Mail,
  Check,
  AlertCircle,
} from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'

interface Venue {
  id: string
  name: string
  capacity: number
  hourly_rate: number | null
  half_day_rate: number | null
  daily_rate: number | null
  amenities: string[]
  is_active: boolean
}

interface Event {
  id: string
  name: string
  venue_id: string
  event_date: string
  start_time: string
  end_time: string
  package: string
  attendees: number | null
  catering_included: boolean
  total: number
  deposit: number
  status: string
  contact_name: string
  contact_email: string | null
  contact_phone: string | null
  notes: string | null
  venues?: Venue
}

const PACKAGES = [
  { value: 'hourly', label: 'Hourly', description: 'Pay per hour' },
  { value: 'half_day', label: 'Half Day', description: '4 hours' },
  { value: 'full_day', label: 'Full Day', description: '8+ hours' },
  { value: 'custom', label: 'Custom', description: 'Custom pricing' },
]

const STATUSES = [
  { value: 'inquiry', label: 'Inquiry', color: 'bg-gray-100 text-gray-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-teal-100 text-teal-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showVenueModal, setShowVenueModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [eventForm, setEventForm] = useState({
    name: '',
    venue_id: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
    package: 'full_day',
    attendees: '',
    catering_included: false,
    total: '',
    deposit: '',
    status: 'inquiry',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  })

  const [venueForm, setVenueForm] = useState({
    name: '',
    capacity: '',
    hourly_rate: '',
    half_day_rate: '',
    daily_rate: '',
    amenities: '',
  })

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*, venues(*)')
      .order('event_date', { ascending: true })
    setEvents(data || [])
  }, [])

  const fetchVenues = useCallback(async () => {
    const { data } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setVenues(data || [])
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchEvents(), fetchVenues()])
      setLoading(false)
    }
    load()
  }, [fetchEvents, fetchVenues])

  const handleSaveEvent = async () => {
    if (!eventForm.name || !eventForm.venue_id || !eventForm.contact_name) {
      alert('Please fill in required fields')
      return
    }

    const eventData = {
      name: eventForm.name,
      venue_id: eventForm.venue_id,
      event_date: eventForm.event_date,
      start_time: eventForm.start_time,
      end_time: eventForm.end_time,
      package: eventForm.package,
      attendees: eventForm.attendees ? parseInt(eventForm.attendees) : null,
      catering_included: eventForm.catering_included,
      total: parseFloat(eventForm.total) || 0,
      deposit: parseFloat(eventForm.deposit) || 0,
      status: eventForm.status,
      contact_name: eventForm.contact_name,
      contact_email: eventForm.contact_email || null,
      contact_phone: eventForm.contact_phone || null,
      notes: eventForm.notes || null,
    }

    if (editingEvent) {
      await supabase.from('events').update(eventData).eq('id', editingEvent.id)
    } else {
      const { error } = await supabase.from('events').insert(eventData)
      if (!error && eventForm.status === 'confirmed' && parseFloat(eventForm.deposit) > 0) {
        await supabase.from('finance_transactions').insert({
          date: format(new Date(), 'yyyy-MM-dd'),
          category: 'Conference',
          subcategory: 'Event Deposit',
          amount: parseFloat(eventForm.deposit),
          type: 'income',
          description: `Deposit for ${eventForm.name}`,
          payment_method: 'card',
        })
      }
    }

    resetEventForm()
    fetchEvents()
  }

  const handleSaveVenue = async () => {
    if (!venueForm.name) {
      alert('Venue name is required')
      return
    }

    const venueData = {
      name: venueForm.name,
      capacity: parseInt(venueForm.capacity) || 0,
      hourly_rate: parseFloat(venueForm.hourly_rate) || null,
      half_day_rate: parseFloat(venueForm.half_day_rate) || null,
      daily_rate: parseFloat(venueForm.daily_rate) || null,
      amenities: venueForm.amenities ? venueForm.amenities.split(',').map(a => a.trim()) : [],
    }

    if (editingVenue) {
      await supabase.from('venues').update(venueData).eq('id', editingVenue.id)
    } else {
      await supabase.from('venues').insert(venueData)
    }

    resetVenueForm()
    fetchVenues()
  }

  const resetEventForm = () => {
    setShowEventModal(false)
    setEditingEvent(null)
    setEventForm({
      name: '',
      venue_id: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_time: '17:00',
      package: 'full_day',
      attendees: '',
      catering_included: false,
      total: '',
      deposit: '',
      status: 'inquiry',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
    })
  }

  const resetVenueForm = () => {
    setShowVenueModal(false)
    setEditingVenue(null)
    setVenueForm({
      name: '',
      capacity: '',
      hourly_rate: '',
      half_day_rate: '',
      daily_rate: '',
      amenities: '',
    })
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchEvents()
  }

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    await supabase.from('events').update({ status: newStatus }).eq('id', eventId)
    fetchEvents()
  }

  const calculatePrice = (venue: Venue | undefined, pkg: string) => {
    if (!venue) return 0
    switch (pkg) {
      case 'hourly': return venue.hourly_rate || 0
      case 'half_day': return venue.half_day_rate || 0
      case 'full_day': return venue.daily_rate || 0
      default: return 0
    }
  }

  // Calendar
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPadding = monthStart.getDay()

  const eventsOnDate = (date: Date) => 
    events.filter(e => isSameDay(new Date(e.event_date), date))

  const upcomingEvents = events.filter(e => 
    new Date(e.event_date) >= new Date() && e.status !== 'cancelled'
  ).slice(0, 5)

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Conferences</h1>
          <p className="text-gray-500">{events.length} total events, {upcomingEvents.length} upcoming</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVenueModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <MapPin className="w-4 h-4" />
            Manage Venues
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="h-20" />
            ))}

            {daysInMonth.map(day => {
              const dayEvents = eventsOnDate(day)
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 p-1 border rounded-lg text-left transition-colors ${
                    isSelected ? 'border-ocean-500 bg-ocean-50' :
                    isToday ? 'border-gold-500 bg-gold-50' :
                    !isSameMonth(day, currentMonth) ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${isToday ? 'font-bold text-gold-600' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 rounded truncate ${
                          event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          event.status === 'inquiry' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {event.name}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Venues */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3">Venues</h3>
            <div className="space-y-2">
              {venues.map(venue => (
                <div key={venue.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{venue.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {venue.capacity} capacity
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingVenue(venue)
                        setVenueForm({
                          name: venue.name,
                          capacity: venue.capacity.toString(),
                          hourly_rate: venue.hourly_rate?.toString() || '',
                          half_day_rate: venue.half_day_rate?.toString() || '',
                          daily_rate: venue.daily_rate?.toString() || '',
                          amenities: venue.amenities?.join(', ') || '',
                        })
                        setShowVenueModal(true)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  {venue.daily_rate && (
                    <p className="text-xs text-ocean-600 mt-1">
                      Full day: {venue.daily_rate.toLocaleString()} VT
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3">Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{event.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        STATUSES.find(s => s.value === event.status)?.color
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(event.event_date), 'MMM dd, yyyy')}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.start_time} - {event.end_time}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.venues?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">All Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Package</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{event.name}</p>
                    {event.attendees && (
                      <p className="text-xs text-gray-500">{event.attendees} attendees</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <p>{format(new Date(event.event_date), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-gray-500">{event.start_time} - {event.end_time}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{event.venues?.name}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{event.contact_name}</p>
                    {event.contact_phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {event.contact_phone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm capitalize">{event.package}</span>
                    {event.catering_included && (
                      <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1 rounded">+Catering</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={event.status}
                      onChange={(e) => handleUpdateStatus(event.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border-0 ${
                        STATUSES.find(s => s.value === event.status)?.color
                      }`}
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium">{Number(event.total).toLocaleString()} VT</p>
                    {event.deposit > 0 && (
                      <p className="text-xs text-green-600">Deposit: {Number(event.deposit).toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingEvent(event)
                        setEventForm({
                          name: event.name,
                          venue_id: event.venue_id,
                          event_date: event.event_date,
                          start_time: event.start_time,
                          end_time: event.end_time,
                          package: event.package,
                          attendees: event.attendees?.toString() || '',
                          catering_included: event.catering_included,
                          total: event.total.toString(),
                          deposit: event.deposit.toString(),
                          status: event.status,
                          contact_name: event.contact_name,
                          contact_email: event.contact_email || '',
                          contact_phone: event.contact_phone || '',
                          notes: event.notes || '',
                        })
                        setShowEventModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h3>
              <button onClick={resetEventForm}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Company Meeting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <select
                    value={eventForm.venue_id}
                    onChange={(e) => {
                      const venue = venues.find(v => v.id === e.target.value)
                      const price = calculatePrice(venue, eventForm.package)
                      setEventForm({ ...eventForm, venue_id: e.target.value, total: price.toString() })
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select venue...</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                  <select
                    value={eventForm.package}
                    onChange={(e) => {
                      const venue = venues.find(v => v.id === eventForm.venue_id)
                      const price = calculatePrice(venue, e.target.value)
                      setEventForm({ ...eventForm, package: e.target.value, total: price.toString() })
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {PACKAGES.map(p => (
                      <option key={p.value} value={p.value}>{p.label} - {p.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                  <input
                    type="number"
                    value={eventForm.attendees}
                    onChange={(e) => setEventForm({ ...eventForm, attendees: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Expected attendees"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catering"
                    checked={eventForm.catering_included}
                    onChange={(e) => setEventForm({ ...eventForm, catering_included: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="catering" className="text-sm">Include Catering</label>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <h4 className="font-medium mb-3">Contact Information</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    value={eventForm.contact_name}
                    onChange={(e) => setEventForm({ ...eventForm, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={eventForm.contact_phone}
                    onChange={(e) => setEventForm({ ...eventForm, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={eventForm.contact_email}
                    onChange={(e) => setEventForm({ ...eventForm, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2 border-t pt-4">
                  <h4 className="font-medium mb-3">Pricing & Status</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total (VT)</label>
                  <input
                    type="number"
                    value={eventForm.total}
                    onChange={(e) => setEventForm({ ...eventForm, total: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (VT)</label>
                  <input
                    type="number"
                    value={eventForm.deposit}
                    onChange={(e) => setEventForm({ ...eventForm, deposit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={eventForm.notes}
                    onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={resetEventForm}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Modal */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingVenue ? 'Edit Venue' : 'Add Venue'}
              </h3>
              <button onClick={resetVenueForm}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={venueForm.capacity}
                  onChange={(e) => setVenueForm({ ...venueForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly (VT)</label>
                  <input
                    type="number"
                    value={venueForm.hourly_rate}
                    onChange={(e) => setVenueForm({ ...venueForm, hourly_rate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Half Day</label>
                  <input
                    type="number"
                    value={venueForm.half_day_rate}
                    onChange={(e) => setVenueForm({ ...venueForm, half_day_rate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Day</label>
                  <input
                    type="number"
                    value={venueForm.daily_rate}
                    onChange={(e) => setVenueForm({ ...venueForm, daily_rate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={venueForm.amenities}
                  onChange={(e) => setVenueForm({ ...venueForm, amenities: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Projector, WiFi, Sound System"
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={resetVenueForm}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVenue}
                className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
              >
                {editingVenue ? 'Update' : 'Add Venue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
