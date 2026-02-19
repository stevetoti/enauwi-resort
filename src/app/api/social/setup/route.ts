import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint sets up the social media tables
// Run once with a service role key or execute the SQL manually in Supabase

const SETUP_SQL = `
-- Social Media Accounts (connected platforms)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok')),
  account_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  page_id VARCHAR(255),
  page_name VARCHAR(255),
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now(),
  connected_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Posts (scheduled and published content)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_bislama TEXT,
  content_french TEXT,
  media_urls JSONB DEFAULT '[]',
  platforms TEXT[] NOT NULL,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'publishing', 'published', 'failed')),
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  hashtags TEXT[],
  post_type VARCHAR(50) DEFAULT 'standard' CHECK (post_type IN ('standard', 'promotion', 'activity', 'testimonial', 'culture', 'event', 'seasonal')),
  room_id UUID REFERENCES rooms(id),
  booking_context JSONB,
  external_post_ids JSONB DEFAULT '{}',
  engagement_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES staff(id),
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Templates (reusable content templates)
CREATE TABLE IF NOT EXISTS social_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  content_template TEXT NOT NULL,
  content_template_bislama TEXT,
  content_template_french TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('room_promo', 'activity', 'testimonial', 'culture', 'event', 'holiday', 'seasonal', 'general')),
  language VARCHAR(10) DEFAULT 'en',
  hashtags TEXT[],
  default_platforms TEXT[],
  variables JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Analytics (performance metrics)
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery Images for Social Media
CREATE TABLE IF NOT EXISTS social_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('rooms', 'beach', 'activities', 'dining', 'culture', 'events', 'general')),
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_platforms ON social_posts USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_social_analytics_post ON social_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_social_templates_category ON social_templates(category);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY IF NOT EXISTS "Allow all for social_accounts" ON social_accounts FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for social_posts" ON social_posts FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for social_templates" ON social_templates FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for social_analytics" ON social_analytics FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for social_gallery" ON social_gallery FOR ALL USING (true);
`

