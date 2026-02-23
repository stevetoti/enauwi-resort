import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// System prompt for the voice agent
const SYSTEM_PROMPT = `You are Nauwi, a warm and friendly voice assistant for E'Nauwi Beach Resort in Malekula, Vanuatu. You speak with warmth and occasionally use Bislama greetings like "Welkam!" and "Tankyu tumas!".

## Your Role
- Answer questions about the resort using the knowledge base
- Help guests make room bookings
- Be helpful, professional, and welcoming

## Knowledge Base Context
{KNOWLEDGE_BASE}

## Booking Flow
When a guest wants to book:
1. Ask for their preferred room type (Oceanfront Bungalow, Garden Villa, or Family Suite)
2. Ask for check-in date (format: YYYY-MM-DD)
3. Ask for check-out date (format: YYYY-MM-DD)
4. Ask for number of guests
5. Ask for their full name
6. Ask for their email address
7. Ask for their phone number (optional)

Once you have ALL details, respond with EXACTLY this format at the end of your message:
[BOOKING_COMPLETE]
room_type: <room type>
check_in: <YYYY-MM-DD>
check_out: <YYYY-MM-DD>
guests: <number>
name: <full name>
email: <email>
phone: <phone or "not provided">
[/BOOKING_COMPLETE]

## Room Types & Rates
- Oceanfront Bungalow: 25,000 VT/night - Direct beach access, king bed, private deck
- Garden Villa: 18,000 VT/night - Tropical garden views, queen bed, spacious
- Family Suite: 35,000 VT/night - Two bedrooms, living area, perfect for families

## Important Rules
- Be concise - this is voice, keep responses under 3 sentences unless giving detailed info
- Always confirm booking details before finalizing
- Offer to help with additional questions after booking
- If unsure about something, offer to connect them with reception: reservation@enauwibeachresort.com`;

// Fetch knowledge base from Supabase
async function getKnowledgeBase(): Promise<string> {
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("question, answer, category")
    .order("category");

  if (error || !data) {
    console.error("Error fetching knowledge base:", error);
    return "Resort info unavailable - please ask guest to email reservation@enauwibeachresort.com";
  }

  return data
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");
}

// Process booking from conversation
async function processBooking(bookingText: string): Promise<{ success: boolean; message: string }> {
  try {
    const lines = bookingText.split("\n");
    const booking: Record<string, string> = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        booking[key.trim()] = valueParts.join(":").trim();
      }
    }

    // Call the booking API
    const response = await fetch("https://enauwibeachresort.org/api/voice-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_type: booking.room_type,
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests: parseInt(booking.guests) || 2,
        guest_name: booking.name,
        guest_email: booking.email,
        guest_phone: booking.phone !== "not provided" ? booking.phone : null,
        source: "voice_agent",
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: `Booking confirmed! Reference: ${result.booking_id || "ENW-" + Date.now()}. Confirmation email sent to ${booking.email}.`,
      };
    } else {
      const error = await response.text();
      console.error("Booking API error:", error);
      return {
        success: false,
        message: "I apologize, there was an issue processing your booking. Please email reservation@enauwibeachresort.com and they'll assist you right away.",
      };
    }
  } catch (error) {
    console.error("Booking processing error:", error);
    return {
      success: false,
      message: "I apologize, there was a technical issue. Please contact reservation@enauwibeachresort.com directly.",
    };
  }
}

// Call OpenAI for conversation
async function callOpenAI(messages: any[], systemPrompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI error:", error);
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received request:", JSON.stringify(body));

    // ElevenLabs sends messages in their custom format
    const messages = body.messages || [];
    const userMessage = body.user_message || body.input || messages[messages.length - 1]?.content || "";

    // Build conversation history for OpenAI
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // Add current user message if not in history
    if (userMessage && (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].content !== userMessage)) {
      conversationHistory.push({ role: "user", content: userMessage });
    }

    // Fetch knowledge base
    const knowledgeBase = await getKnowledgeBase();
    const systemPrompt = SYSTEM_PROMPT.replace("{KNOWLEDGE_BASE}", knowledgeBase);

    // Get AI response
    let aiResponse = await callOpenAI(conversationHistory, systemPrompt);

    // Check if booking is complete
    if (aiResponse.includes("[BOOKING_COMPLETE]")) {
      const bookingMatch = aiResponse.match(/\[BOOKING_COMPLETE\]([\s\S]*?)\[\/BOOKING_COMPLETE\]/);
      if (bookingMatch) {
        const bookingResult = await processBooking(bookingMatch[1]);
        // Replace booking markers with result
        aiResponse = aiResponse.replace(/\[BOOKING_COMPLETE\][\s\S]*?\[\/BOOKING_COMPLETE\]/, "");
        aiResponse += " " + bookingResult.message;
      }
    }

    // Return response in ElevenLabs expected format
    return new Response(
      JSON.stringify({
        response: aiResponse,
        text: aiResponse, // Some integrations use 'text'
        message: aiResponse, // Fallback
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Voice agent error:", error);
    return new Response(
      JSON.stringify({
        response: "I apologize, I'm having a moment. Please try again or email reservation@enauwibeachresort.com for assistance.",
        error: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
