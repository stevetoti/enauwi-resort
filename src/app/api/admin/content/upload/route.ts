import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceRole)
}

// POST - Upload a new image
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const key = formData.get('key') as string
    const contentId = formData.get('contentId') as string
    
    if (!file || !key || !contentId) {
      return NextResponse.json(
        { error: 'File, key, and contentId are required' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }
    
    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const filename = `${key}-${timestamp}.${ext}`
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Supabase storage bucket
    const { error: uploadError } = await supabase.storage
      .from('website-content')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      })
    
    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('website-content')
      .getPublicUrl(filename)
    
    const publicUrl = urlData.publicUrl
    
    // Update database with new URL
    const { data: updateData, error: updateError } = await supabase
      .from('website_content')
      .update({
        current_image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      data: updateData,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}
