#!/usr/bin/env npx ts-node

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Brand colors
const DEEP_OCEAN_BLUE = '#0D4F8B';
const RICH_GOLD = '#E8941C';
const DARK_TEXT = '#1a1a1a';
const LIGHT_TEXT = '#4a5568';

async function generatePDF() {
  console.log('📄 Generating E\'Nauwi Beach Resort Welcome Guide...\n');

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: "E'Nauwi Beach Resort - Welcome Guide",
      Author: "E'Nauwi Beach Resort",
      Subject: 'Guest Welcome Guide',
      Keywords: 'Vanuatu, Efate, Beach Resort, Welcome Guide',
    },
  });

  // Output path
  const outputPath = path.join(__dirname, '..', 'public', 'welcome-guide.pdf');
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Page dimensions
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - 100;
  
  // Get logo path
  const logoPath = path.join(__dirname, '..', 'public', 'logo-enauwi.png');
  const logoExists = fs.existsSync(logoPath);
  
  console.log(`Logo found: ${logoExists ? '✅' : '❌'}`);

  // ==================== PAGE 1: COVER ====================
  console.log('Creating page 1: Cover & Welcome...');
  
  // Ocean blue header background
  doc.rect(0, 0, pageWidth, 280).fill(DEEP_OCEAN_BLUE);
  
  // Logo
  if (logoExists) {
    doc.image(logoPath, (pageWidth - 180) / 2, 40, { width: 180 });
  }
  
  // Welcome text on blue background
  doc.fillColor('#ffffff')
     .fontSize(36)
     .font('Helvetica-Bold')
     .text("Welcome to Paradise", 50, 200, { width: contentWidth, align: 'center' });
  
  // Subtitle
  doc.fontSize(16)
     .font('Helvetica')
     .text("Your Complete Guide to E'Nauwi Beach Resort", 50, 245, { width: contentWidth, align: 'center' });
  
  // Gold decorative line
  doc.moveTo(150, 300).lineTo(pageWidth - 150, 300).lineWidth(3).stroke(RICH_GOLD);
  
  // Welcome message
  doc.fillColor(DARK_TEXT)
     .fontSize(14)
     .font('Helvetica')
     .text(
       "Welcome to E'Nauwi Beach Resort, your tropical sanctuary on the pristine shores of Efate Island, Vanuatu. " +
       "We are honored to have you as our guest and are committed to making your stay unforgettable.",
       50, 330, { width: contentWidth, align: 'center', lineGap: 6 }
     );
  
  doc.moveDown(1);
  doc.text(
    "Nestled on a beautiful lagoon with crystal-clear waters, E'Nauwi offers an authentic island experience " +
    "combined with modern comforts. Whether you're here for adventure, relaxation, or cultural immersion, " +
    "we have everything you need for the perfect getaway.",
    50, doc.y, { width: contentWidth, align: 'center', lineGap: 6 }
  );
  
  // Quote box
  doc.rect(80, 460, contentWidth - 60, 80).fill('#f7f7f7');
  doc.fillColor(DEEP_OCEAN_BLUE)
     .fontSize(16)
     .font('Helvetica-Oblique')
     .text('"Where the Pacific breeze meets island hospitality"', 100, 485, { width: contentWidth - 100, align: 'center' });
  
  // Check-in/Check-out section
  doc.fillColor(RICH_GOLD)
     .fontSize(20)
     .font('Helvetica-Bold')
     .text("Check-in & Check-out", 50, 580, { width: contentWidth, align: 'center' });
  
  // Two columns for check-in/out
  const colWidth = (contentWidth - 20) / 2;
  
  // Check-in box
  doc.rect(50, 610, colWidth, 70).lineWidth(2).stroke(DEEP_OCEAN_BLUE);
  doc.fillColor(DEEP_OCEAN_BLUE)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text("CHECK-IN", 50, 625, { width: colWidth, align: 'center' });
  doc.fillColor(DARK_TEXT)
     .fontSize(20)
     .text("2:00 PM", 50, 648, { width: colWidth, align: 'center' });
  
  // Check-out box
  doc.rect(50 + colWidth + 20, 610, colWidth, 70).lineWidth(2).stroke(RICH_GOLD);
  doc.fillColor(RICH_GOLD)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text("CHECK-OUT", 50 + colWidth + 20, 625, { width: colWidth, align: 'center' });
  doc.fillColor(DARK_TEXT)
     .fontSize(20)
     .text("11:00 AM", 50 + colWidth + 20, 648, { width: colWidth, align: 'center' });
  
  // Footer note
  doc.fillColor(LIGHT_TEXT)
     .fontSize(10)
     .font('Helvetica')
     .text("Early check-in and late check-out available upon request (subject to availability)", 50, 700, { width: contentWidth, align: 'center' });

  // ==================== PAGE 2: WEATHER & SAFETY ====================
  doc.addPage();
  console.log('Creating page 2: Weather & Safety...');
  
  // Section header
  doc.rect(0, 0, pageWidth, 60).fill(DEEP_OCEAN_BLUE);
  doc.fillColor('#ffffff')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text("Weather & Safety Information", 50, 20, { width: contentWidth, align: 'center' });
  
  // Weather section
  doc.fillColor(RICH_GOLD)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text("☀️ Efate Island Weather", 50, 90);
  
  doc.fillColor(DARK_TEXT)
     .fontSize(12)
     .font('Helvetica')
     .moveDown(0.5);
  
  const weatherInfo = [
    "• Climate: Tropical maritime with warm temperatures year-round",
    "• Average Temperature: 23°C - 30°C (73°F - 86°F)",
    "• Dry Season: May to October - ideal for outdoor activities",
    "• Wet Season: November to April - occasional tropical showers",
    "• Water Temperature: 26°C - 29°C (79°F - 84°F) - perfect for swimming!",
    "• Best Time to Visit: May to October for dry, sunny weather",
  ];
  
  weatherInfo.forEach(info => {
    doc.text(info, 60, doc.y, { width: contentWidth - 20, lineGap: 4 });
    doc.moveDown(0.3);
  });
  
  // Gold separator
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).lineWidth(2).stroke(RICH_GOLD);
  doc.moveDown(1);
  
  // Earthquake Safety
  doc.fillColor(RICH_GOLD)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text("⚠️ Earthquake Preparedness", 50, doc.y);
  
  doc.fillColor(DARK_TEXT)
     .fontSize(11)
     .font('Helvetica')
     .moveDown(0.5);
  
  doc.text(
    "Vanuatu is located in the Pacific Ring of Fire, where seismic activity can occur. " +
    "While earthquakes are usually minor, we want you to be prepared and feel safe during your stay.",
    60, doc.y, { width: contentWidth - 20, lineGap: 4 }
  );
  
  doc.moveDown(0.8);
  doc.fillColor(DEEP_OCEAN_BLUE)
     .fontSize(13)
     .font('Helvetica-Bold')
     .text("During an Earthquake:", 60, doc.y);
  
  const earthquakeTips = [
    "• DROP to your hands and knees",
    "• COVER your head and neck under sturdy furniture",
    "• HOLD ON until the shaking stops",
    "• Stay away from windows and heavy objects",
    "• If outdoors, move to an open area away from buildings",
  ];
  
  doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica');
  earthquakeTips.forEach(tip => {
    doc.text(tip, 70, doc.y + 5, { width: contentWidth - 30 });
    doc.moveDown(0.3);
  });
  
  doc.moveDown(0.5);
  doc.fillColor(DEEP_OCEAN_BLUE)
     .fontSize(13)
     .font('Helvetica-Bold')
     .text("After an Earthquake:", 60, doc.y);
  
  const afterEarthquake = [
    "• Check yourself and others for injuries",
    "• Be prepared for aftershocks",
    "• If near the coast and shaking is strong/prolonged, move to higher ground",
    "• Follow resort staff instructions - we are trained for emergencies",
    "• Tsunami Warning: If the ocean recedes unusually, move to high ground immediately",
  ];
  
  doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica');
  afterEarthquake.forEach(tip => {
    doc.text(tip, 70, doc.y + 5, { width: contentWidth - 30 });
    doc.moveDown(0.3);
  });
  
  // Emergency alert box
  doc.moveDown(0.5);
  doc.rect(50, doc.y, contentWidth, 65).fill('#fff3cd');
  doc.fillColor('#856404')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text("🚨 EMERGENCY ASSEMBLY POINT", 60, doc.y - 55, { width: contentWidth - 20, align: 'center' });
  doc.font('Helvetica')
     .fontSize(11)
     .text("In case of emergency, proceed to the main reception area or the beach gazebo.", 60, doc.y - 35, { width: contentWidth - 20, align: 'center' })
     .text("Our staff will guide you to safety.", 60, doc.y - 18, { width: contentWidth - 20, align: 'center' });

  // ==================== PAGE 3: AMENITIES ====================
  doc.addPage();
  console.log('Creating page 3: Amenities...');
  
  // Section header
  doc.rect(0, 0, pageWidth, 60).fill(DEEP_OCEAN_BLUE);
  doc.fillColor('#ffffff')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text("Resort Amenities", 50, 20, { width: contentWidth, align: 'center' });
  
  const amenities = [
    {
      icon: "🏊",
      title: "Swimming Pool",
      desc: "Refreshing pool with sun loungers and poolside service. Open daily from 7:00 AM to 8:00 PM."
    },
    {
      icon: "🍽️",
      title: "Restaurant",
      desc: "Fresh local and international cuisine using organic ingredients. Breakfast 7-10 AM, Lunch 12-3 PM, Dinner 6-9 PM."
    },
    {
      icon: "🍹",
      title: "Bar & Lounge",
      desc: "Tropical cocktails, local Tusker beer, and premium spirits. Happy hour 5-7 PM daily."
    },
    {
      icon: "🏖️",
      title: "Private Beach",
      desc: "Pristine white sand beach with crystal-clear lagoon waters. Beach towels provided at reception."
    },
    {
      icon: "🛶",
      title: "Kayaks & Water Sports",
      desc: "Complimentary kayaks for lagoon exploration. Snorkeling gear available for rent."
    },
    {
      icon: "🌊",
      title: "Lagoon Access",
      desc: "Direct access to our beautiful calm lagoon - perfect for swimming and snorkeling at any skill level."
    },
  ];
  
  let yPos = 85;
  amenities.forEach((amenity, index) => {
    // Alternating background
    if (index % 2 === 0) {
      doc.rect(50, yPos - 8, contentWidth, 75).fill('#f9fafb');
    }
    
    doc.fillColor(RICH_GOLD)
       .fontSize(28)
       .text(amenity.icon, 60, yPos, { width: 40 });
    
    doc.fillColor(DEEP_OCEAN_BLUE)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(amenity.title, 105, yPos);
    
    doc.fillColor(DARK_TEXT)
       .fontSize(11)
       .font('Helvetica')
       .text(amenity.desc, 105, yPos + 22, { width: contentWidth - 70, lineGap: 3 });
    
    yPos += 80;
  });
  
  // Additional services
  doc.moveDown(1);
  doc.fillColor(RICH_GOLD)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text("Additional Services:", 50, yPos + 20);
  
  const additionalServices = [
    "• WiFi available in common areas",
    "• Laundry service (24-hour turnaround)",
    "• Airport transfers upon request",
    "• Room service available during restaurant hours",
    "• Daily housekeeping",
  ];
  
  doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica');
  yPos += 45;
  additionalServices.forEach(service => {
    doc.text(service, 60, yPos, { width: contentWidth - 20 });
    yPos += 18;
  });

  // ==================== PAGE 4: ACTIVITIES ====================
  doc.addPage();
  console.log('Creating page 4: Activities...');
  
  // Section header
  doc.rect(0, 0, pageWidth, 60).fill(DEEP_OCEAN_BLUE);
  doc.fillColor('#ffffff')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text("Activities & Experiences", 50, 20, { width: contentWidth, align: 'center' });
  
  const activities = [
    {
      title: "🤿 Snorkeling",
      desc: "Explore vibrant coral reefs teeming with tropical fish. Equipment available at the front desk. Best spots: House reef (50m from beach), Outer reef (boat trip available)."
    },
    {
      title: "🛶 Kayaking",
      desc: "Paddle through the calm lagoon and explore nearby mangroves. Complimentary single and double kayaks available. Best time: Early morning or late afternoon."
    },
    {
      title: "🏝️ Island Tours",
      desc: "Discover Efate's hidden gems with our guided island tours. Visit traditional villages, waterfalls, and pristine beaches. Half-day and full-day options available."
    },
    {
      title: "🎭 Cultural Experiences",
      desc: "Immerse yourself in authentic Ni-Vanuatu culture. Watch traditional sand drawings, attend kava ceremonies, and learn about local customs and traditions."
    },
    {
      title: "🎣 Fishing Trips",
      desc: "Join local fishermen for an authentic fishing experience. Trolling, reef fishing, and deep-sea options available. Catch your dinner!"
    },
    {
      title: "🌅 Sunset Cruises",
      desc: "Romantic evening cruises with refreshments as you watch the sun set over the Pacific. Perfect for couples and special occasions."
    },
  ];
  
  yPos = 85;
  activities.forEach((activity, index) => {
    doc.fillColor(DEEP_OCEAN_BLUE)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(activity.title, 50, yPos);
    
    doc.fillColor(DARK_TEXT)
       .fontSize(11)
       .font('Helvetica')
       .text(activity.desc, 50, yPos + 20, { width: contentWidth, lineGap: 3 });
    
    // Gold separator line
    yPos += 65;
    if (index < activities.length - 1) {
      doc.moveTo(100, yPos).lineTo(pageWidth - 100, yPos).lineWidth(1).stroke(RICH_GOLD);
      yPos += 15;
    }
  });
  
  // Booking note
  doc.moveDown(2);
  doc.rect(50, doc.y, contentWidth, 50).fill('#e6f3ff');
  doc.fillColor(DEEP_OCEAN_BLUE)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text("📅 Book Your Activities", 60, doc.y - 40, { width: contentWidth - 20 });
  doc.font('Helvetica')
     .text("Please book activities at least 24 hours in advance at the reception desk or speak with our activities coordinator.", 60, doc.y - 23, { width: contentWidth - 20 });

  // ==================== PAGE 5: LOCAL ATTRACTIONS ====================
  doc.addPage();
  console.log('Creating page 5: Local Attractions...');
  
  // Section header
  doc.rect(0, 0, pageWidth, 60).fill(DEEP_OCEAN_BLUE);
  doc.fillColor('#ffffff')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text("Explore Efate Island", 50, 20, { width: contentWidth, align: 'center' });
  
  doc.fillColor(DARK_TEXT)
     .fontSize(12)
     .font('Helvetica')
     .text(
       "Efate is the main island of Vanuatu, known for its rich cultural heritage and stunning natural beauty. " +
       "Here are some must-see attractions:",
       50, 80, { width: contentWidth, lineGap: 4 }
     );
  
  const attractions = [
    {
      name: "Small Nambas Village",
      desc: "Experience traditional village life and witness authentic customs that have been preserved for centuries."
    },
    {
      name: "Big Nambas Territory",
      desc: "Visit the remote highlands to meet the legendary Big Nambas people and learn about their fascinating culture."
    },
    {
      name: "Cannibal Sites",
      desc: "Explore historical sites with knowledgeable guides who share the island's complex history."
    },
    {
      name: "Maskelyne Islands",
      desc: "Day trip to these beautiful outer islands for pristine beaches and excellent snorkeling."
    },
    {
      name: "Local Markets",
      desc: "Visit Port Vila markets for fresh produce, handicrafts, and authentic local experiences."
    },
    {
      name: "Jungle Walks & Waterfalls",
      desc: "Trek through lush rainforest to discover hidden waterfalls and abundant wildlife."
    },
  ];
  
  yPos = 130;
  attractions.forEach((attraction, index) => {
    // Numbered circle
    doc.circle(65, yPos + 8, 12).fill(RICH_GOLD);
    doc.fillColor('#ffffff')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(String(index + 1), 59, yPos + 3);
    
    doc.fillColor(DEEP_OCEAN_BLUE)
       .fontSize(13)
       .font('Helvetica-Bold')
       .text(attraction.name, 90, yPos);
    
    doc.fillColor(DARK_TEXT)
       .fontSize(11)
       .font('Helvetica')
       .text(attraction.desc, 90, yPos + 18, { width: contentWidth - 50 });
    
    yPos += 55;
  });
  
  // Getting around section
  doc.moveDown(1);
  doc.fillColor(RICH_GOLD)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text("🚗 Getting Around", 50, yPos + 10);
  
  doc.fillColor(DARK_TEXT)
     .fontSize(11)
     .font('Helvetica')
     .text(
       "• Resort shuttle service available to nearby towns\n" +
       "• Local taxis can be arranged through reception\n" +
       "• Guided tours include all transportation\n" +
       "• Walking maps available at the front desk",
       60, yPos + 35, { width: contentWidth - 20, lineGap: 4 }
     );

  // ==================== PAGE 6: CONTACT & EMERGENCY ====================
  doc.addPage();
  console.log('Creating page 6: Contact & Emergency...');
  
  // Section header
  doc.rect(0, 0, pageWidth, 60).fill(DEEP_OCEAN_BLUE);
  doc.fillColor('#ffffff')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text("Contact & Emergency Information", 50, 20, { width: contentWidth, align: 'center' });
  
  // Contact card
  doc.rect(50, 85, contentWidth, 120).lineWidth(3).stroke(RICH_GOLD);
  
  doc.fillColor(DEEP_OCEAN_BLUE)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text("📞 E'Nauwi Beach Resort", 70, 100, { width: contentWidth - 40 });
  
  doc.fillColor(DARK_TEXT)
     .fontSize(14)
     .font('Helvetica')
     .text("Phone: +678 22170", 70, 130)
     .text("Email: gm@enauwibeachresort.com", 70, 150)
     .text("Location: Efate Island, Vanuatu", 70, 170);
  
  // Reception hours
  doc.fillColor(RICH_GOLD)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text("🕐 Reception Hours", 50, 230);
  
  doc.fillColor(DARK_TEXT)
     .fontSize(12)
     .font('Helvetica')
     .text("Reception is open 24 hours a day, 7 days a week.", 50, 255)
     .text("For after-hours assistance, please ring the bell at reception.", 50, 272);
  
  // Emergency contacts
  doc.fillColor('#dc2626')
     .fontSize(18)
     .font('Helvetica-Bold')
     .text("🚨 Emergency Contacts", 50, 320);
  
  doc.rect(50, 345, contentWidth, 160).fill('#fef2f2');
  
  const emergencyContacts = [
    { name: "Resort Emergency", number: "+678 22170 (ask for duty manager)" },
    { name: "Vanuatu Police", number: "111" },
    { name: "Ambulance/Medical", number: "112" },
    { name: "Fire Services", number: "113" },
    { name: "Vila Central Hospital", number: "+678 22100" },
    { name: "Australian Embassy", number: "+678 22777" },
    { name: "New Zealand Embassy", number: "+678 22933" },
  ];
  
  yPos = 355;
  emergencyContacts.forEach(contact => {
    doc.fillColor('#dc2626')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(contact.name + ":", 60, yPos, { continued: true, width: 150 });
    doc.fillColor(DARK_TEXT)
       .font('Helvetica')
       .text("  " + contact.number, { width: contentWidth - 170 });
    yPos += 20;
  });
  
  // Medical info
  doc.fillColor(RICH_GOLD)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text("🏥 Medical Information", 50, 530);
  
  doc.fillColor(DARK_TEXT)
     .fontSize(11)
     .font('Helvetica')
     .text(
       "• First aid kit available at reception\n" +
       "• Nearest hospital: Vila Central Hospital (approximately 30 minutes by car)\n" +
       "• Please inform us of any medical conditions or allergies\n" +
       "• Travel insurance with medical evacuation coverage is strongly recommended",
       60, 555, { width: contentWidth - 20, lineGap: 4 }
     );
  
  // Footer - Thank you
  doc.rect(0, pageHeight - 100, pageWidth, 100).fill(DEEP_OCEAN_BLUE);
  
  doc.fillColor('#ffffff')
     .fontSize(18)
     .font('Helvetica-Bold')
     .text("Thank you for choosing E'Nauwi Beach Resort!", 50, pageHeight - 80, { width: contentWidth, align: 'center' });
  
  doc.fillColor(RICH_GOLD)
     .fontSize(14)
     .font('Helvetica')
     .text("We wish you a wonderful stay on Efate Island", 50, pageHeight - 50, { width: contentWidth, align: 'center' });

  // End document
  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log('\n✅ PDF generated successfully!');
      console.log(`📁 Saved to: ${outputPath}`);
      resolve();
    });
    writeStream.on('error', reject);
  });
}

generatePDF().catch(console.error);
