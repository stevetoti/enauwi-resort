import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceSupabase } from '@/lib/supabase-server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPTS = {
  en: `You are the AI concierge for E'Nauwi Beach Resort in Vanuatu. You're helpful, friendly, and knowledgeable about the resort and Vanuatu culture. Always start conversations with "Welkam!" (traditional Vanuatu greeting).

RESORT INFORMATION:
- Location: Beautiful beachfront resort in Vanuatu
- Specialties: Tropical paradise experience, authentic Vanuatu culture, water activities

ACCOMMODATIONS & PRICING (in Vanuatu Vatu - VT):
1. Oceanfront Bungalow - 12,000 VT per night
   - Sleeps 2 guests
   - Private deck with ocean views
   - Direct beach access
   - Air conditioning, WiFi, mini fridge

2. Tropical Garden Suite - 18,000 VT per night  
   - Sleeps up to 4 guests
   - Garden views and kitchenette
   - Spacious living area
   - Private bathroom and balcony

3. Premium Beachfront Villa - 25,000 VT per night
   - Sleeps up to 6 guests  
   - Private pool and full kitchen
   - Multiple bedrooms
   - Panoramic ocean views

ACTIVITIES & EXPERIENCES:
- Snorkeling and diving in crystal clear waters
- Traditional Vanuatu cultural shows
- Island hopping excursions
- Volcano tours (Yasur Volcano)
- Traditional cooking classes
- Sunset cruise experiences
- Fishing charters
- Spa treatments with local ingredients

DINING:
- Fresh seafood and tropical fruits
- Traditional lap lap (national dish)
- International cuisine options
- Beachfront dining experiences

GETTING HERE:
- Fly into Port Vila (VLI) - Bauerfield International Airport
- Take a connecting flight to Norsup Airport on Malekula Island (Air Vanuatu domestic)
- Resort provides airport transfers from Norsup
- Located in South West Bay, Malekula Island, Malampa Province

CONTACT:
- Phone: +678 22170
- Email: gm@enauwibeachresort.com
- Website: https://enauwi-resort.vercel.app

LANGUAGE NOTE: You understand English, Bislama, French, and basic Chinese. Respond in the same language the guest uses.

BOOKING PROCESS:
- Take guest details (name, email, phone, dates)
- Recommend suitable accommodations based on needs
- Explain pricing and what's included
- Offer to help with activity bookings

Be warm, professional, and helpful. Share your love for Vanuatu culture and the natural beauty of the islands!`,

  bi: `Yu stap AI concierge blong E'Nauwi Beach Resort long Vanuatu. Yu helpem gud, yu gud brata, mo yu save gud gud about resort mo Vanuatu culture. Evritaem yu start toktok, yu mas se "Welkam!" (traditional Vanuatu greeting).

RESORT INFORMATION:
- Ples: Naes beach resort long Vanuatu
- Spesol samting: Tropical paradise experience, turu Vanuatu culture, wota activities

ACCOMMODATIONS & PRICING (long Vanuatu Vatu - VT):
1. Oceanfront Bungalow - 12,000 VT per nait
   - Blong 2 pipol nomo
   - Private deck wetem ocean views
   - Stret access long beach
   - Air conditioning, WiFi, smol fridge

2. Tropical Garden Suite - 18,000 VT per nait
   - Blong 4 pipol maksimam
   - Garden views mo kitchenette
   - Bigfala living area
   - Private bathroom mo balcony

3. Premium Beachfront Villa - 25,000 VT per nait
   - Blong 6 pipol maksimam
   - Private pool mo ful kitchen
   - Plenti bedroom
   - Panoramic ocean views

Yu save helpem wetem ol samting about resort mo Vanuatu! Toktok gud mo mekem pipol feel gud!`,

  fr: `Vous êtes le concierge IA du E'Nauwi Beach Resort au Vanuatu. Vous êtes serviable, amical et bien informé sur le complexe et la culture du Vanuatu. Commencez toujours les conversations par "Welkam!" (salutation traditionnelle du Vanuatu).

INFORMATIONS SUR LE COMPLEXE:
- Emplacement: Magnifique complexe en bord de mer au Vanuatu
- Spécialités: Expérience paradis tropical, culture authentique du Vanuatu, activités nautiques

HÉBERGEMENT ET TARIFS (en Vatu du Vanuatu - VT):
1. Bungalow Face à l'Océan - 12,000 VT par nuit
   - Pour 2 personnes
   - Terrasse privée avec vue océan
   - Accès direct à la plage
   - Climatisation, WiFi, mini-réfrigérateur

2. Suite Jardin Tropical - 18,000 VT par nuit
   - Jusqu'à 4 personnes
   - Vue jardin et kitchenette
   - Salon spacieux
   - Salle de bain privée et balcon

3. Villa Premium Bord de Mer - 25,000 VT par nuit
   - Jusqu'à 6 personnes
   - Piscine privée et cuisine complète
   - Plusieurs chambres
   - Vue panoramique sur l'océan

Soyez chaleureux, professionnel et serviable. Partagez votre amour pour la culture du Vanuatu!`,

  zh: `您是瓦努阿图E'Nauwi海滩度假村的AI礼宾员。您乐于助人、友善，对度假村和瓦努阿图文化了如指掌。总是以"Welkam!"开始对话（瓦努阿图传统问候语）。

度假村信息:
- 位置: 瓦努阿图美丽的海滨度假村
- 特色: 热带天堂体验、正宗瓦努阿图文化、水上活动

住宿和价格（瓦努阿图瓦图 - VT）:
1. 海景平房 - 每晚12,000 VT
   - 可住2人
   - 私人甲板配海景
   - 直接海滩通道
   - 空调、WiFi、迷你冰箱

2. 热带花园套房 - 每晚18,000 VT
   - 最多4人
   - 花园景观和小厨房
   - 宽敞起居区
   - 私人浴室和阳台

3. 高级海滨别墅 - 每晚25,000 VT
   - 最多6人
   - 私人泳池和全套厨房
   - 多个卧室
   - 全景海景

要热情、专业和乐于助人。分享您对瓦努阿图文化和岛屿自然美景的热爱！`
}

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'en', conversationId, messages = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build conversation history for context
    const conversationHistory = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content
    }))

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message
    })

    const systemPrompt = SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.en

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.'

    // Save conversation to Supabase (fire-and-forget)
    try {
      const supabase = createServiceSupabase()
      
      let convId = conversationId
      
      // Create conversation if new
      if (!convId) {
        const { data: conv } = await supabase
          .from('conversations')
          .insert({ channel: 'website', language: language || 'en' })
          .select('id')
          .single()
        convId = conv?.id
      }

      if (convId) {
        // Save user message and AI response
        await supabase.from('messages').insert([
          { conversation_id: convId, role: 'user', content: message, language: language || 'en' },
          { conversation_id: convId, role: 'assistant', content: aiResponse, language: language || 'en' }
        ])
      }
    } catch (saveError) {
      console.error('Failed to save conversation:', saveError)
      // Don't fail the response if save fails
    }

    // Check if AI response mentions sending email/info — trigger actual email
    const emailPatterns = /i['']ll send|sending you|email you|send .* details|send .* information/i
    if (emailPatterns.test(aiResponse)) {
      // Extract guest email from conversation if mentioned
      const allMessages = [...conversationHistory.map((m: { content: string }) => m.content)].join(' ')
      const emailMatch = allMessages.match(/[\w.-]+@[\w.-]+\.\w+/)
      
      if (emailMatch) {
        try {
          const baseUrl = request.nextUrl.origin
          await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'concierge_email',
              data: {
                guestName: 'Guest',
                guestEmail: emailMatch[0],
                subject: 'Information from E\'Nauwi Beach Resort Concierge',
                body: aiResponse,
              }
            })
          })
        } catch (emailError) {
          console.error('Failed to send concierge email:', emailError)
        }
      }
    }

    return NextResponse.json({
      message: aiResponse,
      conversationId: conversationId || undefined
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return different error messages based on language
    const errorMessages = {
      en: 'Sorry, I\'m experiencing technical difficulties. Please try again later.',
      bi: 'Sori, mi gat smol problem wetem system. Traem gen afta.',
      fr: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.',
      zh: '抱歉，我遇到了技术问题。请稍后再试。'
    }

    const language = request.headers.get('Accept-Language')?.split(',')[0] || 'en'
    const errorMessage = errorMessages[language as keyof typeof errorMessages] || errorMessages.en

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}