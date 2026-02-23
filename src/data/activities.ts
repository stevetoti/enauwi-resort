export interface Activity {
  slug: string
  title: string
  tagline: string
  tag: string
  duration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  groupSize: string
  price: string
  heroImage: string
  gallery: string[]
  description: string
  whatToExpect: string[]
  highlights: string[]
  included: string[]
  whatToBring: string[]
  bestTime: string
  safety: string
  related: string[]
}

export const activities: Activity[] = [
  {
    slug: 'snorkeling-diving',
    title: 'Snorkeling & Diving',
    tagline: 'Discover vibrant coral reefs and marine life in crystal-clear waters',
    tag: 'Most Popular',
    duration: '2–3 hours',
    difficulty: 'Easy',
    groupSize: '2–8 people',
    price: '5,500 VT',
    heroImage: '/images/resort/beach-kayaks-cove.jpg',
    gallery: [
      '/images/resort/resort-lagoon-aerial-sm.jpg',
      '/images/resort/resort-coral-reef-sm.jpg',
      '/images/resort/lagoon-island-view-sm.jpg',
    ],
    description: `Dive into the warm waters of Efate and explore one of the most pristine reef systems in the South Pacific. Our snorkeling and diving excursion takes you to handpicked sites where you'll encounter schools of tropical fish, sea turtles, and the occasional manta ray.\n\nA highlight of our lagoon is the three resident dugongs (sea cows) who roam and guard these waters — a rare and magical encounter. Whether you're a first-time snorkeler or certified diver, our experienced local guides will ensure an unforgettable underwater adventure.`,
    whatToExpect: [
      'Boat ride to pristine reef sites along the coast',
      'Guided snorkel or dive with experienced local guides',
      'See tropical fish, sea turtles, dugongs, and corals',
      'Refreshments and fruit provided on the boat',
      'Photos available from your guide',
    ],
    highlights: [
      '🐠 Over 200 species of tropical fish',
      '🐢 Sea turtles & resident dugongs',
      '🪸 Pristine, untouched coral reefs',
      '📸 Underwater photo opportunities',
    ],
    included: ['All snorkeling/diving gear', 'Boat transport to reef sites', 'Experienced local guide', 'Fresh tropical fruit & water', 'Beach towels'],
    whatToBring: ['Reef-safe sunscreen', 'Swimwear', 'GoPro / waterproof camera (optional)', 'Hat for the boat ride'],
    bestTime: 'Year-round, best visibility May–October. Morning trips are calmest.',
    safety: 'Life jackets provided. Non-swimmers welcome with flotation devices. Our guides are trained in water safety and first aid.',
    related: ['island-hopping', 'sunset-kayaking', 'turtle-watching'],
  },
  // NOTE: Cultural Village Tour removed - not yet approved by resort (kastom village + sand drawing)
  {
    slug: 'island-hopping',
    title: 'Island Hopping',
    tagline: 'Cruise to hidden islands, secret beaches, and volcanic landscapes',
    tag: 'Adventure',
    duration: 'Full day (7–8 hours)',
    difficulty: 'Easy',
    groupSize: '4–10 people',
    price: '12,000 VT',
    heroImage: '/images/resort/private-island-sandbar.jpg',
    gallery: [
      '/images/resort/lagoon-island-view-sm.jpg',
      '/images/resort/beach-kayaks-cove-sm.jpg',
      '/images/resort/resort-lagoon-kayak-sm.jpg',
    ],
    description: `Just minutes from the resort by kayak, four beautiful sandy beach islands await your discovery. These pristine islets offer perfect snorkeling, private beach picnics, and the ultimate castaway experience.\n\nFor a full-day adventure, our island hopping excursion takes you further afield by boat to explore hidden coves with turquoise water, sea caves carved by centuries of waves, and secluded beaches that few tourists ever see. Enjoy a beach barbecue lunch on a deserted island — this is the ultimate Pacific island experience.`,
    whatToExpect: [
      'Scenic boat cruise along the coastline',
      'Visit 2–3 neighbouring islands',
      'Snorkeling at pristine reef spots',
      'Beach barbecue lunch on a secluded island',
      'Explore sea caves and hidden coves',
      'Swimming in crystal-clear lagoons',
    ],
    highlights: [
      '🏝️ Visit deserted tropical islands',
      '🍖 Beach barbecue lunch included',
      '🤿 Snorkeling at multiple reef sites',
      '🌊 Explore sea caves and lagoons',
    ],
    included: ['Boat transport all day', 'Experienced captain & guide', 'Beach BBQ lunch with drinks', 'Snorkeling gear', 'Life jackets', 'Cooler with drinks & snacks'],
    whatToBring: ['Swimwear & towel', 'Reef-safe sunscreen', 'Hat & sunglasses', 'Waterproof camera', 'Light jacket for the boat'],
    bestTime: 'April to November (dry season). Calm seas for best experience.',
    safety: 'All boats equipped with safety gear. Life jackets mandatory. Trip may be cancelled in rough weather — full refund given.',
    related: ['snorkeling-diving', 'sport-fishing', 'sunset-kayaking'],
  },
  {
    slug: 'sport-fishing',
    title: 'Sport Fishing',
    tagline: 'Battle marlin, tuna, and mahi-mahi in deep Pacific waters',
    tag: 'Sport',
    duration: '4–6 hours',
    difficulty: 'Moderate',
    groupSize: '2–6 people',
    price: '15,000 VT',
    heroImage: '/images/resort/resort-lagoon-kayak.jpg',
    gallery: [
      '/images/resort/beach-resort-overview-sm.jpg',
      '/images/resort/resort-coral-reef-sm.jpg',
      '/images/resort/private-island-sandbar-sm.jpg',
    ],
    description: `The deep waters off Efate are a sport fisher's paradise. Rich currents bring big game fish close to shore, and our experienced local fishing guides know exactly where to find them.\n\nWhether you're after the thrill of hooking a marlin or the satisfaction of landing a yellowfin tuna, our fishing charters offer an authentic Pacific fishing experience. We practice catch-and-release for billfish and offer to prepare your catch for dinner at the resort.`,
    whatToExpect: [
      'Deep-sea fishing trip with experienced local captain',
      'Target species: marlin, tuna, mahi-mahi, wahoo',
      'Trolling and bottom fishing techniques',
      'Resort chef will cook your catch for dinner',
      'Cold drinks and snacks on board',
    ],
    highlights: [
      '🐟 World-class game fishing waters',
      '🎣 Professional-grade tackle provided',
      '👨‍🍳 Chef prepares your catch',
      '📸 Trophy photo opportunities',
    ],
    included: ['Fishing boat & captain', 'All fishing tackle & bait', 'Cold drinks & snacks', 'Catch preparation at resort', 'Life jackets'],
    whatToBring: ['Hat & sunglasses', 'Sunscreen', 'Long-sleeve shirt', 'Camera', 'Motion sickness medication if needed'],
    bestTime: 'Best fishing June–November. Marlin season peaks August–October.',
    safety: 'Experienced captain with safety certifications. All safety equipment on board. Trips weather-dependent.',
    related: ['island-hopping', 'snorkeling-diving', 'sunset-kayaking'],
  },
  // NOTE: Jungle Nature Trek removed - waterfall tour not yet approved by resort
  {
    slug: 'sunset-spa',
    title: 'Sunset Spa & Relaxation',
    tagline: 'Unwind with traditional treatments as the sun paints the sky',
    tag: 'Relaxation',
    duration: '2–3 hours',
    difficulty: 'Easy',
    groupSize: '1–4 people',
    price: '8,000 VT',
    heroImage: '/images/resort/resort-lagoon-aerial.jpg',
    gallery: [
      '/images/resort/wedding-beach-couple-sm.jpg',
      '/images/resort/beach-resort-overview-sm.jpg',
      '/images/resort/resort-buildings-aerial-sm.jpg',
    ],
    description: `End your day in paradise with the ultimate relaxation experience. Our sunset spa session combines traditional Melanesian wellness practices with modern comfort, set against the backdrop of one of the most spectacular sunsets in the Pacific.\n\nBegin with a coconut oil body scrub using locally harvested ingredients, followed by a deep tissue massage. Then relax in our beachfront lounge area with a tropical cocktail while watching the sun dip below the horizon. Pure bliss.`,
    whatToExpect: [
      'Coconut oil body scrub with local ingredients',
      'Full-body traditional massage (60 min)',
      'Beachfront relaxation with sunset views',
      'Tropical cocktail or fresh juice included',
      'Aromatherapy with local flowers and herbs',
    ],
    highlights: [
      '🌅 Stunning sunset beachfront setting',
      '🥥 Natural coconut oil treatments',
      '💆 Traditional massage techniques',
      '🍹 Complimentary tropical cocktail',
    ],
    included: ['Full spa treatment (scrub + massage)', 'Tropical cocktail or juice', 'Beachfront lounge access', 'Fresh towels & robe', 'Natural local products'],
    whatToBring: ['Nothing — just yourself!', 'Swimwear if you want to swim after'],
    bestTime: 'Sessions start 1.5 hours before sunset. Available year-round.',
    safety: 'Please inform us of any allergies or medical conditions. All products are natural, locally sourced.',
    related: ['sunset-kayaking', 'cooking-class', 'snorkeling-diving'],
  },
  // NOTE: Sand Drawing Experience removed - sand drawing not yet approved by resort
  {
    slug: 'volcano-trek',
    title: 'Volcano Viewpoint Trek',
    tagline: 'Hike to stunning volcanic viewpoints overlooking the Pacific',
    tag: 'Adventure',
    duration: '4–6 hours',
    difficulty: 'Challenging',
    groupSize: '2–6 people',
    price: '7,000 VT',
    heroImage: '/images/resort/lagoon-island-view.jpg',
    gallery: [
      '/images/resort/private-island-sandbar-sm.jpg',
      '/images/resort/resort-lagoon-aerial-sm.jpg',
      '/images/resort/beach-kayaks-cove-sm.jpg',
    ],
    description: `Vanuatu sits on the Pacific Ring of Fire, and the volcanic landscape is part of what makes this archipelago so extraordinary. This challenging trek takes you up through the highland interior to a dramatic volcanic viewpoint where you can see across the island chain.\n\nThe trail winds through changing vegetation zones — from coastal coconut palms to dense montane forest. Your guide will explain the geological history of the region, point out volcanic formations, and share local legends about the mountains.`,
    whatToExpect: [
      'Challenging uphill trek through varied terrain',
      'Panoramic views from volcanic highlands',
      'Learn about Vanuatu\'s volcanic geology',
      'Pass through multiple vegetation zones',
      'Packed lunch at the summit viewpoint',
      'Hear local legends about the mountains',
    ],
    highlights: [
      '🌋 Volcanic landscape views',
      '🏔️ Panoramic island chain vistas',
      '🌿 Diverse vegetation zones',
      '📸 Incredible photography opportunities',
    ],
    included: ['Expert guide', 'Walking poles', 'Packed lunch & water', 'First aid kit', 'Transport to trailhead'],
    whatToBring: ['Sturdy hiking boots', 'Long pants', 'Rain jacket', 'Extra water (1L minimum)', 'Snacks', 'Camera'],
    bestTime: 'May–October (dry season). Early morning departure for cooler temperatures.',
    safety: 'Good fitness required. Not recommended for those with heart or respiratory conditions. Guide carries communication device and first aid.',
    related: ['island-hopping', 'snorkeling-diving', 'turtle-watching'],
  },
  {
    slug: 'turtle-watching',
    title: 'Sea Turtle Watching',
    tagline: 'Witness majestic sea turtles in their natural habitat',
    tag: 'Nature',
    duration: '2–3 hours',
    difficulty: 'Easy',
    groupSize: '2–8 people',
    price: '4,000 VT',
    heroImage: '/images/resort/beach-kayaks-cove.jpg',
    gallery: [
      '/images/resort/resort-coral-reef-sm.jpg',
      '/images/resort/resort-lagoon-kayak-sm.jpg',
      '/images/resort/beach-resort-overview-sm.jpg',
    ],
    description: `The waters around E'Nauwi are home to sea turtles, including green turtles and hawksbills, plus three resident dugongs (sea cows) who roam and guard our lagoon. This gentle, eco-friendly excursion takes you to observe these magnificent creatures feeding, resting, and swimming in their natural environment.\n\nDugong sightings are a rare privilege — these gentle giants are endangered throughout the Pacific. Our guides work with local conservation efforts to ensure minimal disturbance. During turtle nesting season (November–February), there's also a chance to witness turtles coming ashore to lay eggs.`,
    whatToExpect: [
      'Boat or shore-based turtle observation',
      'Learn about sea turtle biology and conservation',
      'Snorkeling alongside turtles (respectful distance)',
      'During nesting season: possible beach nesting observation',
      'Photography opportunities',
    ],
    highlights: [
      '🐢 Multiple turtle species',
      '🌊 Eco-friendly observation',
      '📚 Conservation education',
      '📸 Amazing photo moments',
    ],
    included: ['Guide & transport', 'Snorkeling gear', 'Conservation talk', 'Refreshments', 'Donation to local turtle conservation'],
    whatToBring: ['Reef-safe sunscreen', 'Swimwear', 'Camera (no flash)', 'Hat & sunglasses'],
    bestTime: 'Year-round for swimming turtles. November–February for nesting season.',
    safety: 'Minimal physical demand. Please do not touch or chase turtles. Follow guide instructions.',
    related: ['snorkeling-diving', 'island-hopping', 'sunset-kayaking'],
  },
  {
    slug: 'cooking-class',
    title: 'Traditional Laplap Cooking Class',
    tagline: 'Cook Vanuatu\'s national dish with local ingredients and techniques',
    tag: 'Cultural',
    duration: '3 hours',
    difficulty: 'Easy',
    groupSize: '2–8 people',
    price: '4,500 VT',
    heroImage: '/images/resort/resort-buildings-aerial.jpg',
    gallery: [
      '/images/resort/resort-lagoon-aerial-sm.jpg',
      '/images/resort/wedding-beach-couple-sm.jpg',
      '/images/resort/beach-resort-overview-sm.jpg',
    ],
    description: `Laplap is Vanuatu's national dish — a delicious root vegetable pudding wrapped in banana leaves and cooked in an underground earth oven (umu). In this hands-on cooking class, you'll learn to prepare laplap and other traditional dishes from scratch using fresh, local ingredients.\n\nA local mama (the traditional cook) will guide you through every step — from grating the root vegetables to preparing the banana leaf wrapping and building the earth oven. You'll sit down together to enjoy your creation with the whole group.`,
    whatToExpect: [
      'Learn traditional food preparation techniques',
      'Prepare laplap from scratch with local ingredients',
      'Build and use a traditional earth oven (umu)',
      'Prepare coconut cream, grilled fish, and island salad',
      'Eat your creation with the group',
      'Take home recipes and techniques',
    ],
    highlights: [
      '🍽️ Cook Vanuatu\'s national dish',
      '🔥 Traditional earth oven cooking',
      '🥥 Fresh local ingredients',
      '👩‍🍳 Learn from a local mama',
    ],
    included: ['All ingredients & materials', 'Expert local cooking guide', 'Full meal you prepare', 'Tropical drink', 'Recipe cards to take home'],
    whatToBring: ['Comfortable clothes (may get messy!)', 'Camera', 'Appetite!'],
    bestTime: 'Year-round. Classes typically start mid-morning.',
    safety: 'Involves fire/heat from earth oven. Children welcome with supervision.',
    related: ['turtle-watching', 'sunset-spa', 'sunset-kayaking'],
  },
  {
    slug: 'sunset-kayaking',
    title: 'Sunset Kayaking',
    tagline: 'Paddle along the golden coastline as the sun sets over the Pacific',
    tag: 'Adventure',
    duration: '2 hours',
    difficulty: 'Easy',
    groupSize: '2–8 people',
    price: '4,000 VT',
    heroImage: '/images/resort/resort-lagoon-kayak.jpg',
    gallery: [
      '/images/resort/lagoon-island-view-sm.jpg',
      '/images/resort/private-island-sandbar-sm.jpg',
      '/images/resort/beach-kayaks-cove-sm.jpg',
    ],
    description: `There's no better way to end a day in paradise than paddling through the calm lagoon as the sun sinks into the Pacific. Kayak out to one of the four sandy beach islands just minutes from the resort, or explore the coastline as rocky headlands glow gold in the sunset light.\n\nSingle and tandem kayaks are available, and no experience is needed. Your guide will lead the way, pointing out marine life in the clear shallows and sharing stories about the islands. Stop at a secluded beach for refreshments before paddling back under the stars.`,
    whatToExpect: [
      'Guided kayak tour along the coastline',
      'Paddle through mangrove channels',
      'Watch the sunset from the water',
      'Stop at a secluded beach for refreshments',
      'Spot marine life in the shallows',
      'Return under the first stars',
    ],
    highlights: [
      '🌅 Spectacular sunset views from the water',
      '🛶 Easy paddling — no experience needed',
      '🌴 Explore hidden mangrove channels',
      '⭐ Paddle back under the stars',
    ],
    included: ['Kayak & paddle', 'Life jacket', 'Dry bag for valuables', 'Guided tour', 'Refreshments on the beach'],
    whatToBring: ['Swimwear / quick-dry clothes', 'Reef-safe sunscreen', 'Water bottle', 'Camera in waterproof case'],
    bestTime: 'Year-round. Departs approximately 1.5 hours before sunset.',
    safety: 'No experience needed. Life jackets mandatory. Calm water route suitable for beginners.',
    related: ['snorkeling-diving', 'island-hopping', 'sunset-spa'],
  },
]

export function getActivityBySlug(slug: string): Activity | undefined {
  return activities.find(a => a.slug === slug)
}

export function getRelatedActivities(slugs: string[]): Activity[] {
  return activities.filter(a => slugs.includes(a.slug))
}
