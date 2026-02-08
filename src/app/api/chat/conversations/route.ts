import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all conversations for a staff member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staff_id')

    if (!staffId) {
      return NextResponse.json({ error: 'staff_id required' }, { status: 400 })
    }

    // Get all conversations where staff is a participant
    const { data: participations, error: partError } = await supabaseAdmin
      .from('team_conversation_participants')
      .select('conversation_id, last_read_at, is_muted, role')
      .eq('staff_id', staffId)

    if (partError) throw partError

    if (!participations || participations.length === 0) {
      return NextResponse.json([])
    }

    const conversationIds = participations.map(p => p.conversation_id)

    // Get conversations with details
    const { data: conversations, error: convError } = await supabaseAdmin
      .from('team_conversations')
      .select(`
        *,
        department:departments(id, name),
        creator:staff!created_by(id, name, profile_photo)
      `)
      .in('id', conversationIds)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (convError) throw convError

    // Get participants for each conversation
    const { data: allParticipants } = await supabaseAdmin
      .from('team_conversation_participants')
      .select(`
        conversation_id,
        staff:staff_id(id, name, profile_photo, status)
      `)
      .in('conversation_id', conversationIds)

    // Get last message for each conversation
    const { data: lastMessages } = await supabaseAdmin
      .from('team_messages')
      .select('conversation_id, content, message_type, created_at, sender:sender_id(name)')
      .in('conversation_id', conversationIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    // Get unread counts
    const participationMap = new Map(participations.map(p => [p.conversation_id, p]))

    // Build response
    const result = conversations?.map(conv => {
      const participation = participationMap.get(conv.id)
      const convParticipants = allParticipants?.filter(p => p.conversation_id === conv.id) || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const participants = convParticipants.map((p: any) => p.staff).filter(Boolean)
      const lastMessage = lastMessages?.find(m => m.conversation_id === conv.id)
      
      // For direct chats, get the other person's info
      let displayName = conv.name
      let displayAvatar = conv.avatar_url
      if (conv.type === 'direct' && participants.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherPerson = participants.find((p: any) => p?.id !== staffId)
        if (otherPerson) {
          displayName = otherPerson.name
          displayAvatar = otherPerson.profile_photo
        }
      }

      return {
        ...conv,
        display_name: displayName || 'Chat',
        display_avatar: displayAvatar,
        participants,
        last_message: lastMessage,
        last_read_at: participation?.last_read_at,
        is_muted: participation?.is_muted,
        my_role: participation?.role,
        unread_count: 0 // Will calculate based on last_read_at vs messages
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST create new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, participant_ids, department_id, created_by } = body

    if (!type || !created_by) {
      return NextResponse.json({ error: 'type and created_by required' }, { status: 400 })
    }

    // For direct chats, check if conversation already exists
    if (type === 'direct' && participant_ids?.length === 2) {
      const { data: existing } = await supabaseAdmin
        .from('team_conversations')
        .select(`
          id,
          team_conversation_participants!inner(staff_id)
        `)
        .eq('type', 'direct')
        .eq('is_active', true)

      // Check if there's an existing direct chat with these exact participants
      for (const conv of existing || []) {
        const participantStaffIds = (conv.team_conversation_participants as { staff_id: string }[]).map(p => p.staff_id)
        if (participantStaffIds.length === 2 && 
            participant_ids.every((id: string) => participantStaffIds.includes(id))) {
          // Return existing conversation
          const { data: fullConv } = await supabaseAdmin
            .from('team_conversations')
            .select('*')
            .eq('id', conv.id)
            .single()
          return NextResponse.json(fullConv)
        }
      }
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('team_conversations')
      .insert({
        type,
        name: type === 'direct' ? null : name,
        department_id: type === 'department' ? department_id : null,
        created_by
      })
      .select()
      .single()

    if (convError) throw convError

    // Add participants
    const participants = (participant_ids || [created_by]).map((staffId: string) => ({
      conversation_id: conversation.id,
      staff_id: staffId,
      role: staffId === created_by ? 'admin' : 'member'
    }))

    const { error: partError } = await supabaseAdmin
      .from('team_conversation_participants')
      .insert(participants)

    if (partError) throw partError

    // Add system message for group/department creation
    if (type !== 'direct') {
      await supabaseAdmin.from('team_messages').insert({
        conversation_id: conversation.id,
        sender_id: created_by,
        content: type === 'department' ? 'Department chat created' : `Group "${name}" created`,
        message_type: 'system'
      })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