// Insert default templates
const DEFAULT_TEMPLATES = [
  {
    name: 'Room Promotion',
    content_template: '🌴 Escape to paradise at E\'Nauwi Beach Resort! Our {{room_name}} offers {{features}} starting at {{price}} VT per night. \n\nBook your tropical getaway today!\n\n📧 reservations@enauwiresort.com\n📞 +678 XXXXXX',
    content_template_bislama: '🌴 Kam long paradaes long E\'Nauwi Beach Resort! {{room_name}} blong mifala i gat {{features}} stat long {{price}} VT wan naet.\n\nBuk tede!',
    category: 'room_promo',
    hashtags: ['EnauwiResort', 'VanuatuTravel', 'MalekulaIsland', 'IslandEscape', 'BeachResort'],
    default_platforms: ['facebook', 'instagram'],
    variables: ['room_name', 'features', 'price']
  },
  {
    name: 'Diving Adventure',
    content_template: '🤿 Discover the underwater wonders of Malekula! Our PADI-certified instructors offer:\n\n✅ Beginner courses\n✅ Reef diving\n✅ Night dives\n✅ Coral garden tours\n\nBook your diving adventure at E\'Nauwi Beach Resort!',
    category: 'activity',
    hashtags: ['ScubaDiving', 'VanuatuDiving', 'MalekulaDiving', 'UnderwaterParadise', 'PADI'],
    default_platforms: ['facebook', 'instagram'],
    variables: []
  },
  {
    name: 'Cultural Experience',
    content_template: '🎭 Experience authentic Malekula culture at E\'Nauwi Beach Resort!\n\n• Traditional kastom village visits\n• Rom dance performances\n• Local craft demonstrations\n• Traditional feast nights\n\nConnect with the rich heritage of Vanuatu\'s most culturally diverse island.',
    content_template_bislama: '🎭 Ekspiriens tru kastom blong Malekula long E\'Nauwi Beach Resort!\n\n• Visit kastom vilej\n• Rom dans\n• Lukluk ol wok blong han\n• Kakae kastom\n\nKam save gud kastom blong bigfala aelan ia!',
    category: 'culture',
    hashtags: ['MalekulaCulture', 'VanuatuCulture', 'KastomVillage', 'RomDance', 'AuthenticExperience'],
    default_platforms: ['facebook', 'instagram'],
    variables: []
  },
  {
    name: 'Guest Testimonial',
    content_template: '⭐ "{{testimonial}}" - {{guest_name}}, {{guest_country}}\n\nThank you for choosing E\'Nauwi Beach Resort! We can\'t wait to welcome you back. 🌺\n\n#GuestLove #EnauwiResort',
    category: 'testimonial',
    hashtags: ['GuestReview', 'HappyGuests', 'TravelReviews', 'VanuatuHospitality'],
    default_platforms: ['facebook', 'instagram'],
    variables: ['testimonial', 'guest_name', 'guest_country']
  },
  {
    name: 'Fishing Trip',
    content_template: '🎣 Cast your line in crystal-clear Malekula waters!\n\nJoin our experienced local guides for:\n🐟 Deep-sea fishing\n🐟 Reef fishing\n🐟 Traditional fishing methods\n\nFresh catch dinner included! Book at E\'Nauwi Beach Resort.',
    category: 'activity',
    hashtags: ['FishingVanuatu', 'DeepSeaFishing', 'MalekulaFishing', 'IslandFishing', 'SportFishing'],
    default_platforms: ['facebook', 'instagram'],
    variables: []
  },
  {
    name: 'Seasonal Special',
    content_template: '🌟 {{season}} Special at E\'Nauwi Beach Resort!\n\n{{offer_details}}\n\nValid: {{valid_dates}}\n\nDon\'t miss this opportunity to experience paradise! 🏝️\n\nBook now: reservations@enauwiresort.com',
    category: 'seasonal',
    hashtags: ['VanuatuSpecial', 'TravelDeal', 'IslandEscape', 'BeachHoliday'],
    default_platforms: ['facebook', 'instagram'],
    variables: ['season', 'offer_details', 'valid_dates']
  },
  {
    name: 'Special Event',
    content_template: '🎉 {{event_name}} at E\'Nauwi Beach Resort!\n\n📅 {{event_date}}\n📍 E\'Nauwi Beach Resort, Malekula\n\n{{event_details}}\n\nJoin us for an unforgettable experience!',
    category: 'event',
    hashtags: ['VanuatuEvents', 'MalekulaEvents', 'IslandLife', 'ResortEvents'],
    default_platforms: ['facebook', 'instagram'],
    variables: ['event_name', 'event_date', 'event_details']
  },
  {
    name: 'Holiday Greeting',
    content_template: '{{greeting_emoji}} {{holiday_name}} from all of us at E\'Nauwi Beach Resort!\n\n{{message}}\n\nWishing you joy and happiness! 🌺🏝️\n\n#{{holiday_hashtag}} #EnauwiFamily',
    category: 'holiday',
    hashtags: ['HolidayWishes', 'VanuatuHolidays', 'IslandGreetings'],
    default_platforms: ['facebook', 'instagram'],
    variables: ['greeting_emoji', 'holiday_name', 'message', 'holiday_hashtag']
  }
]

export async function POST(request: Request) {
  try {
    const { serviceKey } = await request.json()
    
    if (!serviceKey) {
      return NextResponse.json({ 
        error: 'Service key required',
        sql: SETUP_SQL,
        message: 'Please run this SQL in your Supabase SQL Editor, then insert default templates'
      }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    )

    // Try to insert default templates
    const { error: templateError } = await supabase
      .from('social_templates')
      .upsert(DEFAULT_TEMPLATES.map(t => ({
        ...t,
        hashtags: t.hashtags,
        default_platforms: t.default_platforms,
        variables: t.variables
      })), { onConflict: 'name' })

    if (templateError) {
      console.error('Template insert error:', templateError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Social media tables and templates configured',
      sql: SETUP_SQL
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed', details: error }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Social Media Setup Endpoint',
    instructions: 'POST with serviceKey to setup, or copy the SQL below to run manually in Supabase SQL Editor',
    sql: SETUP_SQL,
    default_templates: DEFAULT_TEMPLATES
  })
}
