import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const RESORT_CONTEXT = `E'Nauwi Beach Resort is a family-friendly resort on Efate Island, Vanuatu (South Pacific). \
Features: beachfront bungalows (each uniquely named), a calm lagoon, swimming pool, kayaks, snorkelling on pristine reef, \
occasional rare dugong sightings, sunset cruises, island hopping, a bar & restaurant, and warm Melanesian hospitality. \
The nearest town is Port Vila (Vanuatu's capital, served by Bauerfield International Airport). \
Website: www.enauwibeachresort.org, phone +678 22170.`

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Asks the AI for one new article idea that doesn't overlap any existing title.
async function proposeNewTopic(existingTitles: string[]): Promise<{ title: string; keyword: string }> {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You plan SEO content for a Vanuatu beach resort travel blog.' },
      {
        role: 'user',
        content: `Resort context: ${RESORT_CONTEXT}

Existing articles (do NOT repeat or closely overlap any of these topics or their search intent):
${existingTitles.map((t) => `- ${t}`).join('\n')}

Propose ONE new article that targets a different long-tail search travellers make when planning a trip to Efate or Vanuatu.
Return JSON: {"title": "...", "keyword": "..."}`,
      },
    ],
    temperature: 0.9,
  })
  const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as { title?: string; keyword?: string }
  if (!parsed.title || !parsed.keyword) throw new Error('AI did not return a usable topic')
  return { title: parsed.title, keyword: parsed.keyword }
}

// Real resort photos the auto-writer drops into each article.
const RESORT_IMAGES = [
  '/images/resort/beach-resort-overview.jpg',
  '/images/resort/hero-resort-lagoon.jpg',
  '/images/resort/private-island-sandbar.jpg',
  '/images/resort/lagoon-island-view.jpg',
  '/images/resort/resort-coral-reef.jpg',
  '/images/new/kayak-snorkeling.jpg',
  '/images/resort/beach-kayaks-cove.jpg',
  '/images/resort/resort-lagoon-kayak.jpg',
  '/images/resort/resort-buildings-aerial.jpg',
  '/images/resort/resort-lagoon-aerial.jpg',
  '/images/pool.jpg',
  '/images/resort/wedding-beach-couple.jpg',
]

// Insert 3 distinct resort photos spread through the article body; returns
// { content, cover }.
function addImages(body: string, title: string, seed: number): { content: string; cover: string } {
  const pool = [...RESORT_IMAGES]
  // deterministic-ish shuffle by seed so consecutive articles vary
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (seed * (i + 7)) % (i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const chosen = pool.slice(0, 3) // [0] = hero cover, [1] & [2] = in-body
  const alt = `${title} — E'Nauwi Beach Resort, Efate Vanuatu`
  const blocks = body.replace(/^#\s.*\n+/, '').split(/\n\n+/)
  const bodyImgs = [chosen[1], chosen[2]]
  const positions = Array.from(new Set([1, Math.floor(blocks.length * 0.6)]))
    .filter((p) => p > 0 && p <= blocks.length)
    .slice(0, 2)
  for (let k = positions.length - 1; k >= 0; k--) {
    blocks.splice(positions[k], 0, `![${alt}](${bodyImgs[k]})`)
  }
  return { content: blocks.join('\n\n'), cover: chosen[0] }
}

// Generates one SEO article with OpenAI (grounded in real resort facts) and
// publishes it. Used by the weekly cron and the admin "Generate now" button.
export async function generateAndPublishArticle(): Promise<{ slug: string; title: string }> {
  // Pick the next unused topic that doesn't repeat an existing article. When the
  // backlog runs out, ask the AI for a fresh topic instead of recycling old ones
  // (recycling published near-duplicate articles that compete with each other).
  const { data: posts } = await supabaseAdmin.from('blog_posts').select('title, keywords')
  const existingTitles = (posts || []).map((p) => String(p.title))
  const existingKeywords = new Set((posts || []).map((p) => normalise(String(p.keywords || ''))).filter(Boolean))

  const { data: backlog } = await supabaseAdmin
    .from('blog_topics')
    .select('*')
    .eq('used', false)
    .order('created_at', { ascending: true })
  let topic: { id?: string; title: string; keyword: string } | null = null
  for (const t of backlog || []) {
    if (existingKeywords.has(normalise(String(t.keyword || '')))) {
      await supabaseAdmin.from('blog_topics').update({ used: true }).eq('id', t.id)
      continue
    }
    topic = t
    break
  }
  if (!topic) topic = await proposeNewTopic(existingTitles)

  const title: string = topic.title
  const keyword: string = topic.keyword

  const prompt = `Write a helpful, engaging SEO blog article for a beach resort's travel blog.
Title: "${title}"
Target keyword: "${keyword}"
Resort context (weave in naturally, do not over-promote): ${RESORT_CONTEXT}

Requirements:
- 600-900 words, warm and informative, for travellers planning a Vanuatu trip.
- Markdown: a short intro paragraph (NO H1 title), then 3-5 "## " section headings, with bullet lists where useful.
- Accurate — do NOT invent specific prices, flight times, or distances.
- End with a short call-to-action mentioning E'Nauwi Beach Resort with the link [book your stay](/book).
Return ONLY the article body in Markdown.`

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert travel writer and SEO specialist for a Vanuatu beach resort.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1800,
  })

  const rawContent = completion.choices[0]?.message?.content?.trim() || ''
  if (!rawContent) throw new Error('Empty AI response')

  const firstPara =
    rawContent
      .replace(/^#.*$/gm, '')
      .replace(/[#*_>`-]/g, '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)[0] || ''
  const excerpt = firstPara.slice(0, 180)
  const metaDescription = firstPara.slice(0, 155)

  // Add real resort photos to the article
  const { content, cover } = addImages(rawContent, title, Date.now() % 100000)

  let slug = slugify(title)
  const { data: existing } = await supabaseAdmin.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${String(Date.now()).slice(-5)}`

  const { error } = await supabaseAdmin.from('blog_posts').insert({
    slug,
    title,
    excerpt,
    meta_description: metaDescription,
    content,
    cover_image: cover,
    keywords: keyword,
    status: 'published',
    ai_generated: true,
    published_at: new Date().toISOString(),
  })
  if (error) throw error

  if (topic.id) await supabaseAdmin.from('blog_topics').update({ used: true }).eq('id', topic.id)

  return { slug, title }
}
