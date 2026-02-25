-- Expand website_content table with category field
ALTER TABLE website_content ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_website_content_category ON website_content(category);

-- Clear existing content and reseed with ALL images
TRUNCATE website_content;

-- ================== HERO / MAIN IMAGES ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('hero_image', 'Hero Background Image', 'The main aerial image shown on the homepage hero section', 'Homepage > Hero Section', '1920x1080 recommended', '/images/hero-aerial.jpg', 'Hero'),
  ('og_image', 'Social Media Preview Image', 'Image shown when sharing links on social media', 'SEO > Open Graph', '1200x630 required', '/images/og-image.jpg', 'Hero'),
  ('logo', 'Site Logo', 'Main resort logo displayed in navbar and footer', 'Global > Header & Footer', '400x100 recommended', '/logo-enauwi.png', 'Hero'),
  ('favicon', 'Favicon', 'Browser tab icon', 'Global > Browser Tab', '32x32 or 512x512', '/favicon.ico', 'Hero');

-- ================== ACTIVITIES ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('pool_image', 'Swimming Pool', 'Image for the Swimming Pool activity card', 'Activities > Swimming Pool', '800x600 recommended', '/images/pool.jpg', 'Activities'),
  ('kayaking_image', 'Kayaking & Snorkeling', 'Image for kayaking and snorkeling activities', 'Activities > Kayaking', '800x600 recommended', '/images/new/kayak-snorkeling.jpg', 'Activities'),
  ('restaurant_image', 'Restaurant', 'Image showing the restaurant area', 'Activities > Restaurant', '800x600 recommended', '/images/new/restaurant-seafood.jpg', 'Activities'),
  ('bar_image', 'Bar', 'Image showing the bar area with cocktails', 'Activities > Bar', '800x600 recommended', '/images/new/bar-cocktails.jpg', 'Activities'),
  ('kids_club_image', 'Kids Club', 'Image for the Kids Club activity area', 'Activities > Kids Club', '800x600 recommended', '/images/resort/lagoon-island-view-sm.jpg', 'Activities'),
  ('celebrations_image', 'Birthday Celebrations', 'Image for birthday celebration promotions', 'Activities > Celebrations', '800x600 recommended', '/images/resort/private-island-sandbar-sm.jpg', 'Activities');

