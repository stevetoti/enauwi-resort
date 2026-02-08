import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET single conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        department:departments(id, name),
        creator:staff!created_by(id, name, profile_photo),
        participants:conversation_participants(
          staff_id,
          role,
          joined_at,
          staff:staff_id(id, name, profile_photo, status, department)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

// PATCH update conversation (name, avatar, add/remove participants)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, avatar_url, add_participants, remove_participants, staff_id } = body

    // Update conversation details
    if (name !== undefined || avatar_url !== undefined) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (name !== undefined) updates.name = name
      if (avatar_url !== undefined) updates.avatar_url = avatar_url

      await supabaseAdmin
        .from('conversations')
        .update(updates)
        .eq('id', id)
    }

    // Add participants
    if (add_participants && add_participants.length > 0) {
      const newParticipants = add_participants.map((staffId: string) => ({
        conversation_id: id,
        staff_id: staffId,
        role: 'member'
      }))

      await supabaseAdmin
        .from('conversation_participants')
        .upsert(newParticipants, { onConflict: 'conversation_id,staff_id' })

      // System message
      if (staff_id) {
        const { data: addedStaff } = await supabaseAdmin
          .from('staff')
          .select('name')
          .in('id', add_participants)

        const names = addedStaff?.map(s => s.name).join(', ')
        await supabaseAdmin.from('messages').insert({
          conversation_id: id,
          sender_id: staff_id,
          content: `Added ${names} to the group`,
          message_type: 'system'
        })
      }
    }

    // Remove participants
    if (remove_participants && remove_participants.length > 0) {
      await supabaseAdmin
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', id)
        .in('staff_id', remove_participants)

      // System message
      if (staff_id) {
        const { data: removedStaff } = await supabaseAdmin
          .from('staff')
          .select('name')
          .in('id', remove_participants)

        const names = removedStaff?.map(s => s.name).join(', ')
        await supabaseAdmin.from('messages').insert({
          conversation_id: id,
          sender_id: staff_id,
          content: `Removed ${names} from the group`,
          message_type: 'system'
        })
      }
    }

    // Return updated conversation
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(staff_id, role, staff:staff_id(id, name, profile_photo))
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

// DELETE (leave or delete conversation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staff_id')
    const deleteAll = searchParams.get('delete') === 'true'

    if (deleteAll) {
      // Admin delete - deactivate conversation
      await supabaseAdmin
        .from('conversations')
        .update({ is_active: false })
        .eq('id', id)
    } else if (staffId) {
      // Leave conversation
      await supabaseAdmin
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', id)
        .eq('staff_id', staffId)

      // Add system message
      const { data: staff } = await supabaseAdmin
        .from('staff')
        .select('name')
        .eq('id', staffId)
        .single()

      if (staff) {
        await supabaseAdmin.from('messages').insert({
          conversation_id: id,
          sender_id: staffId,
          content: `${staff.name} left the group`,
          message_type: 'system'
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
