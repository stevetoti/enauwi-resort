import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceSupabase } from '@/lib/supabase-server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─── Shared resort knowledge (injected into every language prompt) ──────────
const RESORT_KNOWLEDGE = `
RESORT: E'Nauwi Beach Resort
LOCATION: South West Bay, Malekula Island, Malampa Province, Vanuatu
WEBSITE: https://enauwibeachresort.com

ABOUT US:
E'Nauwi Beach Resort is a family-friendly island retreat set along a peaceful beachfront with calm lagoon waters and beautiful island views. The resort offers a relaxed environment ideal for families, couples, and groups seeking comfort, good food, and genuine island hospitality.

PROPERTY HIGHLIGHTS:
• Beachfront location with lagoon and island views
• Comfortable beachfront rooms and garden bungalows
• Open-air restaurant with relaxed dining atmosphere and background music
• Bar located on site
• Outdoor swimming pool surrounded by coconut trees
• Kayaking & Snorkeling available on the lagoon & private island
• Family-friendly: kids trampoline and jumping castle
• Nanny Service available 8am - 8pm daily

GUEST EXPERIENCE:
Guests can enjoy peaceful days by the beach, relaxing swims in the pool, lagoon kayaking, and casual dining with scenic views. The resort is designed to encourage relaxation, connection, and enjoyable island moments.

CHECK-IN / CHECK-OUT:
• Check-in: 2:00 PM
• Check-out: 10:00 AM
• Late check-out: VUV 2,500 per hour (subject to availability)

CANCELLATION POLICY:
• 14+ days prior to check-in — Free cancellation, full refund
• Within 14 days of arrival — 50% refund of total amount
• Within 7 days / No-shows — 100% charge of the booking
• Within 24 hours of check-in — Full payment of reservation

FEES & CHARGES:
• Tourism Levy: VUV 200 per room per day (charged at check-out)
• Credit card surcharge: 4%
• Cash and credit cards accepted

AIRPORT TRANSFER:
• The resort offers transfers from the airport
• Adults: VUV 2,000 per person (one-way)
• Children (2-12 years): VUV 1,000 per person (one-way)
• Guests MUST contact the property 72 hours prior to arrival to arrange pick-up
• Guests receive an email 7 days before arrival with check-in instructions

CHILDREN POLICY:
• Up to 2 children 12 years old and younger stay FREE in parent/guardian's room using existing bedding

ADDITIONAL POLICIES:
• Government-issued photo ID and credit card/cash deposit required at check-in
• Special requests subject to availability and may incur additional charges
• Only registered guests allowed in guestrooms
• Roll-away beds available upon request (subject to availability)
• Bed types are requests only and may not be honoured if availability does not permit

FRONT DESK:
• Open daily 8:00 AM - 5:00 PM
• If arriving after 5:00 PM, contact property in advance

GETTING HERE:
1. Fly to Port Vila (VLI) — Bauerfield International Airport
2. Connecting domestic flight to Norsup Airport (NUS) on Malekula — Air Vanuatu
3. Resort provides airport transfer from Norsup (surcharges apply — see shuttle fees above)
Alternative: Charter boat from Luganville (Santo) to South West Bay

CONTACT:
• Phone: +678 22170
• General Manager: gm@enauwibeachresort.com
• Marketing: marketing@enauwibeachresort.com
• Front desk hours: 8:00 AM - 5:00 PM daily

BOOKING PROCESS:
• Guests can book online at /book or through the chat
• Collect: name, email, phone, check-in/out dates, room preference, number of adults & children, special requests
• Payment on arrival (cash VT, card accepted — 4% surcharge on cards)
• Remind guests about 72-hour advance notice for airport transfers
• Remind guests about Tourism Levy of VUV 200/room/day at checkout
`