-- ================== RESORT GENERAL ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('resort_lagoon_aerial', 'Resort Lagoon Aerial', 'Aerial view of resort lagoon', 'Gallery / Resort Overview', '1920x1080', '/images/resort/resort-lagoon-aerial.jpg', 'Resort'),
  ('resort_lagoon_aerial_sm', 'Resort Lagoon Aerial (Small)', 'Small aerial view of resort lagoon', 'Gallery / Cards', '800x600', '/images/resort/resort-lagoon-aerial-sm.jpg', 'Resort'),
  ('resort_buildings_aerial', 'Resort Buildings Aerial', 'Aerial view of resort buildings', 'Gallery / Resort Overview', '1920x1080', '/images/resort/resort-buildings-aerial.jpg', 'Resort'),
  ('resort_buildings_aerial_sm', 'Resort Buildings Aerial (Small)', 'Small aerial view of resort buildings', 'Gallery / Cards', '800x600', '/images/resort/resort-buildings-aerial-sm.jpg', 'Resort'),
  ('resort_lagoon_kayak', 'Resort Lagoon Kayak', 'Kayaking on resort lagoon', 'Activities / Gallery', '1920x1080', '/images/resort/resort-lagoon-kayak.jpg', 'Resort'),
  ('resort_lagoon_kayak_sm', 'Resort Lagoon Kayak (Small)', 'Small kayaking on resort lagoon', 'Cards', '800x600', '/images/resort/resort-lagoon-kayak-sm.jpg', 'Resort'),
  ('resort_coral_reef', 'Resort Coral Reef', 'Underwater coral reef view', 'Activities / Snorkeling', '1920x1080', '/images/resort/resort-coral-reef.jpg', 'Resort'),
  ('resort_coral_reef_sm', 'Resort Coral Reef (Small)', 'Small coral reef view', 'Cards', '800x600', '/images/resort/resort-coral-reef-sm.jpg', 'Resort'),
  ('beach_resort_overview', 'Beach Resort Overview', 'Beach and resort overview', 'Homepage / Gallery', '1920x1080', '/images/resort/beach-resort-overview.jpg', 'Resort'),
  ('beach_resort_overview_sm', 'Beach Resort Overview (Small)', 'Small beach overview', 'Cards', '800x600', '/images/resort/beach-resort-overview-sm.jpg', 'Resort'),
  ('lagoon_island_view', 'Lagoon Island View', 'View of lagoon and islands', 'Gallery', '1920x1080', '/images/resort/lagoon-island-view.jpg', 'Resort'),
  ('lagoon_island_view_sm', 'Lagoon Island View (Small)', 'Small lagoon view', 'Cards', '800x600', '/images/resort/lagoon-island-view-sm.jpg', 'Resort'),
  ('private_island_sandbar', 'Private Island Sandbar', 'Private island sandbar view', 'Gallery / Activities', '1920x1080', '/images/resort/private-island-sandbar.jpg', 'Resort'),
  ('private_island_sandbar_sm', 'Private Island Sandbar (Small)', 'Small sandbar view', 'Cards', '800x600', '/images/resort/private-island-sandbar-sm.jpg', 'Resort'),
  ('beach_kayaks_cove', 'Beach Kayaks Cove', 'Kayaks at beach cove', 'Activities / Gallery', '1920x1080', '/images/resort/beach-kayaks-cove.jpg', 'Resort'),
  ('beach_kayaks_cove_sm', 'Beach Kayaks Cove (Small)', 'Small kayaks cove', 'Cards', '800x600', '/images/resort/beach-kayaks-cove-sm.jpg', 'Resort'),
  ('hero_resort_lagoon', 'Hero Resort Lagoon', 'Hero lagoon image', 'Homepage alternative', '1920x1080', '/images/resort/hero-resort-lagoon.jpg', 'Resort');

-- ================== WEDDING ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('wedding_beach_couple', 'Wedding Beach Couple', 'Wedding couple on beach', 'Weddings Page / Gallery', '1920x1080', '/images/resort/wedding-beach-couple.jpg', 'Wedding'),
  ('wedding_beach_couple_sm', 'Wedding Beach Couple (Small)', 'Small wedding image', 'Cards', '800x600', '/images/resort/wedding-beach-couple-sm.jpg', 'Wedding');

