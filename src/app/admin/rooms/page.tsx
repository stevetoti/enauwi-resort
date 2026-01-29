'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BedDouble,
  Edit2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Users,
  ImageIcon,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatVatu } from '@/lib/utils'
import { Room } from '@/types'

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  const supabase = createClientSupabase()

  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('price_vt')

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const toggleAvailability = async (room: Room) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ available: !room.available })
        .eq('id', room.id)

      if (error) throw error
      await fetchRooms()
    } catch (error) {
      console.error('Error toggling availability:', error)
      alert('Failed to update room availability')
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
      {/* Room Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
              {room.images && room.images[0] ? (
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}

              {/* Availability badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    room.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {room.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{room.type}</p>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatVatu(room.price_vt)}<span className="text-xs text-gray-400 font-normal">/night</span></p>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>

              {/* Max guests */}
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <Users className="h-4 w-4" />
                <span>Up to {room.max_guests} guests</span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1 mb-4">
                {room.amenities.slice(0, 4).map((amenity, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                    +{room.amenities.length - 4} more
                  </span>
                )}
              </div>

              {/* Images count */}
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <ImageIcon className="h-3 w-3" />
                <span>{room.images?.length || 0} images</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingRoom(room)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => toggleAvailability(room)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    room.available
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                  title={room.available ? 'Mark unavailable' : 'Mark available'}
                >
                  {room.available ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <BedDouble className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No rooms found</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingRoom && (
        <RoomEditModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={async () => {
            await fetchRooms()
            setEditingRoom(null)
          }}
        />
      )}
    </div>
  )
}

function RoomEditModal({
  room,
  onClose,
  onSave,
}: {
  room: Room
  onClose: () => void
  onSave: () => Promise<void>
}) {
  const [formData, setFormData] = useState({
    name: room.name,
    type: room.type,
    description: room.description || '',
    price_vt: room.price_vt,
    max_guests: room.max_guests,
    amenities: room.amenities.join(', '),
    images: room.images.join('\n'),
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClientSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          price_vt: formData.price_vt,
          max_guests: formData.max_guests,
          amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
          images: formData.images.split('\n').map((u) => u.trim()).filter(Boolean),
        })
        .eq('id', room.id)

      if (error) throw error
      await onSave()
    } catch (error) {
      console.error('Error updating room:', error)
      alert('Failed to update room')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Room</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="bungalow">Bungalow</option>
                <option value="suite">Suite</option>
                <option value="villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.max_guests}
                onChange={(e) =>
                  setFormData({ ...formData, max_guests: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (VT per night)
            </label>
            <input
              type="number"
              min={0}
              required
              value={formData.price_vt}
              onChange={(e) =>
                setFormData({ ...formData, price_vt: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="WiFi, Beach Access, Ocean View"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              rows={3}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
