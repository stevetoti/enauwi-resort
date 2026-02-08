import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET department documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('department_documents')
      .select('*, uploader:staff(id, name)')
      .eq('department_id', id)
      .order('category')
      .order('name')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching department documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST add document/link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, url, file_type, file_size, category, uploaded_by } = body

    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('department_documents')
      .insert({
        department_id: id,
        name,
        description,
        url,
        file_type: file_type || 'link',
        file_size,
        category: category || 'General',
        uploaded_by
      })
      .select('*, uploader:staff(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating department document:', error)
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 })
  }
}
