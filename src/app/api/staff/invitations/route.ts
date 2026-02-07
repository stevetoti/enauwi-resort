import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all invitations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('staff_invitations')
      .select(`
        *,
        role:roles(*),
        inviter:staff!staff_invitations_invited_by_fkey(name, email)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    // Update expired invitations
    const now = new Date()
    const expiredIds = data
      ?.filter(inv => inv.status === 'pending' && new Date(inv.expires_at) < now)
      .map(inv => inv.id) || []

    if (expiredIds.length > 0) {
      await supabase
        .from('staff_invitations')
        .update({ status: 'expired' })
        .in('id', expiredIds)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}