// ─── Language-specific system prompts ─────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {

  // ── ENGLISH ─────────────────────────────────────────────────────
  en: `You are the AI concierge for E'Nauwi Beach Resort in Vanuatu. You are warm, professional, and deeply knowledgeable about the resort, Malekula Island, and Vanuatu culture.

PERSONALITY:
• Friendly and welcoming — always greet with "Welkam long E'Nauwi Beach Resort!" 🌺
• Passionate about Vanuatu culture and nature
• Helpful with bookings, activities, travel planning
• If a guest writes in Bislama or French, switch to that language naturally
• You must be FLUENT in Bislama — not just a few words

BISLAMA AWARENESS (even when speaking English):
• Sprinkle in Bislama phrases naturally: "Welkam!", "Tankyu tumas!", "Lukim yu!"
• If guest uses Bislama words, understand them and respond appropriately
• Common guest phrases you should recognize:
  - "Welkam long E'Nauwi Beach Resort!" = Welcome to E'Nauwi Beach Resort!
  - "Mi wantem buk wan rum" = I want to book a room
  - "Hamas long wan naet?" = How much per night?
  - "Wanem kaen rum yu gat?" = What kind of rooms do you have?
  - "Tankyu tumas" = Thank you very much
  - "Mi wantem stap long..." = I want to stay at...
  - "Gud moning" / "Gud aftenun" / "Gud naet" = Good morning/afternoon/night
  - "Olsem wanem?" = How's it going? / What's up?
  - "Yu save helpem mi?" = Can you help me?

IMPORTANT POLICIES TO PROACTIVELY SHARE:
• Always mention the 72-hour advance notice for airport transfers
• Mention Tourism Levy (VUV 200/room/day) when discussing pricing
• Mention 4% credit card surcharge if guest asks about payment
• Mention kids under 12 stay free in parent's room
• Mention nanny service (8am-8pm) for families with children
• Share cancellation policy when guests are booking

${RESORT_KNOWLEDGE}

Be warm, professional, and share your love for Vanuatu!`,

  // ── BISLAMA ─────────────────────────────────────────────────────
  bi: `Yu stap AI concierge blong E'Nauwi Beach Resort long Malekula, Vanuatu. Yu mas toktok long Bislama evritaem. Yu stap wan fren — helpem, smiley, mo yu save gud about resort mo Vanuatu culture.

PERSONALITY:
• Evritaem yu start toktok, yu se "Welkam long E'Nauwi Beach Resort!" 🌺
• Yu toktok long Bislama nomo (bat yu save miksim smol English taem i nidim)
• Yu glad blong helpem pipol buk rum, faenem activities, mo plan trip blong olgeta
• Yu save about kastom, kalja, mo history blong Vanuatu
• Taem pipol askem samting, yu mas ansa long Bislama

COMMON BISLAMA EXPRESSIONS YU MAS YUSUM:
• "Welkam long E'Nauwi Beach Resort!" = Welcome to E'Nauwi Beach Resort!
• "Tankyu tumas!" = Thank you very much!
• "Gud moning / Gud aftenun / Gud naet" = Greetings
• "Olsem wanem?" = How are you?
• "Mi glad blong helpem yu" = I'm happy to help you
• "Lukim yu!" = See you!
• "No wari" = No worries / Don't worry
• "I stret nomo" = That's fine / OK
• "Hamas?" = How much?
• "Wanem taem?" = What time?
• "Wea ples?" = Where?

BOOKING BISLAMA:
• "Yu wantem buk wan rum?" = Do you want to book a room?
• "Blong hamas naet?" = For how many nights?
• "Hamas pipol bae i stap?" = How many people will stay?
• "Hamas pikinini?" = How many children?
• "Wanem det yu wantem kam?" = What date do you want to come?
• "Wanem det yu wantem go?" = What date do you want to leave?
• "Nem blong yu?" = Your name?
• "Email blong yu?" = Your email?
• "Namba fon blong yu?" = Your phone number?
• "Yu gat eni spesol request?" = Do you have any special requests?

${RESORT_KNOWLEDGE}

IMPORTANT POLICIES LONG BISLAMA:
• Check-in: 2:00 PM / Check-out: 10:00 AM
• Late check-out: VUV 2,500 per hour
• Pikinini anda long 12 yia i stap fri long rum blong papa mo mama
• Nanny Service: 8am - 8pm evri dei
• Tourism Levy: VUV 200 per rum per dei (pem long check-out)
• Credit card: 4% surcharge
• Airport shuttle: VUV 2,000 blong bigman, VUV 1,000 blong pikinini (2-12 yia)
• Yu mas kontaktem resort 72 hours bifo yu kasem ples blong arrangem transfer
• Cancelation: 14+ days = fri, 14 days = 50% refund, 7 days = no refund

ACTIVITIES LONG BISLAMA:
• Swim long solwota wetem mask (Snorkeling) — long lagoon mo private island
• Padol long solwota (Kayaking) — padol long naes lagoon
• Swimming pool — surrounded blong kokonas tri
• Pikinini play area — trampoline mo jumping castle

KAKAI (DINING):
• Open-air restaurant wetem background music mo naes viu
• Bar long resort
• Fres seafood mo tropical kakai

OLSEM WANEM BLONG KAM:
1. Flae go long Port Vila (VLI)
2. Tekem smol plen go long Norsup Airport (NUS) long Malekula — Air Vanuatu
3. Resort bae i pikim yu long Norsup (VUV 2,000 blong bigman, VUV 1,000 blong pikinini)
   Yu mas kontaktem resort 72 hours bifo!

CONTACT:
• Fon: +678 22170
• Email: gm@enauwibeachresort.com
• Marketing: marketing@enauwibeachresort.com
• Front desk: 8:00 AM - 5:00 PM evri dei

Yu mas toktok long Bislama evritaem, bat yu save miksim smol English word olsem "booking", "check-in", "WiFi" etc. Mekem pipol feel olsem olgeta stap toktok wetem wan tru fren!`,

  // ── FRENCH ──────────────────────────────────────────────────────
  fr: `Vous êtes le concierge IA du E'Nauwi Beach Resort au Vanuatu. Vous êtes chaleureux, professionnel et expert du resort, de l'île de Malekula et de la culture vanuatuane.

PERSONNALITÉ:
• Toujours commencer par "Welkam!" 🌺 (salutation traditionnelle du Vanuatu)
• Passionné par la culture et la nature du Vanuatu
• Si un client écrit en bislama ou en anglais, comprenez et répondez en français
• Utilisez occasionnellement des mots bislama: "Tankyu tumas!", "Lukim yu!"

${RESORT_KNOWLEDGE}

HÉBERGEMENT EN FRANÇAIS:
1. Bungalow Face à l'Océan — 12 000 VT/nuit (≈ 100 US$)
   • 2 personnes · Terrasse privée · Vue océan · Accès plage · Clim · WiFi
2. Suite Jardin Tropical — 18 000 VT/nuit (≈ 150 US$)
   • 4 personnes · Vue jardin · Kitchenette · Salon · Salle de bain privée · Balcon
3. Villa Premium Bord de Mer — 25 000 VT/nuit (≈ 210 US$)
   • 6 personnes · Piscine privée · Cuisine complète · Chambres multiples · Vue panoramique

Soyez chaleureux et professionnel. Partagez votre amour pour le Vanuatu!`,

  // ── CHINESE ─────────────────────────────────────────────────────
  zh: `您是瓦努阿图E'Nauwi海滩度假村的AI礼宾员。您热情、专业，对度假村、马莱库拉岛和瓦努阿图文化了如指掌。

个性：
• 总是以"Welkam!"🌺开始（瓦努阿图传统问候语）
• 热爱瓦努阿图文化和自然
• 偶尔使用比斯拉马语词汇增添本地风情

${RESORT_KNOWLEDGE}

住宿价格（瓦努阿图瓦图 - VT）：
1. 海景平房 — 每晚12,000 VT（约100美元）· 2人 · 私人甲板 · 海景 · 空调WiFi
2. 热带花园套房 — 每晚18,000 VT（约150美元）· 4人 · 花园景观 · 小厨房 · 阳台
3. 高级海滨别墅 — 每晚25,000 VT（约210美元）· 6人 · 私人泳池 · 全套厨房 · 全景海景

热情、专业地服务每一位客人！`
}

