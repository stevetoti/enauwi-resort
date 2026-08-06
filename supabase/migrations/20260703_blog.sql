-- Blog / auto-published SEO articles.
-- Run once in the Supabase SQL editor before the blog goes live.

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  meta_description TEXT,
  content TEXT NOT NULL DEFAULT '',           -- markdown
  cover_image TEXT,
  keywords TEXT,
  status TEXT NOT NULL DEFAULT 'published',    -- published | draft
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  author TEXT NOT NULL DEFAULT 'E''Nauwi Beach Resort',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_pub ON blog_posts(status, published_at DESC);

-- Topic backlog the auto-generator draws from
CREATE TABLE IF NOT EXISTS blog_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  keyword TEXT,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;
CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "blog_posts_service_all" ON blog_posts;
CREATE POLICY "blog_posts_service_all" ON blog_posts FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "blog_topics_service_all" ON blog_topics;
CREATE POLICY "blog_topics_service_all" ON blog_topics FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Seed the ongoing topic backlog for the auto-generator
INSERT INTO blog_topics (title, keyword) VALUES
  ('Top Things to Do in Efate, Vanuatu', 'things to do Efate Vanuatu'),
  ('A Guide to Vanuatu''s Marine Life & Coral Reefs', 'Vanuatu marine life'),
  ('Planning a Family Holiday in Vanuatu', 'Vanuatu family holiday'),
  ('The Best Time of Year to Visit Efate', 'best time to visit Efate'),
  ('Traditional Vanuatu Food You Have to Try', 'Vanuatu food'),
  ('A First-Timer''s Guide to Port Vila', 'Port Vila guide'),
  ('Romantic Getaways in Vanuatu for Couples', 'Vanuatu romantic getaway'),
  ('Snorkelling & Diving Spots Around Efate', 'Efate snorkelling diving'),
  ('How to Spend a Week in Vanuatu', 'one week Vanuatu itinerary'),
  ('Why E''Nauwi Beach Resort is Perfect for Your Island Escape', 'E''Nauwi Beach Resort')
ON CONFLICT DO NOTHING;
