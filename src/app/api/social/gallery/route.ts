import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET all gallery images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('social_gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ images: data || [] })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery', images: [] }, { status: 500 })
  }
}

// POST - upload new image to gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'
    const title = formData.get('title') as string || ''
    const description = formData.get('description') as string || ''
    const tags = formData.get('tags') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `social/${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Ensure bucket exists
    const bucketName = 'enauwi-assets'
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucketName)
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800
      })
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename)

    // Save to gallery table
    const { data: galleryEntry, error: dbError } = await supabase
      .from('social_gallery')
      .insert({
        url: urlData.publicUrl,
        thumbnail_url: urlData.publicUrl, // Could generate thumbnail later
        title: title || file.name,
        description,
        category,
        tags: tags ? tags.split(',').map(t => t.trim()) : []
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      // File uploaded but DB entry failed - still return the URL
      return NextResponse.json({ 
        url: urlData.publicUrl,
        warning: 'Image uploaded but gallery entry failed'
      })
    }

    return NextResponse.json({ image: galleryEntry })
  } catch (error) {
    console.error('Gallery upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

// DELETE - remove image from gallery
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    // Get the image URL first
    const { data: image } = await supabase
      .from('social_gallery')
      .select('url')
      .eq('id', id)
      .single()

    if (image?.url) {
      // Extract path from URL and delete from storage
      const path = image.url.split('/storage/v1/object/public/enauwi-assets/')[1]
      if (path) {
        await supabase.storage.from('enauwi-assets').remove([path])
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('social_gallery')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
