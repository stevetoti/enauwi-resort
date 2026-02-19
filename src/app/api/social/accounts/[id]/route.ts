import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET single account
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('id, platform, account_name, page_id, page_name, is_active, connected_at')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ account: data })
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

// UPDATE account
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { page_id, page_name, account_name, access_token, refresh_token, is_active } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (page_id !== undefined) updateData.page_id = page_id
    if (page_name !== undefined) updateData.page_name = page_name
    if (account_name !== undefined) updateData.account_name = account_name
    if (access_token) updateData.access_token = access_token
    if (refresh_token) updateData.refresh_token = refresh_token
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('social_accounts')
      .update(updateData)
      .eq('id', params.id)
      .select('id, platform, account_name, page_id, page_name, is_active, connected_at')
      .single()

    if (error) throw error

    return NextResponse.json({ account: data })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// DELETE account
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
