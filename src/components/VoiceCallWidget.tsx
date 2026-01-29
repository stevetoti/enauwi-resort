'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react'
import { useConversation } from '@elevenlabs/react'

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''

export default function VoiceCallWidget() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCallUI, setShowCallUI] = useState(false)
  const [callStatus, setCallStatus] = useState<string>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const conversation = useConversation({
    micMuted: isMuted,
    onConnect: () => {
      console.log('[Voice] Connected')
      setCallStatus('connected')
      setErrorMsg('')
    },
    onDisconnect: () => {
      console.log('[Voice] Disconnected')
      setCallStatus('idle')
      setIsCallActive(false)
      setShowCallUI(false)
      setIsMuted(false)
    },
    onError: (message: string) => {
      console.error('[Voice] Error:', message)
      setErrorMsg(message || 'Connection error')
      setCallStatus('error')
      // Don't close UI — show error to user instead
    },
    onModeChange: ({ mode }: { mode: string }) => {
      console.log('[Voice] Mode:', mode)
    },
  })

  const startCall = useCallback(async () => {
    if (!AGENT_ID) {
      alert('Voice calling is not yet configured. Please call us at +678 22170.')
      return
    }

    setErrorMsg('')
    setCallStatus('connecting')
    setShowCallUI(true)
    setIsCallActive(true)

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setErrorMsg('Microphone access denied')
      setCallStatus('error')
      return
    }

    try {
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'websocket',
      })
    } catch (error) {
      console.error('[Voice] startSession failed:', error)
      setErrorMsg(String(error) || 'Failed to connect')
      setCallStatus('error')
    }
  }, [conversation])

  const endCall = useCallback(async () => {
    try {
      await conversation.endSession()
    } catch (error) {
      console.error('[Voice] endSession failed:', error)
    }
    setIsCallActive(false)
    setShowCallUI(false)
    setIsMuted(false)
    setCallStatus('idle')
    setErrorMsg('')
  }, [conversation])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const handleCallButton = useCallback(() => {
    if (isCallActive) {
      endCall()
    } else {
      startCall()
    }
  }, [isCallActive, startCall, endCall])

  const statusText = () => {
    if (errorMsg) return `⚠️ ${errorMsg}`
    if (callStatus === 'connecting') return '📡 Connecting...'
    if (conversation.status === 'connected') {
      return conversation.isSpeaking ? '🔊 Speaking...' : '🎧 Listening...'
    }
    return '📡 Connecting...'
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {showCallUI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden w-72"
          >
            {/* Call Header */}
            <div className={`text-white p-4 ${errorMsg ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-600 to-emerald-700'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">E&apos;Nauwi Concierge</h3>
                  <p className="text-xs opacity-80">{statusText()}</p>
                </div>
              </div>
            </div>

            {/* Voice Visualizer */}
            <div className="p-6 flex items-center justify-center bg-gradient-to-b from-emerald-50/50 to-white">
              <div className="relative">
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
                <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 ${errorMsg ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                  <Volume2 size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Error retry */}
            {errorMsg && (
              <div className="px-4 pb-2 text-center">
                <button
                  onClick={() => { endCall(); setTimeout(startCall, 500) }}
                  className="text-sm text-emerald-600 underline hover:text-emerald-800"
                >
                  Retry connection
                </button>
                <span className="text-gray-400 mx-2">|</span>
                <a href="tel:+67822170" className="text-sm text-blue-600 underline hover:text-blue-800">
                  Call +678 22170
                </a>
              </div>
            )}

            {/* Call Controls */}
            <div className="p-4 flex items-center justify-center space-x-4 border-t border-gray-100">
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
