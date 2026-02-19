import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface GenerateRequest {
  type: 'room_promo' | 'activity' | 'testimonial' | 'culture' | 'seasonal' | 'general' | 'bulk'
  language: 'en' | 'bis' | 'fr'
  platform: 'facebook' | 'instagram' | 'twitter' | 'all'
  context?: {
    roomId?: string
    activityName?: string
    season?: string
    event?: string
    customPrompt?: string
  }
  numberOfPosts?: number // For bulk generation
}

const RESORT_CONTEXT = `
E'Nauwi Beach Resort is a boutique resort located on Malekula Island, Vanuatu - the second largest island in the country. 
The resort offers:
- Beachfront bungalows and rooms with ocean views
- PADI-certified scuba diving and snorkeling
- Traditional kastom village cultural tours
- Rom dance performances (unique to Malekula)
- Deep-sea and reef fishing trips
- Kayaking and paddleboarding
- Fresh local cuisine featuring seafood and traditional dishes
- Conference facilities
- Wedding and event hosting

Malekula is known as the most culturally diverse island in Vanuatu with over 30 indigenous languages.
The resort provides authentic Melanesian hospitality with modern comfort.

Brand voice: Warm, inviting, professional yet friendly. Emphasize authenticity, cultural richness, natural beauty, and adventure.
`

const LANGUAGE_INSTRUCTIONS = {
  en: 'Write in English. Use warm, professional hospitality tone.',
  bis: 'Write in Bislama (Vanuatu Pidgin). Use casual, friendly island tone. Example phrases: "Kam long..." (Come to), "Yufala i welkam" (You are welcome), "Nambawan" (Number one/best).',
  fr: 'Write in French. Use elegant, professional hospitality tone suitable for French-speaking tourists from New Caledonia and France.'
}

const PLATFORM_GUIDELINES = {
  facebook: 'Longer form content allowed (up to 500 words). Can include links. More storytelling.',
  instagram: 'Concise, visual-focused captions. Use lots of emojis. Max 150 words. Hashtags important.',
  twitter: 'Very concise (under 280 characters). Punchy, engaging. 1-2 hashtags max.',
  all: 'Create versatile content that works across platforms. Medium length.'
}

async function getRoomData(roomId?: string) {
  if (!roomId) {
    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('available', true)
      .limit(5)
    return rooms
  }
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single()
  return room
}

async function getBookingTrends() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('room_id, total_price, num_guests')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(20)
  
  return bookings
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json()
    const { type, language, platform, context, numberOfPosts = 1 } = body

    // Gather contextual data
    let contextData = ''
    
    if (type === 'room_promo' || context?.roomId) {
      const rooms = await getRoomData(context?.roomId)
      if (rooms) {
        contextData += `\n\nAvailable rooms data: ${JSON.stringify(rooms)}`
      }
    }

    if (type === 'seasonal') {
      const bookingTrends = await getBookingTrends()
      if (bookingTrends) {
        contextData += `\n\nRecent booking trends: ${JSON.stringify(bookingTrends)}`
      }
    }

    const prompt = buildPrompt(type, language, platform, context, contextData, numberOfPosts)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a social media content creator for E'Nauwi Beach Resort. 
${RESORT_CONTEXT}

Always respond with valid JSON only, no markdown formatting.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0].message.content
    const parsed = JSON.parse(content || '{}')

    return NextResponse.json({
      success: true,
      posts: Array.isArray(parsed.posts) ? parsed.posts : [parsed],
      usage: completion.usage
    })
  } catch (error) {
    console.error('AI Generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function buildPrompt(
  type: string, 
  language: string, 
  platform: string, 
  context?: GenerateRequest['context'],
  contextData?: string,
  numberOfPosts: number = 1
): string {
  const langInstructions = LANGUAGE_INSTRUCTIONS[language as keyof typeof LANGUAGE_INSTRUCTIONS] || LANGUAGE_INSTRUCTIONS.en
  const platformGuide = PLATFORM_GUIDELINES[platform as keyof typeof PLATFORM_GUIDELINES] || PLATFORM_GUIDELINES.all

  let typeInstructions = ''
  switch (type) {
    case 'room_promo':
      typeInstructions = 'Create a promotional post highlighting room features, amenities, and value. Include pricing if available.'
      break
    case 'activity':
      typeInstructions = `Create an engaging post about resort activities. ${context?.activityName ? `Focus on: ${context.activityName}` : 'Choose from: diving, fishing, cultural tours, kayaking, or beach activities.'}`
      break
    case 'testimonial':
      typeInstructions = 'Create a post format suitable for sharing guest reviews. Include a placeholder for the actual testimonial.'
      break
    case 'culture':
      typeInstructions = 'Create educational and engaging content about Malekula culture, Rom dance, kastom villages, or traditional practices.'
      break
    case 'seasonal':
      typeInstructions = `Create seasonal content. ${context?.season ? `Focus on: ${context.season}` : 'Consider current season and any special offers.'}`
      break
    case 'bulk':
      typeInstructions = `Create a week's worth of varied content mixing: room promotions, activities, cultural content, and engagement posts.`
      break
    default:
      typeInstructions = context?.customPrompt || 'Create engaging general content about the resort experience.'
  }

  const postCount = type === 'bulk' ? 7 : numberOfPosts

  return `
${langInstructions}

${platformGuide}

${typeInstructions}

${contextData || ''}

Create ${postCount} social media post(s).

Return JSON in this exact format:
{
  "posts": [
    {
      "content": "The post text with emojis",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "suggestedTime": "Best posting time (e.g., '10:00 AM', '6:00 PM')",
      "platform": "${platform}",
      "postType": "${type}",
      "suggestedMedia": "Description of ideal image/video to pair with this post"
    }
  ]
}
`
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AI Content Generation Endpoint',
    usage: 'POST with { type, language, platform, context }',
    types: ['room_promo', 'activity', 'testimonial', 'culture', 'seasonal', 'general', 'bulk'],
    languages: ['en', 'bis', 'fr'],
    platforms: ['facebook', 'instagram', 'twitter', 'all']
  })
}
