'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Bot,
  Phone,
  MessageSquare,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  X,
  BedDouble,
  DollarSign,
  MapPin,
  Clock,
  Utensils,
  Activity,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'

interface KnowledgeEntry {
  id: string
  category: string
  content: string
  created_at: string
  updated_at: string
}

interface RoomInfo {
  name: string
  price: number
  description: string
  maxGuests: number
  beds: string
  type: string
}

const CATEGORIES = [
  { id: 'rooms', label: 'Rooms & Pricing', icon: BedDouble },
  { id: 'amenities', label: 'Amenities', icon: Activity },
  { id: 'dining', label: 'Dining & Restaurant', icon: Utensils },
  { id: 'activities', label: 'Activities & Experiences', icon: Activity },
  { id: 'location', label: 'Location & Contact', icon: MapPin },
  { id: 'policies', label: 'Policies & Hours', icon: Clock },
  { id: 'general', label: 'General Info', icon: MessageSquare },
]

const ROOMS_DATA: RoomInfo[] = [
  {
    name: 'Beachfront Deluxe 2 Bedroom',
    price: 30000,
    description: 'Lagoon beachfront with stunning sunset views',
    maxGuests: 4,
    beds: '1 Queen + 2 Single beds',
    type: 'Lagoon Beachfront',
  },
  {
    name: 'Lagoon View Superior 2 Bedroom',
    price: 27000,
    description: 'Garden setting with peek-through beach views',
    maxGuests: 4,
    beds: '1 Queen + 2 Single beds',
    type: 'Lagoon View',
  },
  {
    name: 'Beachfront Deluxe 1 Bedroom',
    price: 25000,
    description: 'Lagoon beachfront, kayaking at your doorstep',
    maxGuests: 2,
    beds: '1 Queen bed',
    type: 'Lagoon Beachfront',
  },
  {
    name: 'Lagoon View Superior 1 Bedroom',
    price: 22000,
    description: 'Garden retreat, peaceful private sanctuary',
    maxGuests: 2,
    beds: '1 Queen bed',
    type: 'Lagoon View',
  },
]

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [rooms, setRooms] = useState<RoomInfo[]>(ROOMS_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<'knowledge' | 'rooms' | 'voice'>('rooms')
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
  const [newEntry, setNewEntry] = useState({ category: 'general', content: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Voice agent settings
  const [voiceGreeting, setVoiceGreeting] = useState("Welcome to E'Nauwi Beach, how can I assist you today?")
  const [contactPhone, setContactPhone] = useState('+678 22170')
  const [contactEmail, setContactEmail] = useState('reservation@enauwibeachresort.com')
  const [checkInTime, setCheckInTime] = useState('2:00 PM')
  const [checkOutTime, setCheckOutTime] = useState('10:00 AM')
  const [frontDeskHours, setFrontDeskHours] = useState('Mon-Sun 8:00 AM - 5:00 PM')
  const [settingsLoaded, setSettingsLoaded] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars

  const supabase = createClientSupabase()

  // Load voice settings from database
  const loadVoiceSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['voice_greeting', 'contact_phone', 'contact_email', 'check_in_time', 'check_out_time', 'front_desk_hours'])
      
      if (error) throw error
      
      if (data) {
        data.forEach(setting => {
          switch (setting.key) {
            case 'voice_greeting': setVoiceGreeting(setting.value); break
            case 'contact_phone': setContactPhone(setting.value); break
            case 'contact_email': setContactEmail(setting.value); break
            case 'check_in_time': setCheckInTime(setting.value); break
            case 'check_out_time': setCheckOutTime(setting.value); break
            case 'front_desk_hours': setFrontDeskHours(setting.value); break
          }
        })
      }
      setSettingsLoaded(true)
    } catch (error) {
      console.error('Error loading voice settings:', error)
      setSettingsLoaded(true)
    }
  }, [supabase])

  // Save voice settings to database
  const saveVoiceSettings = async () => {
    const settings = [
      { key: 'voice_greeting', value: voiceGreeting },
      { key: 'contact_phone', value: contactPhone },
      { key: 'contact_email', value: contactEmail },
      { key: 'check_in_time', value: checkInTime },
      { key: 'check_out_time', value: checkOutTime },
      { key: 'front_desk_hours', value: frontDeskHours },
    ]
    
    for (const setting of settings) {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', setting.key)
        .single()
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('site_settings')
          .update({ value: setting.value, updated_at: new Date().toISOString() })
          .eq('key', setting.key)
        if (error) {
          console.error('Error updating setting:', setting.key, error)
          throw error
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: setting.key, value: setting.value })
        if (error) {
          console.error('Error inserting setting:', setting.key, error)
          throw error
        }
      }
    }
  }

  useEffect(() => {
    loadVoiceSettings()
  }, [loadVoiceSettings])

  const fetchKnowledge = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('category')
      
      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching knowledge base:', error)
      setMessage({ type: 'error', text: 'Failed to load knowledge base' })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchKnowledge()
  }, [fetchKnowledge])

  const saveEntry = async (entry: KnowledgeEntry) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ content: entry.content, updated_at: new Date().toISOString() })
        .eq('id', entry.id)
      
      if (error) throw error
      setMessage({ type: 'success', text: 'Entry saved successfully' })
      setEditingEntry(null)
      fetchKnowledge()
    } catch (error) {
      console.error('Error saving entry:', error)
      setMessage({ type: 'error', text: 'Failed to save entry' })
    } finally {
      setSaving(false)
    }
  }

  const addEntry = async () => {
    if (!newEntry.content.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .insert([{ category: newEntry.category, content: newEntry.content }])
      
      if (error) throw error
      setMessage({ type: 'success', text: 'Entry added successfully' })
      setNewEntry({ category: 'general', content: '' })
      setShowAddForm(false)
      fetchKnowledge()
    } catch (error) {
      console.error('Error adding entry:', error)
      setMessage({ type: 'error', text: 'Failed to add entry' })
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setMessage({ type: 'success', text: 'Entry deleted' })
      fetchKnowledge()
    } catch (error) {
      console.error('Error deleting entry:', error)
      setMessage({ type: 'error', text: 'Failed to delete entry' })
    }
  }

  const updateRoom = (index: number, field: keyof RoomInfo, value: string | number) => {
    const updated = [...rooms]
    updated[index] = { ...updated[index], [field]: value }
    setRooms(updated)
  }

  const saveRooms = async () => {
    setSaving(true)
    try {
      // Generate room content for knowledge base
      const roomContent = rooms.map(r => 
        `${r.name} (${r.type}) - ${r.price.toLocaleString()} VT/night - ${r.description}. Sleeps up to ${r.maxGuests} guests. Beds: ${r.beds}.`
      ).join('\n\n')

      // Update or insert rooms knowledge entry
      const { data: existing } = await supabase
        .from('knowledge_base')
        .select('id')
        .eq('category', 'rooms_pricing')
        .single()

      if (existing) {
        await supabase
          .from('knowledge_base')
          .update({ content: roomContent, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('knowledge_base')
          .insert([{ category: 'rooms_pricing', content: roomContent }])
      }

      setMessage({ type: 'success', text: 'Room information saved! Click "Sync to Voice Agent" to update the voice assistant.' })
    } catch (error) {
      console.error('Error saving rooms:', error)
      setMessage({ type: 'error', text: 'Failed to save room information' })
    } finally {
      setSaving(false)
    }
  }

  const syncToVoiceAgent = async () => {
    setSyncing(true)
    try {
      // First save settings to database
      await saveVoiceSettings()
      
      // Build the voice agent prompt with current data
      const roomsPrompt = rooms.map(r => 
        `${rooms.indexOf(r) + 1}. ${r.name} - ${r.price.toLocaleString()} VT/night - ${r.type}, sleeps up to ${r.maxGuests} guests, ${r.beds}`
      ).join('\n')

      const prompt = `You are the friendly AI voice concierge for E'Nauwi Beach Resort, a family-friendly island retreat on Efate Island, Vanuatu.

LANGUAGE RULES (CRITICAL):
- You are FLUENT in Bislama, English, and French
- Detect what language the guest speaks and respond in the SAME language
- If guest speaks Bislama, respond fully in Bislama
- Greeting: "Welkam!" (not "Bula")
- Common Bislama: "Hamas naet yu wantem stap?", "Mifala i gat fofala kaen rum", "Praes blong hem i...", "Yu wantem bukum?", "Tangkyu tumas!"

BOOKING PROCESS (CRITICAL - follow this sequence):
1. Greet the guest warmly, ask their preferred language
2. Ask what they need help with
3. If they want to book, collect ALL these details one by one:
   - Full name
   - Email address (ALWAYS ask for email)
   - Phone number (with country code)
   - Check-in date
   - Check-out date
   - Room preference (explain the 4 options with prices)
   - Number of guests
   - Any special requests
4. Confirm all details back to the guest
5. Call the create_booking tool with all collected info
6. Tell them: booking confirmation has been sent to their email
7. Mention they will also receive SMS confirmation

ACCOMMODATIONS (Vanuatu Vatu - VT, breakfast included):
${roomsPrompt}

All rooms include: AC, WiFi, TV, ceiling fans, mini fridge, tea/coffee station, toiletries, bathrobes, towels.

ACTIVITIES: Swimming pool, kayaking, snorkeling with dugongs and sea turtles, island hopping to 4 sandy islands, cultural village tours, sport fishing, rainforest hiking, sunset kayaking, sand drawing experience, cooking classes, birthday celebrations, wedding venue, kids club with nanny service 8am-8pm.

CONFERENCE: Fully equipped conference space for corporate retreats with projector, PA system, Wi-Fi, whiteboard.

CONTACT:
- Phone: ${contactPhone}
- Email: ${contactEmail}
- Website: enauwibeachresort.org
- Location: South East Efate, SHEFA Province, Vanuatu
- Front Desk: ${frontDeskHours} (VUT)
- Check-in: ${checkInTime} | Check-out: ${checkOutTime}

Free cancellation up to 48 hours before check-in.

GUIDELINES:
- Be warm, enthusiastic, genuinely helpful
- Keep responses concise (voice call)
- ALWAYS collect email address for bookings
- If unsure, offer to connect with staff at ${contactPhone}`

      // Call API to update voice agent
      const response = await fetch('/api/admin/sync-voice-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, greeting: voiceGreeting }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to sync')
      }

      setMessage({ type: 'success', text: 'Voice agent updated successfully! Changes are now live.' })
    } catch (error) {
      console.error('Error syncing to voice agent:', error)
      setMessage({ type: 'error', text: 'Failed to sync to voice agent. Please try again.' })
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="text-emerald-600" />
          AI Knowledge Base
        </h1>
        <p className="text-gray-600 mt-1">
          Manage information used by the AI Chat and Voice assistants
        </p>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'rooms'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign size={18} />
          Rooms & Pricing
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'voice'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Phone size={18} />
          Voice Settings
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'knowledge'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={18} />
          Knowledge Entries
        </button>
      </div>

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BedDouble className="text-emerald-600" />
              Room Types & Pricing
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Update room prices here. Changes will be reflected in both the AI Chat and Voice assistant after syncing.
            </p>

            <div className="space-y-4">
              {rooms.map((room, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoom(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (VT/night)</label>
                      <input
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoom(index, 'price', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                      <input
                        type="number"
                        value={room.maxGuests}
                        onChange={(e) => updateRoom(index, 'maxGuests', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                      <input
                        type="text"
                        value={room.beds}
                        onChange={(e) => updateRoom(index, 'beds', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={room.description}
                      onChange={(e) => updateRoom(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveRooms}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                Save Room Info
              </button>
              <button
                onClick={syncToVoiceAgent}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {syncing ? <RefreshCw size={18} className="animate-spin" /> : <Phone size={18} />}
                Sync to Voice Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Settings Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="text-emerald-600" />
              Voice Agent Settings
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Configure what the voice assistant says and knows.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
                <input
                  type="text"
                  value={voiceGreeting}
                  onChange={(e) => setVoiceGreeting(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Welcome to E'Nauwi Beach, how can I assist you today?"
                />
                <p className="text-xs text-gray-500 mt-1">This is the first thing guests hear when they call.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Front Desk Hours</label>
                  <input
                    type="text"
                    value={frontDeskHours}
                    onChange={(e) => setFrontDeskHours(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={syncToVoiceAgent}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {syncing ? <RefreshCw size={18} className="animate-spin" /> : <Phone size={18} />}
                Update Voice Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Entries Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Knowledge Base Entries</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Entry
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Add New Entry</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter knowledge content..."
                  />
                </div>
                <button
                  onClick={addEntry}
                  disabled={saving || !newEntry.content.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </div>
          )}

          {/* Entries List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No knowledge entries yet</div>
          ) : (
            <div className="space-y-4">
              {CATEGORIES.map(category => {
                const categoryEntries = entries.filter(e => e.category === category.id)
                if (categoryEntries.length === 0) return null
                
                const Icon = category.icon
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
                      <Icon size={18} className="text-emerald-600" />
                      <span className="font-medium">{category.label}</span>
                      <span className="text-sm text-gray-500">({categoryEntries.length})</span>
                    </div>
                    <div className="divide-y">
                      {categoryEntries.map(entry => (
                        <div key={entry.id} className="p-4">
                          {editingEntry?.id === entry.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingEntry.content}
                                onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEntry(editingEntry)}
                                  disabled={saving}
                                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingEntry(null)}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-4">
                              <p className="text-gray-700 whitespace-pre-wrap flex-1">{entry.content}</p>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => setEditingEntry(entry)}
                                  className="p-1 text-gray-500 hover:text-emerald-600"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteEntry(entry.id)}
                                  className="p-1 text-gray-500 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
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
      )}
    </div>
  )
}
