import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Brand colors
const DEEP_OCEAN_BLUE = '#0D4F8B';
const RICH_GOLD = '#E8941C';
const DARK_TEXT = '#1a1a1a';
const LIGHT_TEXT = '#4a5568';
const LIGHT_BG = '#f8fafc';

export async function GET() {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: "E'Nauwi Beach Resort - Welcome Guide",
        Author: "E'Nauwi Beach Resort",
        Subject: 'Guest Welcome Guide',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - 120;
    
    const logoPath = path.join(process.cwd(), 'public', 'logo-enauwi.png');
    const logoExists = fs.existsSync(logoPath);

    // Helper function for section headers
    const sectionHeader = (title: string) => {
      doc.rect(0, 0, pageWidth, 70).fill(DEEP_OCEAN_BLUE);
      doc.fillColor('#ffffff')
         .fontSize(26)
         .font('Helvetica-Bold')
         .text(title, 60, 25, { width: contentWidth, align: 'center' });
    };

    // Helper for gold divider
    const goldDivider = (y: number) => {
      doc.moveTo(80, y).lineTo(pageWidth - 80, y).lineWidth(2).stroke(RICH_GOLD);
    };

    // ==================== PAGE 1: COVER ====================
    doc.rect(0, 0, pageWidth, 250).fill(DEEP_OCEAN_BLUE);
    
    if (logoExists) {
      doc.image(logoPath, (pageWidth - 160) / 2, 35, { width: 160 });
    }
    
    doc.fillColor('#ffffff')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text("Welcome to Paradise", 60, 180, { width: contentWidth, align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica')
       .text("Your Complete Guest Guide", 60, 220, { width: contentWidth, align: 'center' });
    
    goldDivider(280);
    
    doc.fillColor(DARK_TEXT)
       .fontSize(12)
       .font('Helvetica')
       .text(
         "Welcome to E'Nauwi Beach Resort, your tropical sanctuary on the pristine shores of Efate Island, Vanuatu. We are honored to have you as our guest.",
         60, 310, { width: contentWidth, align: 'center', lineGap: 8 }
       );
    
    doc.text(
      "Nestled on a beautiful lagoon with crystal-clear waters, E'Nauwi offers an authentic island experience combined with modern comforts.",
      60, 380, { width: contentWidth, align: 'center', lineGap: 8 }
    );
    
    // Quote box
    doc.rect(80, 450, contentWidth - 40, 60).fill(LIGHT_BG);
    doc.fillColor(DEEP_OCEAN_BLUE)
       .fontSize(14)
       .font('Helvetica-Oblique')
       .text('"Where the Pacific breeze meets island hospitality"', 100, 470, { width: contentWidth - 80, align: 'center' });
    
    // Check-in/Check-out
    doc.fillColor(RICH_GOLD)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text("Check-in & Check-out Times", 60, 550, { width: contentWidth, align: 'center' });
    
    const colWidth = (contentWidth - 40) / 2;
    
    doc.rect(60, 590, colWidth, 80).lineWidth(2).stroke(DEEP_OCEAN_BLUE);
    doc.fillColor(DEEP_OCEAN_BLUE).fontSize(12).font('Helvetica-Bold')
       .text("CHECK-IN", 60, 605, { width: colWidth, align: 'center' });
    doc.fillColor(DARK_TEXT).fontSize(28).font('Helvetica-Bold')
       .text("2:00 PM", 60, 630, { width: colWidth, align: 'center' });
    
    doc.rect(100 + colWidth, 590, colWidth, 80).lineWidth(2).stroke(RICH_GOLD);
    doc.fillColor(RICH_GOLD).fontSize(12).font('Helvetica-Bold')
       .text("CHECK-OUT", 100 + colWidth, 605, { width: colWidth, align: 'center' });
    doc.fillColor(DARK_TEXT).fontSize(28).font('Helvetica-Bold')
       .text("11:00 AM", 100 + colWidth, 630, { width: colWidth, align: 'center' });
    
    doc.fillColor(LIGHT_TEXT).fontSize(10).font('Helvetica')
       .text("Early check-in and late check-out available upon request", 60, 690, { width: contentWidth, align: 'center' });

    // ==================== PAGE 2: WEATHER & SAFETY ====================
    doc.addPage();
    sectionHeader("Weather & Safety");
    
    doc.fillColor(RICH_GOLD).fontSize(18).font('Helvetica-Bold')
       .text("Efate Island Weather", 60, 100);
    
    doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica');
    const weatherItems = [
      ["Climate:", "Tropical maritime with warm temperatures year-round"],
      ["Temperature:", "23-30°C (73-86°F) average"],
      ["Dry Season:", "May to October - ideal for outdoor activities"],
      ["Wet Season:", "November to April - occasional tropical showers"],
      ["Water Temp:", "26-29°C (79-84°F) - perfect for swimming"],
    ];
    
    let y = 130;
    weatherItems.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, 70, y, { continued: true, width: 100 });
      doc.font('Helvetica').text(" " + value);
      y += 22;
    });
    
    goldDivider(y + 15);
    
    doc.fillColor(RICH_GOLD).fontSize(18).font('Helvetica-Bold')
       .text("Earthquake Preparedness", 60, y + 40);
    
    doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica')
       .text("Vanuatu is in the Pacific Ring of Fire. While earthquakes are usually minor, please be prepared:", 60, y + 70, { width: contentWidth, lineGap: 6 });
    
    doc.fillColor(DEEP_OCEAN_BLUE).fontSize(13).font('Helvetica-Bold')
       .text("During an Earthquake:", 60, y + 110);
    
    const duringEQ = [
      "DROP to your hands and knees",
      "COVER your head and neck under sturdy furniture", 
      "HOLD ON until the shaking stops",
      "Stay away from windows and heavy objects",
    ];
    
    doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica');
    let eqY = y + 135;
    duringEQ.forEach(tip => {
      doc.circle(75, eqY + 4, 3).fill(RICH_GOLD);
      doc.fillColor(DARK_TEXT).text(tip, 90, eqY, { width: contentWidth - 40 });
      eqY += 22;
    });
    
    doc.fillColor(DEEP_OCEAN_BLUE).fontSize(13).font('Helvetica-Bold')
       .text("After an Earthquake:", 60, eqY + 15);
    
    const afterEQ = [
      "Check yourself and others for injuries",
      "Be prepared for aftershocks",
      "If near the coast after strong shaking, move to higher ground",
      "Follow resort staff instructions",
    ];
    
    eqY += 40;
    afterEQ.forEach(tip => {
      doc.circle(75, eqY + 4, 3).fill(RICH_GOLD);
      doc.fillColor(DARK_TEXT).text(tip, 90, eqY, { width: contentWidth - 40 });
      eqY += 22;
    });
    
    // Emergency box
    doc.rect(60, eqY + 20, contentWidth, 70).fill('#fff3cd');
    doc.fillColor('#856404').fontSize(13).font('Helvetica-Bold')
       .text("EMERGENCY ASSEMBLY POINT", 80, eqY + 35, { width: contentWidth - 40, align: 'center' });
    doc.font('Helvetica').fontSize(11)
       .text("Proceed to main reception or beach gazebo. Staff will guide you.", 80, eqY + 55, { width: contentWidth - 40, align: 'center' });

    // ==================== PAGE 3: AMENITIES ====================
    doc.addPage();
    sectionHeader("Resort Amenities");
    
    const amenities = [
      { title: "Swimming Pool", desc: "Refreshing pool with sun loungers. Open 7:00 AM - 8:00 PM daily." },
      { title: "Restaurant", desc: "Fresh local & international cuisine. Breakfast 7-10 AM, Lunch 12-3 PM, Dinner 6-9 PM." },
      { title: "Bar & Lounge", desc: "Tropical cocktails and local Tusker beer. Happy hour 5-7 PM." },
      { title: "Private Beach", desc: "Pristine white sand with crystal-clear lagoon. Towels at reception." },
      { title: "Kayaks & Water Sports", desc: "Complimentary kayaks. Snorkeling gear available for rent." },
      { title: "Lagoon Access", desc: "Direct access to calm lagoon - perfect for swimming at any skill level." },
    ];
    
    y = 95;
    amenities.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.rect(60, y - 5, contentWidth, 65).fill(LIGHT_BG);
      }
      
      doc.fillColor(DEEP_OCEAN_BLUE).fontSize(15).font('Helvetica-Bold')
         .text(item.title, 80, y + 8);
      doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica')
         .text(item.desc, 80, y + 30, { width: contentWidth - 40, lineGap: 4 });
      y += 75;
    });
    
    doc.fillColor(RICH_GOLD).fontSize(14).font('Helvetica-Bold')
       .text("Additional Services", 60, y + 20);
    
    const services = ["WiFi in common areas", "Laundry service (24-hour)", "Airport transfers", "Room service", "Daily housekeeping"];
    y += 50;
    services.forEach(s => {
      doc.circle(75, y + 4, 3).fill(RICH_GOLD);
      doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica').text(s, 90, y);
      y += 20;
    });

    // ==================== PAGE 4: ACTIVITIES ====================
    doc.addPage();
    sectionHeader("Activities & Experiences");
    
    const activities = [
      { title: "Snorkeling", desc: "Explore vibrant coral reefs with tropical fish. Equipment at front desk." },
      { title: "Kayaking", desc: "Paddle through calm lagoon and mangroves. Complimentary kayaks available." },
      { title: "Island Tours", desc: "Guided tours to villages, waterfalls, and pristine beaches." },
      { title: "Cultural Experiences", desc: "Traditional sand drawings, kava ceremonies, and local customs." },
      { title: "Fishing Trips", desc: "Join local fishermen for trolling, reef, or deep-sea fishing." },
      { title: "Sunset Cruises", desc: "Romantic evening cruises with refreshments over the Pacific." },
    ];
    
    y = 100;
    activities.forEach((act, i) => {
      doc.fillColor(DEEP_OCEAN_BLUE).fontSize(14).font('Helvetica-Bold')
         .text(act.title, 60, y);
      doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica')
         .text(act.desc, 60, y + 20, { width: contentWidth, lineGap: 4 });
      y += 60;
      if (i < activities.length - 1) {
        doc.moveTo(100, y - 10).lineTo(pageWidth - 100, y - 10).lineWidth(1).stroke('#e2e8f0');
      }
    });
    
    doc.rect(60, y + 10, contentWidth, 50).fill('#e6f3ff');
    doc.fillColor(DEEP_OCEAN_BLUE).fontSize(11).font('Helvetica-Bold')
       .text("Book Your Activities", 80, y + 25);
    doc.font('Helvetica')
       .text("Please book at least 24 hours in advance at reception.", 80, y + 42);

    // ==================== PAGE 5: LOCAL ATTRACTIONS ====================
    doc.addPage();
    sectionHeader("Explore Efate Island");
    
    doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica')
       .text("Efate is the second-largest island in Vanuatu, known for rich cultural heritage and stunning natural beauty.", 60, 95, { width: contentWidth, lineGap: 6 });
    
    const attractions = [
      { name: "Small Nambas Village", desc: "Traditional village life with authentic customs preserved for centuries." },
      { name: "Big Nambas Territory", desc: "Remote highlands to meet the legendary Big Nambas people." },
      { name: "Maskelyne Islands", desc: "Day trip for pristine beaches and excellent snorkeling." },
      { name: "Local Markets", desc: "Port Vila markets for produce, handicrafts, and local experiences." },
      { name: "Jungle Waterfalls", desc: "Trek through rainforest to hidden waterfalls and wildlife." },
    ];
    
    y = 140;
    attractions.forEach((att, i) => {
      doc.circle(75, y + 7, 10).fill(RICH_GOLD);
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(String(i + 1), 71, y + 3);
      
      doc.fillColor(DEEP_OCEAN_BLUE).fontSize(13).font('Helvetica-Bold')
         .text(att.name, 100, y);
      doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica')
         .text(att.desc, 100, y + 18, { width: contentWidth - 50 });
      y += 55;
    });
    
    doc.fillColor(RICH_GOLD).fontSize(14).font('Helvetica-Bold')
       .text("Getting Around", 60, y + 20);
    
    const transport = ["Resort shuttle to nearby towns", "Local taxis arranged at reception", "Guided tours include transport", "Walking maps at front desk"];
    y += 50;
    transport.forEach(t => {
      doc.circle(75, y + 4, 3).fill(RICH_GOLD);
      doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica').text(t, 90, y);
      y += 20;
    });

    // ==================== PAGE 6: CONTACT ====================
    doc.addPage();
    sectionHeader("Contact & Emergency");
    
    // Main contact
    doc.rect(60, 95, contentWidth, 100).lineWidth(3).stroke(RICH_GOLD);
    doc.fillColor(DEEP_OCEAN_BLUE).fontSize(18).font('Helvetica-Bold')
       .text("E'Nauwi Beach Resort", 80, 115);
    doc.fillColor(DARK_TEXT).fontSize(13).font('Helvetica')
       .text("Phone: +678 22170", 80, 145)
       .text("Email: gm@enauwibeachresort.com", 80, 165);
    
    doc.fillColor(RICH_GOLD).fontSize(14).font('Helvetica-Bold')
       .text("Reception Hours", 60, 225);
    doc.fillColor(DARK_TEXT).fontSize(11).font('Helvetica')
       .text("Open 24 hours, 7 days a week. After-hours: ring bell at reception.", 60, 248);
    
    goldDivider(280);
    
    doc.fillColor('#dc2626').fontSize(16).font('Helvetica-Bold')
       .text("Emergency Contacts", 60, 305);
    
    doc.rect(60, 330, contentWidth, 180).fill('#fef2f2');
    
    const emergencies = [
      ["Resort Emergency:", "+678 22170"],
      ["Vanuatu Police:", "111"],
      ["Ambulance/Medical:", "112"],
      ["Fire Services:", "113"],
      ["Vila Central Hospital:", "+678 22100"],
      ["Australian Embassy:", "+678 22777"],
      ["NZ Embassy:", "+678 22933"],
    ];
    
    y = 345;
    emergencies.forEach(([label, num]) => {
      doc.fillColor('#dc2626').fontSize(11).font('Helvetica-Bold').text(label, 80, y, { width: 140 });
      doc.fillColor(DARK_TEXT).font('Helvetica').text(num, 220, y);
      y += 22;
    });
    
    // Footer
    doc.rect(0, pageHeight - 80, pageWidth, 80).fill(DEEP_OCEAN_BLUE);
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold')
       .text("Thank you for choosing E'Nauwi Beach Resort!", 60, pageHeight - 65, { width: contentWidth, align: 'center' });
    doc.fillColor(RICH_GOLD).fontSize(12).font('Helvetica')
       .text("We wish you a wonderful stay on Efate Island", 60, pageHeight - 40, { width: contentWidth, align: 'center' });

    doc.end();

    return new Promise<NextResponse>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="enauwi-welcome-guide.pdf"',
          },
        }));
      });
      doc.on('error', reject);
    });
    
  } catch {
    console.error("PDF error");
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const response = await GET();
    const pdfBuffer = await response.arrayBuffer();
    const outputPath = path.join(process.cwd(), 'public', 'welcome-guide.pdf');
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
    return NextResponse.json({ success: true, path: '/welcome-guide.pdf' });
  } catch {
    return NextResponse.json({ error: 'Failed to save PDF' }, { status: 500 });
  }
}
