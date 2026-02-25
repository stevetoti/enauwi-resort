import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceRole)
}

interface ImageInfo {
  path: string
  relativePath: string
  category: string
  key: string
  label: string
}

// Map folder paths to categories
function getCategoryFromPath(filePath: string): string {
  if (filePath.includes('malili-rooms')) return 'Rooms - Malili'
  if (filePath.includes('gallery')) return 'Gallery'
  if (filePath.includes('GroovyBanana')) return 'Gallery'
  if (filePath.includes('originals') || filePath.includes('Initial Photos')) return 'Drone'
  if (filePath.includes('new/')) return 'Activities'
  if (filePath.includes('wedding')) return 'Wedding'
  if (filePath.includes('resort/')) return 'Resort'
  return 'General'
}

// Generate a readable label from filename
function generateLabel(filename: string): string {
  return filename
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/opt-pro/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Generate a unique key from path
function generateKey(relativePath: string): string {
  return relativePath
    .replace(/^\/images\//, '')
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .slice(0, 90) // Keep under 100 chars
}

async function scanDirectory(dir: string, baseDir: string): Promise<ImageInfo[]> {
  const images: ImageInfo[] = []
  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        const subImages = await scanDirectory(fullPath, baseDir)
        images.push(...subImages)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (extensions.includes(ext)) {
          const relativePath = fullPath.replace(baseDir, '').replace(/\\/g, '/')
          images.push({
            path: fullPath,
            relativePath: '/images' + relativePath,
            category: getCategoryFromPath(relativePath),
            key: generateKey('/images' + relativePath),
            label: generateLabel(entry.name),
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error)
  }
  
  return images
}

// POST - Scan filesystem and add new images to database
export async function POST() {
  try {
    const supabase = getSupabaseAdmin()
    
    // Get base path for public/images
    const publicDir = path.join(process.cwd(), 'public', 'images')
    
    // Scan all images
    const allImages = await scanDirectory(publicDir, publicDir)
    
    // Get existing entries
    const { data: existingContent, error: fetchError } = await supabase
      .from('website_content')
      .select('key, current_image_url')
    
    if (fetchError) throw fetchError
    
    const existingKeys = new Set(existingContent?.map(c => c.key) || [])
    const existingUrls = new Set(existingContent?.map(c => c.current_image_url) || [])
    
    // Find new images
    const newImages = allImages.filter(img => 
      !existingKeys.has(img.key) && !existingUrls.has(img.relativePath)
    )
    
    // Insert new images
    if (newImages.length > 0) {
      const insertData = newImages.map(img => ({
        key: img.key,
        label: img.label,
        description: `Auto-discovered image from ${img.relativePath}`,
        location: img.category === 'Gallery' ? 'Gallery Page' : 
                  img.category === 'Rooms - Malili' ? 'Rooms > Malili' :
                  img.category === 'Drone' ? 'Archive / Drone' :
                  'Website General',
        current_image_url: img.relativePath,
        image_dimensions: '1920x1080 recommended',
        // category column may not exist yet - omitting it
      }))
      
      const { error: insertError } = await supabase
        .from('website_content')
        .insert(insertData)
      
      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
    }
    
    return NextResponse.json({
      success: true,
      found: allImages.length,
      existing: existingKeys.size,
      added: newImages.length,
      newImages: newImages.map(i => i.relativePath),
    })
  } catch (error) {
    console.error('Error scanning filesystem:', error)
    return NextResponse.json(
      { error: 'Failed to scan filesystem' },
      { status: 500 }
    )
  }
}
