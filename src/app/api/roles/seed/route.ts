import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEFAULT_ROLES = [
  {
    name: 'Manager',
    description: 'Department or shift manager with full operational access',
    is_system_role: false,
    permissions: {
      dashboard: { view: true },
      bookings: { view: true, create: true, edit: true, delete: true },
      rooms: { view: true, create: true, edit: true },
      guests: { view: true, create: true, edit: true },
      staff: { view: true, edit: true },
      conferences: { view: true, create: true, edit: true },
      announcements: { view: true, create: true, edit: true },
      reports: { view: true },
    },
  },
  {
    name: 'Front Desk',
    description: 'Reception and guest check-in/check-out',
    is_system_role: false,
    permissions: {
      dashboard: { view: true },
      bookings: { view: true, create: true, edit: true },
      rooms: { view: true },
      guests: { view: true, create: true, edit: true },
      announcements: { view: true },
    },
  },
  {
    name: 'Housekeeping',
    description: 'Room cleaning and maintenance staff',
    is_system_role: false,
    permissions: {
      dashboard: { view: true },
      rooms: { view: true, view_rooms: true, update_cleaning: true },
      announcements: { view: true },
    },
  },
  {
    name: 'Kitchen',
    description: 'Kitchen and food service staff',
    is_system_role: false,
    permissions: {
      dashboard: { view: true },
      services: { view: true, view_orders: true, update_orders: true },
      kitchen: { view: true, view_orders: true, update_orders: true },
      announcements: { view: true },
    },
  },
  {
    name: 'Activities',
    description: 'Guest activities and tour coordination',
    is_system_role: false,
    permissions: {
      dashboard: { view: true },
      bookings: { view: true },
      guests: { view: true },
      services: { view: true, create: true, edit: true },
      announcements: { view: true },
    },
  },
  {
    name: 'Maintenance',
    description: 'Facilities and equipment maintenance',
    is_system_role: false,
    permissions: {
      dashboard: { view: true },
      rooms: { view: true },
      housekeeping: { view: true, update_cleaning: true },
      announcements: { view: true },
    },
  },
]

// POST - Seed default roles if none exist
export async function POST() {
  try {
    // Check if roles already exist
    const { data: existingRoles, error: checkError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .limit(1)

    if (checkError) throw checkError

    if (existingRoles && existingRoles.length > 0) {
      return NextResponse.json({ 
        message: 'Roles already exist', 
        seeded: false,
        count: existingRoles.length 
      })
    }

    // Insert default roles
    const { data, error } = await supabaseAdmin
      .from('roles')
      .insert(DEFAULT_ROLES)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      message: 'Default roles seeded successfully', 
      seeded: true,
      roles: data 
    })
  } catch (error) {
    console.error('Error seeding roles:', error)
    return NextResponse.json(
      { error: 'Failed to seed roles' },
      { status: 500 }
    )
  }
}

// GET - Check if roles exist and seed if needed
export async function GET() {
  try {
    const { data: existingRoles, error: checkError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('name')

    if (checkError) throw checkError

    if (!existingRoles || existingRoles.length === 0) {
      // Auto-seed if no roles exist
      const { data, error } = await supabaseAdmin
        .from('roles')
        .insert(DEFAULT_ROLES)
        .select()

      if (error) throw error

      return NextResponse.json({ 
        roles: data,
        seeded: true,
        message: 'Default roles were created'
      })
    }

    return NextResponse.json({ 
      roles: existingRoles,
      seeded: false 
    })
  } catch (error) {
    console.error('Error checking/seeding roles:', error)
    return NextResponse.json(
      { error: 'Failed to check roles' },
      { status: 500 }
    )
  }
}
