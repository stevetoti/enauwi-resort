-- Website Content Management Table
CREATE TABLE IF NOT EXISTS website_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  current_image_url TEXT,
  image_dimensions VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES staff(id)
);

-- SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_search_console_connected BOOLEAN DEFAULT FALSE,
  google_analytics_connected BOOLEAN DEFAULT FALSE,
  gsc_property_url TEXT,
  ga_property_id TEXT,
  meta_title TEXT DEFAULT 'E''Nauwi Beach Resort | Beachfront Paradise in Vanuatu',
  meta_description TEXT DEFAULT 'Experience the perfect island getaway at E''Nauwi Beach Resort on Efate Island, Vanuatu. Beachfront bungalows, swimming pool, and warm hospitality.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for website content images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-content', 'website-content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to website-content bucket
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'website-content');

-- Allow authenticated uploads to website-content bucket
CREATE POLICY "Admin upload access" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'website-content');

CREATE POLICY "Admin update access" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'website-content');

CREATE POLICY "Admin delete access" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'website-content');

-- Seed website content entries
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url) VALUES
  ('hero_image', 'Hero Background Image', 'The main aerial image shown on the homepage hero section', 'Homepage > Hero Section', '1920x1080 recommended', '/images/hero-aerial.jpg'),
  ('pool_image', 'Swimming Pool', 'Image for the Swimming Pool activity card', 'Activities > Swimming Pool card', '800x600 recommended', '/images/pool.jpg'),
  ('kayaking_image', 'Kayaking & Snorkeling', 'Image for kayaking and snorkeling activities', 'Activities > Kayaking card', '800x600 recommended', '/images/new/kayak-snorkeling.jpg'),
  ('restaurant_image', 'Restaurant', 'Image showing the restaurant area', 'Activities > Restaurant card', '800x600 recommended', '/images/new/restaurant-seafood.jpg'),
  ('bar_image', 'Bar', 'Image showing the bar area with cocktails', 'Activities > Bar card', '800x600 recommended', '/images/new/bar-cocktails.jpg'),
  ('kids_club_image', 'Kids Club', 'Image for the Kids Club activity area', 'Activities > Kids Club card', '800x600 recommended', '/images/resort/lagoon-island-view-sm.jpg'),
  ('celebrations_image', 'Birthday Celebrations', 'Image for birthday celebration promotions', 'Activities > Celebrations card', '800x600 recommended', '/images/resort/private-island-sandbar-sm.jpg'),
  ('og_image', 'Social Media Preview Image', 'Image shown when sharing links on social media (Facebook, Twitter, etc.)', 'SEO > Open Graph', '1200x630 required', '/og-image.jpg'),
  ('logo', 'Site Logo', 'Main resort logo displayed in navbar and footer', 'Global > Header & Footer', '400x100 recommended', '/logo-enauwi.png'),
  ('favicon', 'Favicon', 'Browser tab icon', 'Global > Browser Tab', '32x32 or 512x512', '/favicon.ico')
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  image_dimensions = EXCLUDED.image_dimensions;

-- Seed initial SEO settings (only insert if empty)
INSERT INTO seo_settings (id, meta_title, meta_description) 
SELECT gen_random_uuid(), 'E''Nauwi Beach Resort | Beachfront Paradise in Vanuatu', 'Experience the perfect island getaway at E''Nauwi Beach Resort on Efate Island, Vanuatu. Beachfront bungalows, swimming pool, and warm hospitality.'
WHERE NOT EXISTS (SELECT 1 FROM seo_settings);
