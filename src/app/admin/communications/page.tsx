'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Send,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  History,
  ChevronDown,
  Search,
  Plus,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Guest, MessageLog, MessageTemplate } from '@/types'

type TabType = 'send' | 'templates' | 'history'
type ChannelType = 'sms' | 'email' | 'whatsapp'

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('send')
  const [channel, setChannel] = useState<ChannelType>('sms')
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [messageHistory, setMessageHistory] = useState<MessageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [guestsRes, templatesRes, historyRes] = await Promise.all([
        fetch('/api/admin/guests'),
        fetch('/api/communications/templates'),
        fetch('/api/communications?limit=100'),
      ])

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json()
        setGuests(guestsData)
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setMessageHistory(historyData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set())
    } else {
      setSelectedGuests(new Set(filteredGuests.map((g) => g.id)))
    }
  }

  const handleGuestToggle = (guestId: string) => {
    const newSelected = new Set(selectedGuests)
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId)
    } else {
      newSelected.add(guestId)
    }
    setSelectedGuests(newSelected)
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setMessage(template.content)
    if (template.subject) {
      setSubject(template.subject)
    }
    setChannel(template.channel)
  }

  const handleSendMessage = async () => {
    if (selectedGuests.size === 0 || !message.trim()) return

    setSending(true)
    setSendResult(null)

    try {
      const recipients = filteredGuests
        .filter((g) => selectedGuests.has(g.id))
        .map((g) => (channel === 'email' ? g.email : g.phone))
        .filter(Boolean)

      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          recipients,
          message,
          subject: channel === 'email' ? subject : undefined,
        }),
      })

      const result = await res.json()

      if (res.ok) {
        setSendResult({
          success: true,
          message: `Message sent to ${recipients.length} recipient(s)`,
        })
        setSelectedGuests(new Set())
        setMessage('')
        setSubject('')
        fetchData() // Refresh history
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message',
      })
    } finally {
      setSending(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send SMS and email messages to guests
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'send'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="h-4 w-4" />
            Send Message
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </nav>
      </div>

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Guest Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Select Recipients</h2>
                <span className="text-sm text-gray-500">
                  {selectedGuests.size} selected
                </span>
              </div>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Select All */}
              <label className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>

              {filteredGuests.map((guest) => (
                <label
                  key={guest.id}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedGuests.has(guest.id)}
                    onChange={() => handleGuestToggle(guest.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{guest.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {channel === 'email' ? guest.email : guest.phone || 'No phone'}
                    </p>
                  </div>
                </label>
              ))}

              {filteredGuests.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No guests found</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Composer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Compose Message</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Send Result */}
              {sendResult && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    sendResult.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {sendResult.message}
                </div>
              )}

              {/* Channel Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChannel('sms')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      channel === 'sms'
                        ? 'bg-blue-50 border-blue-600 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </button>
                  <button
                    onClick={() => setChannel('email')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      channel === 'email'
                        ? 'bg-blue-50 border-blue-600 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                </div>
              </div>

              {/* Template Selector */}
              {templates.filter((t) => t.channel === channel).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Use Template
                  </label>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        const template = templates.find((t) => t.id === e.target.value)
                        if (template) handleTemplateSelect(template)
                      }}
                      className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    >
                      <option value="">Select a template...</option>
                      {templates
                        .filter((t) => t.channel === channel)
                        .map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Subject (Email only) */}
              {channel === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Enter your ${channel === 'sms' ? 'SMS' : 'email'} message...`}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                {channel === 'sms' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length} / 160 characters
                  </p>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={sending || selectedGuests.size === 0 || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending
                  ? 'Sending...'
                  : `Send to ${selectedGuests.size} recipient${selectedGuests.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Message Templates</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              Add Template
            </button>
          </div>

          {templates.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {templates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            template.channel === 'sms'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {template.channel.toUpperCase()}
                        </span>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mt-1">
                          Subject: {template.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleTemplateSelect(template)
                        setActiveTab('send')
                      }}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
              <p className="text-gray-500 mt-1">Create templates for frequently used messages</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Message History</h2>
          </div>

          {messageHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Message</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messageHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.recipient_name || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-500">{log.recipient_contact}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            log.channel === 'sms'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {log.channel === 'sms' ? (
                            <MessageSquare className="h-3 w-3" />
                          ) : (
                            <Mail className="h-3 w-3" />
                          )}
                          {log.channel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 truncate">{log.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(log.status)}
                          <span className="text-sm text-gray-700 capitalize">{log.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(log.sent_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No messages sent yet</h3>
              <p className="text-gray-500 mt-1">Messages you send will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