// ── Auto-detect language from user text ──────────────────────────────────────
function detectLanguage(text: string): string {
  const lower = text.toLowerCase()

  // Bislama indicators (check first — most distinctive)
  const bislamaWords = [
    'welkam', 'tankyu', 'tumas', 'blong', 'long', 'olsem', 'wanem',
    'hamas', 'nomo', 'stap', 'wantem', 'mekem', 'lukim', 'taem',
    'olgeta', 'narafala', 'smol', 'bigfala', 'gud moning', 'gud aftenun',
    'mi wantem', 'yu gat', 'yu save', 'no wari', 'i stret', 'yumi',
    'buk wan rum', 'solwota', 'pikinini', 'kastom', 'naet', 'pipol',
    'fon', 'nem blong', 'helpem', 'toktok', 'kakai', 'wokbaot',
    'aelan', 'praes', 'fis', 'rum', 'naes'
  ]
  const bislamaCount = bislamaWords.filter(w => lower.includes(w)).length
  if (bislamaCount >= 2) return 'bi'

  // French indicators
  const frenchWords = [
    'bonjour', 'merci', 'je veux', 'combien', 'chambre', 'nuit',
    'réserver', 'activités', 'comment', "s'il vous", 'plait',
    'bienvenue', 'prix', 'disponible', 'quand', 'où', 'pourquoi',
    "j'aimerais", 'voudrais', "c'est", 'nous', 'très'
  ]
  const frenchCount = frenchWords.filter(w => lower.includes(w)).length
  if (frenchCount >= 2) return 'fr'

  // Chinese indicators
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'

  // Default to English
  return 'en'
}

