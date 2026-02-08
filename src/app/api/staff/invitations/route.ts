import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all staff invitations
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff_invitations')
      .select(`
        *,
        role:roles(id, name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}
