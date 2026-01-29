'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react'
import { useConversation } from '@elevenlabs/react'

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''

const RESORT_SYSTEM_PROMPT = `You are the friendly AI voice concierge for E'Nauwi Beach Resort, a luxury eco-resort on Malekula Island, Vanuatu. You speak warmly and naturally with a welcoming Pacific Island hospitality style. Always greet guests with "Welkam!" (the Bislama greeting used in Vanuatu).

RESORT OVERVIEW:
- E'Nauwi Beach Resort is located on the pristine shores of Malekula Island, the second largest island in Vanuatu
- Phone: +678 22170
- Email: info@enauwi.com
- 100% eco-friendly, 5-star rated, just 50 meters from the beach
- Authentic Melanesian warmth and culture

GETTING HERE:
- Fly to Port Vila (VLI), then take a connecting flight to Norsup Airport on Malekula Island
- Resort provides airport transfers from Norsup Airport
- Alternative: charter flights can be arranged

ACCOMMODATIONS & PRICING (in Vanuatu Vatu - VT):
1. Oceanfront Bungalow - 12,000 VT per night (~$100 USD)
   - Sleeps 2 guests
   - Private deck with ocean views, direct beach access
   - Air conditioning, WiFi, mini fridge
   
2. Tropical Garden Suite - 18,000 VT per night (~$150 USD)
   - Sleeps up to 4 guests
   - Garden views and kitchenette, spacious living area
   - Private bathroom and balcony

3. Premium Beachfront Villa - 25,000 VT per night (~$210 USD)
   - Sleeps up to 6 guests
   - Private pool and full kitchen, multiple bedrooms
   - Panoramic ocean views, luxury amenities

ACTIVITIES & EXPERIENCES:
- Snorkeling & diving in crystal clear waters (equipment provided)
- Traditional Vanuatu cultural shows and village visits
- Island hopping excursions to nearby islands
- Volcano tours (Mount Benbow on Ambrym Island)
- Traditional cooking classes featuring lap lap (national dish)
- Sunset cruise experiences
- Deep sea fishing charters
- Spa treatments with local ingredients (coconut, tamanu oil)
- Guided rainforest walks and birdwatching
- Canoe/kayak rentals
- Beach bonfire evenings with kava ceremony

DINING:
- Fresh seafood caught daily from local waters
- Traditional lap lap, tuluk, and island cuisine
- International cuisine options
- Beachfront dining under the stars
- Tropical cocktails and fresh fruit juices
- Complimentary breakfast included with all rooms

BOOKING PROCESS:
- Guests can book online at enauwi-resort.vercel.app/book
- Or you can take their details: name, email, phone, dates, room preference
- Mention current availability if asked
- Payment can be arranged at check-in

LANGUAGES: You understand English, Bislama, French, and basic Chinese. Respond in the same language the guest uses. If they speak Bislama, respond in Bislama.

IMPORTANT GUIDELINES:
- Be warm, enthusiastic, and genuinely helpful
- Keep responses conversational and not too long (this is a voice call)
- If asked about things you don't know, offer to connect them with staff at +678 22170
- Recommend activities based on guest interests
- Mention the resort website for booking: enauwi-resort.vercel.app/book
- If someone asks about cancellation: free cancellation up to 48 hours before check-in`

export default function VoiceCallWidget() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCallUI, setShowCallUI] = useState(false)

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs voice call connected')
      setIsCallActive(true)
      setShowCallUI(true)
    },
    onDisconnect: () => {
      console.log('ElevenLabs voice call disconnected')
      setIsCallActive(false)
      setShowCallUI(false)
      setIsMuted(false)
    },
    onError: (error: string) => {
      console.error('ElevenLabs voice call error:', error)
      setIsCallActive(false)
      setShowCallUI(false)
    },
    onModeChange: (mode: { mode: string }) => {
      console.log('Mode changed:', mode)
    },
    overrides: {
      agent: {
        prompt: {
          prompt: RESORT_SYSTEM_PROMPT,
        },
        firstMessage: "Welkam! Welcome to E'Nauwi Beach Resort! I'm your AI concierge. How can I help you today? Whether you're looking to book a stay, learn about our activities, or just want to know more about beautiful Malekula Island — I'm here for you!",
        language: 'en',
      },
    },
  })

  const startCall = useCallback(async () => {
    if (!AGENT_ID) {
      console.error('ElevenLabs Agent ID not configured')
      return
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Start the voice conversation session
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webSocket' as const,
      })
    } catch (error) {
      console.error('Failed to start voice call:', error)
      alert('Could not start voice call. Please ensure microphone access is allowed.')
    }
  }, [conversation])

  const endCall = useCallback(async () => {
    try {
      await conversation.endSession()
    } catch (error) {
      console.error('Failed to end voice call:', error)
    }
    setIsCallActive(false)
    setShowCallUI(false)
    setIsMuted(false)
  }, [conversation])

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (conversation.setMicMuted) {
      conversation.setMicMuted(newMuted)
    }
  }, [isMuted, conversation])

  const handleCallButton = useCallback(() => {
    if (isCallActive) {
      endCall()
    } else {
      startCall()
    }
  }, [isCallActive, startCall, endCall])

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Active Call UI */}
      <AnimatePresence>
        {showCallUI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden w-72"
          >
            {/* Call Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">E&apos;Nauwi Concierge</h3>
                  <p className="text-xs text-emerald-100">
                    {conversation.status === 'connected'
                      ? conversation.isSpeaking
                        ? '🔊 Speaking...'
                        : '🎧 Listening...'
                      : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Voice Visualizer */}
            <div className="p-6 flex items-center justify-center bg-gradient-to-b from-emerald-50/50 to-white">
              <div className="relative">
                {/* Pulse ring animation when speaking */}
                {conversation.isSpeaking && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 w-20 h-20 bg-emerald-400 rounded-full -m-2"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      className="absolute inset-0 w-20 h-20 bg-emerald-300 rounded-full -m-2"
                    />
                  </>
                )}
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center relative z-10">
                  <Volume2 size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="p-4 flex items-center justify-center space-x-4 border-t border-gray-100">
              {/* Mute Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </motion.button>

              {/* End Call Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={endCall}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all"
                title="End Call"
              >
                <PhoneOff size={22} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Call Now Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCallButton}
        className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-all font-semibold text-sm ${
          isCallActive
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30'
        }`}
      >
        <Phone size={18} className={isCallActive ? 'animate-pulse' : ''} />
        <span>{isCallActive ? 'End Call' : 'Call Now'}</span>
      </motion.button>
    </div>
  )
}
