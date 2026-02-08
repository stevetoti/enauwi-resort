import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('staff')
      .select(`
        *,
        role_details:roles(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

// PATCH update staff member
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      email,
      role_id, 
      department, 
      department_id, 
      phone, 
      profile_photo, 
      status,
      date_of_birth,
      gender,
      nationality,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      date_employed,
      employment_type,
      salary,
      salary_frequency,
      bank_name,
      bank_account_number,
      tax_id,
      contract_end_date,
      notes
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role_id !== undefined) updateData.role_id = role_id
    if (department !== undefined) updateData.department = department
    if (department_id !== undefined) updateData.department_id = department_id
    if (phone !== undefined) updateData.phone = phone
    if (profile_photo !== undefined) updateData.profile_photo = profile_photo
    if (status !== undefined) updateData.status = status
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth || null
    if (gender !== undefined) updateData.gender = gender || null
    if (nationality !== undefined) updateData.nationality = nationality || null
    if (address !== undefined) updateData.address = address || null
    if (emergency_contact_name !== undefined) updateData.emergency_contact_name = emergency_contact_name || null
    if (emergency_contact_phone !== undefined) updateData.emergency_contact_phone = emergency_contact_phone || null
    if (date_employed !== undefined) updateData.date_employed = date_employed || null
    if (employment_type !== undefined) updateData.employment_type = employment_type || null
    if (salary !== undefined) updateData.salary = salary || null
    if (salary_frequency !== undefined) updateData.salary_frequency = salary_frequency || null
    if (bank_name !== undefined) updateData.bank_name = bank_name || null
    if (bank_account_number !== undefined) updateData.bank_account_number = bank_account_number || null
    if (tax_id !== undefined) updateData.tax_id = tax_id || null
    if (contract_end_date !== undefined) updateData.contract_end_date = contract_end_date || null
    if (notes !== undefined) updateData.notes = notes || null

    // If department_id is provided, also update the department name
    if (department_id) {
      const { data: dept } = await supabaseAdmin
        .from('departments')
        .select('name')
        .eq('id', department_id)
        .single()
      if (dept) {
        updateData.department = dept.name
      }
    }

    const { data, error } = await supabaseAdmin
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        role_details:roles(*),
        department_details:departments(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

// DELETE staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
  }
}