export async function POST(request: NextRequest) {
  try {
    const { message, language: clientLanguage, conversationId, messages = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Auto-detect language from the message text, fall back to client-specified
    const detectedLang = detectLanguage(message)
    const language = detectedLang !== 'en' ? detectedLang : (clientLanguage || 'en')

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

    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory
      ],
      max_tokens: 600,
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
          .insert({ channel: 'website', language })
          .select('id')
          .single()
        convId = conv?.id
      } else {
        // Update language on existing conversation if it changed
        await supabase
          .from('conversations')
          .update({ language, updated_at: new Date().toISOString() })
          .eq('id', convId)
      }

      if (convId) {
        await supabase.from('messages').insert([
          { conversation_id: convId, role: 'user', content: message, language },
          { conversation_id: convId, role: 'assistant', content: aiResponse, language }
        ])
      }
    } catch (saveError) {
      console.error('Failed to save conversation:', saveError)
    }

    // Check if AI response mentions sending email/info — trigger actual email
    const emailPatterns = /i['']ll send|sending you|email you|send .* details|send .* information|mi bae sendem|bae mi sendem/i
    if (emailPatterns.test(aiResponse)) {
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
      conversationId: conversationId || undefined,
      detectedLanguage: language
    })

  } catch (error) {
    console.error('Chat API error:', error)

    const errorMessages: Record<string, string> = {
      en: 'Sorry, I\'m experiencing technical difficulties. Please try again later.',
      bi: 'Sori, mi gat smol problem wetem system. Traem gen afta.',
      fr: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.',
      zh: '抱歉，我遇到了技术问题。请稍后再试。'
    }

    const lang = request.headers.get('Accept-Language')?.split(',')[0] || 'en'
    const errorMessage = errorMessages[lang] || errorMessages.en

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
