import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

// Interior room images for each room type
const roomImages: Record<string, string[]> = {
  'lagoon-beachfront-1br': [
    '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-1-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
  ],
  'lagoon-beachfront-2br': [
    '/images/resort/malili-rooms/living-room-2-opt-pro.jpg',
    '/images/resort/malili-rooms/bedroom-2-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-3-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-toiletries-opt-pro.jpg',
  ],
  'garden-1br': [
    '/images/resort/malili-rooms/living-room-4-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-2-opt-pro.jpg',
    '/images/resort/malili-rooms/welcome-table-2-opt-pro.jpg',
    '/images/resort/malili-rooms/amenities-tray-opt-pro.jpg',
  ],
  'garden-2br': [
    '/images/resort/malili-rooms/living-room-6-opt-pro.jpg',
    '/images/resort/malili-rooms/twin-bedroom-3-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-8-opt-pro.jpg',
    '/images/resort/malili-rooms/tea-coffee-station-opt-pro.jpg',
  ],
  'deluxe': [
    '/images/resort/malili-rooms/living-room-9-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-3-opt-pro.jpg',
    '/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg',
    '/images/resort/malili-rooms/welcome-sofa-view-opt-pro.jpg',
  ],
}

export async function POST() {
  try {
    const supabase = createServiceSupabase()
    
    // Get all rooms
    const { data: rooms, error: fetchError } = await supabase
      .from('rooms')
      .select('id, name')
    
    if (fetchError) throw fetchError
    
    const updates: { id: string; name: string; images: string[] }[] = []
    
    for (const room of rooms || []) {
      const name = room.name.toLowerCase()
      let images: string[] = []
      
      // Match room to image set based on name
      if (name.includes('beachfront') && name.includes('1')) {
        images = roomImages['lagoon-beachfront-1br']
      } else if (name.includes('beachfront') && name.includes('2')) {
        images = roomImages['lagoon-beachfront-2br']
      } else if (name.includes('lagoon') && name.includes('superior')) {
        images = roomImages['lagoon-beachfront-1br']
      } else if (name.includes('garden') && name.includes('1')) {
        images = roomImages['garden-1br']
      } else if (name.includes('garden') && name.includes('2')) {
        images = roomImages['garden-2br']
      } else if (name.includes('deluxe')) {
        images = roomImages['deluxe']
      } else if (name.includes('superior')) {
        images = roomImages['garden-1br']
      } else {
        // Default to lagoon beachfront images
        images = roomImages['lagoon-beachfront-1br']
      }
      
      // Update room
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ images })
        .eq('id', room.id)
      
      if (updateError) {
        console.error(`Error updating room ${room.name}:`, updateError)
      } else {
        updates.push({ id: room.id, name: room.name, images })
      }
    }
    
    return NextResponse.json({
      success: true,
      updated: updates.length,
      rooms: updates,
    })
  } catch (error) {
    console.error('Error updating room images:', error)
    return NextResponse.json(
      { error: 'Failed to update room images' },
      { status: 500 }
    )
  }
}
