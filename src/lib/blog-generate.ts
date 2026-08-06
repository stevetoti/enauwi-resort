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

// Generates one SEO article with OpenAI (grounded in real resort facts) and
// publishes it. Used by the weekly cron and the admin "Generate now" button.
export async function generateAndPublishArticle(): Promise<{ slug: string; title: string }> {
  // Pick an unused topic; if the backlog is exhausted, recycle it.
  let { data: topics } = await supabaseAdmin.from('blog_topics').select('*').eq('used', false).limit(1)
  if (!topics || topics.length === 0) {
    await supabaseAdmin.from('blog_topics').update({ used: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    ;({ data: topics } = await supabaseAdmin.from('blog_topics').select('*').eq('used', false).limit(1))
  }
  const topic = topics?.[0]
  const title: string = topic?.title || 'Discover Vanuatu — Island Travel Tips'
  const keyword: string = topic?.keyword || 'Vanuatu travel'

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

  const content = completion.choices[0]?.message?.content?.trim() || ''
  if (!content) throw new Error('Empty AI response')

  const firstPara =
    content
      .replace(/^#.*$/gm, '')
      .replace(/[#*_>`-]/g, '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)[0] || ''
  const excerpt = firstPara.slice(0, 180)
  const metaDescription = firstPara.slice(0, 155)

  let slug = slugify(title)
  const { data: existing } = await supabaseAdmin.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${String(Date.now()).slice(-5)}`

  const { error } = await supabaseAdmin.from('blog_posts').insert({
    slug,
    title,
    excerpt,
    meta_description: metaDescription,
    content,
    keywords: keyword,
    status: 'published',
    ai_generated: true,
    published_at: new Date().toISOString(),
  })
  if (error) throw error

  if (topic?.id) await supabaseAdmin.from('blog_topics').update({ used: true }).eq('id', topic.id)

  return { slug, title }
}
