import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST - Initialize department chats for all departments
export async function POST() {
  try {
    // Get all active departments
    const { data: departments, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('id, name')
      .eq('is_active', true)

    if (deptError) throw deptError

    const created = []

    for (const dept of departments || []) {
      // Check if department chat already exists
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('type', 'department')
        .eq('department_id', dept.id)
        .eq('is_active', true)
        .single()

      if (existing) continue

      // Create department chat
      const { data: conv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          type: 'department',
          name: `${dept.name} Team`,
          department_id: dept.id
        })
        .select()
        .single()

      if (convError) {
        console.error(`Error creating chat for ${dept.name}:`, convError)
        continue
      }

      // Get all staff in this department
      const { data: staffInDept } = await supabaseAdmin
        .from('staff')
        .select('id')
        .eq('department_id', dept.id)
        .eq('status', 'active')

      if (staffInDept && staffInDept.length > 0) {
        // Add all department members as participants
        const participants = staffInDept.map(s => ({
          conversation_id: conv.id,
          staff_id: s.id,
          role: 'member'
        }))

        await supabaseAdmin
          .from('conversation_participants')
          .insert(participants)

        // Add welcome message
        await supabaseAdmin.from('messages').insert({
          conversation_id: conv.id,
          content: `Welcome to ${dept.name} Team chat! This is a space for team communication.`,
          message_type: 'system'
        })
      }

      created.push({ department: dept.name, conversation_id: conv.id })
    }

    return NextResponse.json({ 
      message: `Created ${created.length} department chats`,
      created 
    })
  } catch (error) {
    console.error('Error initializing department chats:', error)
    return NextResponse.json({ error: 'Failed to initialize chats' }, { status: 500 })
  }
}