-- ================== MALILI ROOMS ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('malili_living_room_1', 'Malili Living Room 1', 'Living room view 1', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-1-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_2', 'Malili Living Room 2', 'Living room view 2', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-2-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_3', 'Malili Living Room 3', 'Living room view 3', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-3-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_4', 'Malili Living Room 4', 'Living room view 4', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-4-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_5', 'Malili Living Room 5', 'Living room view 5', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-5-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_6', 'Malili Living Room 6', 'Living room view 6', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-6-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_7', 'Malili Living Room 7', 'Living room view 7', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-7-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_8', 'Malili Living Room 8', 'Living room view 8', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-8-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_room_9', 'Malili Living Room 9', 'Living room view 9', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-room-9-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_lagoon_view', 'Malili Living Lagoon View', 'Living room lagoon view', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_living_kitchenette', 'Malili Living Kitchenette', 'Kitchenette area', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/living-kitchenette-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bedroom_1', 'Malili Bedroom 1', 'Bedroom view 1', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bedroom-1-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bedroom_2', 'Malili Bedroom 2', 'Bedroom view 2', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bedroom-2-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_queen_bed', 'Malili Queen Bed', 'Queen bed view', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/queen-bed-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_queen_bed_2', 'Malili Queen Bed 2', 'Queen bed view 2', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/queen-bed-2-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_queen_bed_3', 'Malili Queen Bed 3', 'Queen bed view 3', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/queen-bed-3-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_queen_bed_artistic', 'Malili Queen Bed Artistic', 'Artistic queen bed shot', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_twin_bedroom_3', 'Malili Twin Bedroom', 'Twin bedroom view', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/twin-bedroom-3-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bathroom_full', 'Malili Bathroom Full', 'Full bathroom view', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bathroom_toiletries', 'Malili Bathroom Toiletries', 'Bathroom toiletries', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bathroom-toiletries-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_welcome_table_1', 'Malili Welcome Table 1', 'Welcome table setup 1', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/welcome-table-1-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_welcome_table_2', 'Malili Welcome Table 2', 'Welcome table setup 2', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/welcome-table-2-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_welcome_table_3', 'Malili Welcome Table 3', 'Welcome table setup 3', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/welcome-table-3-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_welcome_nawimba', 'Malili Welcome Nawimba', 'Nawimba welcome drink', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/welcome-nawimba-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_welcome_sofa_view', 'Malili Welcome Sofa View', 'Sofa view welcome', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/welcome-sofa-view-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_tea_coffee_station', 'Malili Tea Coffee Station', 'Tea and coffee station', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/tea-coffee-station-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_amenities_tray', 'Malili Amenities Tray', 'Room amenities tray', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/amenities-tray-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_swan_towel_artistic', 'Malili Swan Towel Artistic', 'Artistic swan towel', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/swan-towel-artistic-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_swan_towel_closeup', 'Malili Swan Towel Closeup', 'Swan towel closeup', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/swan-towel-closeup-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bamboo_lamp_detail', 'Malili Bamboo Lamp Detail', 'Bamboo lamp detail', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bamboo-lamp-detail-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_furniture_detail', 'Malili Furniture Detail', 'Furniture detail shot', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/furniture-detail-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bungalow_patio_1', 'Malili Bungalow Patio 1', 'Bungalow patio view 1', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_bungalow_patio_2', 'Malili Bungalow Patio 2', 'Bungalow patio view 2', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/bungalow-patio-2-opt-pro.jpg', 'Rooms - Malili'),
  ('malili_beach_kayaks', 'Malili Beach Kayaks', 'Beach kayaks near bungalow', 'Rooms > Malili', '1920x1080', '/images/resort/malili-rooms/beach-kayaks-opt-pro.jpg', 'Rooms - Malili');

-- ================== GALLERY - GROOVYBANANA PHOTOGRAPHY ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('gallery_groovybanana_1', 'Gallery Photo 1', 'GroovyBanana Photography 1', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-1.jpg', 'Gallery'),
  ('gallery_groovybanana_2', 'Gallery Photo 2', 'GroovyBanana Photography 2', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-2.jpg', 'Gallery'),
  ('gallery_groovybanana_3', 'Gallery Photo 3', 'GroovyBanana Photography 3', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-3.jpg', 'Gallery'),
  ('gallery_groovybanana_4', 'Gallery Photo 4', 'GroovyBanana Photography 4', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-4.jpg', 'Gallery'),
  ('gallery_groovybanana_5', 'Gallery Photo 5', 'GroovyBanana Photography 5', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-5.jpg', 'Gallery'),
  ('gallery_groovybanana_6', 'Gallery Photo 6', 'GroovyBanana Photography 6', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-6.jpg', 'Gallery'),
  ('gallery_groovybanana_7', 'Gallery Photo 7', 'GroovyBanana Photography 7', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-7.jpg', 'Gallery'),
  ('gallery_groovybanana_8', 'Gallery Photo 8', 'GroovyBanana Photography 8', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-8.jpg', 'Gallery'),
  ('gallery_groovybanana_9', 'Gallery Photo 9', 'GroovyBanana Photography 9', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-9.jpg', 'Gallery'),
  ('gallery_groovybanana_10', 'Gallery Photo 10', 'GroovyBanana Photography 10', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-10.jpg', 'Gallery'),
  ('gallery_groovybanana_11', 'Gallery Photo 11', 'GroovyBanana Photography 11', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-11.jpg', 'Gallery'),
  ('gallery_groovybanana_12', 'Gallery Photo 12', 'GroovyBanana Photography 12', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-12.jpg', 'Gallery'),
  ('gallery_groovybanana_13', 'Gallery Photo 13', 'GroovyBanana Photography 13', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-13.jpg', 'Gallery'),
  ('gallery_groovybanana_14', 'Gallery Photo 14', 'GroovyBanana Photography 14', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-14.jpg', 'Gallery'),
  ('gallery_groovybanana_15', 'Gallery Photo 15', 'GroovyBanana Photography 15', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-15.jpg', 'Gallery'),
  ('gallery_groovybanana_16', 'Gallery Photo 16', 'GroovyBanana Photography 16', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-16.jpg', 'Gallery'),
  ('gallery_groovybanana_17', 'Gallery Photo 17', 'GroovyBanana Photography 17', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-17.jpg', 'Gallery'),
  ('gallery_groovybanana_18', 'Gallery Photo 18', 'GroovyBanana Photography 18', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-18.jpg', 'Gallery'),
  ('gallery_groovybanana_19', 'Gallery Photo 19', 'GroovyBanana Photography 19', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-19.jpg', 'Gallery'),
  ('gallery_groovybanana_20', 'Gallery Photo 20', 'GroovyBanana Photography 20', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-20.jpg', 'Gallery'),
  ('gallery_groovybanana_21', 'Gallery Photo 21', 'GroovyBanana Photography 21', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-21.jpg', 'Gallery'),
  ('gallery_groovybanana_22', 'Gallery Photo 22', 'GroovyBanana Photography 22', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-22.jpg', 'Gallery'),
  ('gallery_groovybanana_23', 'Gallery Photo 23', 'GroovyBanana Photography 23', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-23.jpg', 'Gallery'),
  ('gallery_groovybanana_24', 'Gallery Photo 24', 'GroovyBanana Photography 24', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-24.jpg', 'Gallery'),
  ('gallery_groovybanana_25', 'Gallery Photo 25', 'GroovyBanana Photography 25', 'Gallery Page', '1920x1080', '/images/resort/gallery/E-nauwiBEachResort-GroovyBanana-print-25.jpg', 'Gallery');

-- ================== DRONE / AERIAL ORIGINALS ==================
INSERT INTO website_content (key, label, description, location, image_dimensions, current_image_url, category) VALUES
  ('drone_20251216_0044', 'Drone Shot Dec 16 - 044', 'Original DJI drone footage', 'Archive / Drone', '4K Original', '/images/resort/originals/DJI_20251216155143_0044_D.jpg', 'Drone'),
  ('drone_20251216_0057', 'Drone Shot Dec 16 - 057', 'Original DJI drone footage', 'Archive / Drone', '4K Original', '/images/resort/originals/DJI_20251216155549_0057_D.jpg', 'Drone'),
  ('drone_20251217_0073', 'Drone Shot Dec 17 - 073', 'Original DJI drone footage', 'Archive / Drone', '4K Original', '/images/resort/originals/DJI_20251217101654_0073_D.jpg', 'Drone'),
  ('drone_20251218_0091', 'Drone Shot Dec 18 - 091', 'Original DJI drone footage', 'Archive / Drone', '4K Original', '/images/resort/originals/DJI_20251218125010_0091_D.jpg', 'Drone'),
  ('drone_20251218_0103', 'Drone Shot Dec 18 - 103', 'Original DJI drone footage', 'Archive / Drone', '4K Original', '/images/resort/originals/DJI_20251218125253_0103_D.jpg', 'Drone');
