import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // cursor for pagination

    let query = supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, profile_photo)
      `)
      .eq('conversation_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) throw error

    // Return in chronological order
    return NextResponse.json(data?.reverse() || [])
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sender_id, content, message_type = 'text', attachments = [] } = body

    if (!sender_id || (!content && attachments.length === 0)) {
      return NextResponse.json({ error: 'sender_id and content/attachments required' }, { status: 400 })
    }

    // Verify sender is a participant
    const { data: participant } = await supabaseAdmin
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', id)
      .eq('staff_id', sender_id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant of this conversation' }, { status: 403 })
    }

    // Create message
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id,
        content,
        message_type,
        attachments
      })
      .select(`
        *,
        sender:sender_id(id, name, profile_photo)
      `)
      .single()

    if (error) throw error

    // Update conversation's updated_at
    await supabaseAdmin
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)

    // Update sender's last_read_at
    await supabaseAdmin
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('staff_id', sender_id)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
