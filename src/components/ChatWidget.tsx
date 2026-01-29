'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Globe, Bot } from 'lucide-react'
import type { ChatMessage } from '@/types'

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  bi: { name: 'Bislama', flag: '🇻🇺' },
  fr: { name: 'Français', flag: '🇫🇷' },
  zh: { name: '中文', flag: '🇨🇳' }
}

const translations = {
  en: {
    welcome: 'Bula! Welcome to E\'Nauwi Beach Resort! How can I help you today?',
    placeholder: 'Type your message...',
    send: 'Send',
    minimize: 'Minimize chat',
    language: 'Language'
  },
  bi: {
    welcome: 'Bula! Welkam long E\'Nauwi Beach Resort! Olsem wanem mi save helpem yu today?',
    placeholder: 'Taepem mesij blong yu...',
    send: 'Sendem',
    minimize: 'Smolmakem chat',
    language: 'Language'
  },
  fr: {
    welcome: 'Bula! Bienvenue au E\'Nauwi Beach Resort! Comment puis-je vous aider aujourd\'hui?',
    placeholder: 'Tapez votre message...',
    send: 'Envoyer',
    minimize: 'Minimiser le chat',
    language: 'Langue'
  },
  zh: {
    welcome: 'Bula! 欢迎来到E\'Nauwi海滩度假村！今天我可以为您做些什么？',
    placeholder: '请输入您的消息...',
    send: '发送',
    minimize: '最小化聊天',
    language: '语言'
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('en')
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const t = translations[currentLanguage]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: t.welcome,
        timestamp: new Date()
      }])
    }
  }, [isOpen, t.welcome])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          language: currentLanguage,
          messages: messages
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">E'Nauwi Concierge</h3>
                  <p className="text-xs text-blue-100">Online now</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    title={t.language}
                  >
                    <Globe size={14} />
                  </button>
                  
                  <AnimatePresence>
                    {showLanguageSelector && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-32"
                      >
                        {Object.entries(languages).map(([code, lang]) => (
                          <button
                            key={code}
                            onClick={() => {
                              setCurrentLanguage(code as keyof typeof languages)
                              setShowLanguageSelector(false)
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center space-x-2 ${
                              currentLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  title={t.minimize}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center relative"
      >
        <MessageCircle size={24} />
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
      </motion.button>
    </div>
  )
}