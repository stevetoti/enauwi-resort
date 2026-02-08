'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import {
  MessageCircle,
  Send,
  Plus,
  Search,
  Users,
  Building2,
  Paperclip,
  X,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  Home,
  Settings,
  ChevronRight,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Staff {
  id: string
  name: string
  email: string
  profile_photo?: string
  status?: string
  department?: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  attachments: { name: string; url: string; type: string }[]
  created_at: string
  sender?: { id: string; name: string; profile_photo?: string }
}

interface Conversation {
  id: string
  type: 'direct' | 'group' | 'department'
  name?: string
  avatar_url?: string
  department?: { id: string; name: string }
  display_name: string
  display_avatar?: string
  participants: Staff[]
  last_message?: { content: string; created_at: string; sender?: { name: string } }
  last_read_at?: string
  is_muted: boolean
  my_role: 'admin' | 'member'
  unread_count: number
  created_at: string
  updated_at: string
}

// Memoized conversation item for better performance
const ConversationItem = memo(function ConversationItem({ 
  conv, 
  isSelected, 
  staffName,
  onSelect 
}: { 
  conv: Conversation
  isSelected: boolean
  staffName: string
  onSelect: () => void 
}) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${isSelected ? 'bg-teal-50' : ''}`}
    >
      <div className="relative flex-shrink-0">
        {conv.display_avatar ? (
          <Image src={conv.display_avatar} alt="" width={48} height={48} className="rounded-full object-cover" />
        ) : conv.type === 'department' ? (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Building2 className="h-6 w-6 text-blue-600" /></div>
        ) : conv.type === 'group' ? (
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-purple-600" /></div>
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">{conv.display_name?.charAt(0) || '?'}</div>
        )}
        {conv.type === 'direct' && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 truncate">{conv.display_name}</p>
          {conv.last_message && <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(conv.last_message.created_at)}</span>}
        </div>
        <p className="text-sm text-gray-500 truncate mt-0.5">
          {conv.last_message ? (
            <>
              {conv.last_message.sender?.name === staffName ? 'You: ' : ''}
              {conv.last_message.content}
            </>
          ) : 'No messages yet'}
        </p>
      </div>
    </div>
  )
})

export default function ChatPage() {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Initialize staff from localStorage
  useEffect(() => {
    const staffData = localStorage.getItem('staff')
    if (!staffData) {
      router.push('/admin/login')
      return
    }
    setStaff(JSON.parse(staffData))
  }, [router])

  // SWR for conversations - cached, refreshes every 5 seconds
  const { data: conversations = [], isLoading: loadingConvs } = useSWR(
    staff ? `/api/chat/conversations?staff_id=${staff.id}` : null,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: false, dedupingInterval: 3000 }
  )

  // SWR for messages - refreshes every 3 seconds when conversation selected
  const { data: messages = [], mutate: mutateMessages } = useSWR(
    selectedConversation ? `/api/chat/conversations/${selectedConversation.id}/messages` : null,
    fetcher,
    { refreshInterval: 3000, revalidateOnFocus: false, dedupingInterval: 2000 }
  )

  // SWR for all staff - cached for longer (30 seconds)
  const { data: allStaff = [] } = useSWR('/api/staff', fetcher, { 
    refreshInterval: 30000, 
    revalidateOnFocus: false,
    dedupingInterval: 10000 
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv)
    setMobileShowChat(true)
    // Mark as read
    if (staff) {
      fetch(`/api/chat/conversations/${conv.id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staff.id })
      })
    }
  }, [staff])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !staff) return

    const content = newMessage.trim()
    setNewMessage('')
    setSendingMessage(true)

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: staff.id,
      content,
      message_type: 'text',
      attachments: [],
      created_at: new Date().toISOString(),
      sender: { id: staff.id, name: staff.name, profile_photo: staff.profile_photo }
    }
    mutateMessages([...messages, optimisticMessage], false)

    try {
      await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: staff.id, content, message_type: 'text' })
      })
      // Revalidate to get real message
      mutateMessages()
      mutate(`/api/chat/conversations?staff_id=${staff.id}`)
    } catch (error) {
      console.error('Error sending message:', error)
      // Revert optimistic update on error
      mutateMessages()
    } finally {
      setSendingMessage(false)
    }
  }

  const startDirectChat = async (otherStaffId: string) => {
    if (!staff) return
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participant_ids: [staff.id, otherStaffId],
          created_by: staff.id
        })
      })
      if (res.ok) {
        const conv = await res.json()
        mutate(`/api/chat/conversations?staff_id=${staff.id}`)
        setSelectedConversation(conv)
        setMobileShowChat(true)
        setShowNewChatModal(false)
      }
    } catch (error) {
      console.error('Error starting chat:', error)
    }
  }

  const createGroup = async (name: string, participantIds: string[]) => {
    if (!staff) return
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'group',
          name,
          participant_ids: [...participantIds, staff.id],
          created_by: staff.id
        })
      })
      if (res.ok) {
        mutate(`/api/chat/conversations?staff_id=${staff.id}`)
        setShowGroupModal(false)
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredConversations = conversations.filter((c: Conversation) =>
    c.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar / Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {staff.profile_photo ? (
                <Image src={staff.profile_photo} alt={staff.name} width={40} height={40} className="rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">{staff.name.charAt(0)}</div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{staff.name}</p>
                <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Online</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowNewChatModal(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="New Chat"><Plus className="h-5 w-5 text-gray-600" /></button>
              <button onClick={() => setShowGroupModal(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="New Group"><Users className="h-5 w-5 text-gray-600" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-teal-600 mx-auto" /></div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv: Conversation) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isSelected={selectedConversation?.id === conv.id}
                staffName={staff.name}
                onSelect={() => selectConversation(conv)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start a new chat!</p>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="p-3 border-t border-gray-200 flex justify-around">
          <Link href="/staff/portal" className="p-2 text-gray-500 hover:text-teal-600 transition-colors"><Home className="h-5 w-5" /></Link>
          <button className="p-2 text-teal-600"><MessageCircle className="h-5 w-5" /></button>
          <Link href="/staff/portal" className="p-2 text-gray-500 hover:text-teal-600 transition-colors"><Settings className="h-5 w-5" /></Link>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              <button onClick={() => setMobileShowChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              {selectedConversation.display_avatar ? (
                <Image src={selectedConversation.display_avatar} alt="" width={40} height={40} className="rounded-full object-cover" />
              ) : selectedConversation.type === 'department' ? (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-600" /></div>
              ) : selectedConversation.type === 'group' ? (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><Users className="h-5 w-5 text-purple-600" /></div>
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{selectedConversation.display_name?.charAt(0)}</div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selectedConversation.display_name}</p>
                <p className="text-xs text-gray-500">
                  {selectedConversation.type === 'direct' ? 'Online' : `${selectedConversation.participants?.length || 0} members`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg: Message, idx: number) => {
                const isMe = msg.sender_id === staff?.id
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id)

                if (msg.message_type === 'system') {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">{msg.content}</span>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : ''}`}>
                    {!isMe && showAvatar && (
                      msg.sender?.profile_photo ? (
                        <Image src={msg.sender.profile_photo} alt="" width={32} height={32} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">{msg.sender?.name?.charAt(0)}</div>
                      )
                    )}
                    {!isMe && !showAvatar && <div className="w-8" />}
                    <div className={`max-w-[70%] ${isMe ? 'order-1' : ''}`}>
                      {!isMe && showAvatar && selectedConversation.type !== 'direct' && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</p>
                      )}
                      <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-teal-600 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className={`text-xs mt-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                        {isMe && <CheckCheck className="h-3 w-3 inline ml-1 text-teal-500" />}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="bg-white p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Paperclip className="h-5 w-5" /></button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-12 w-12 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Team Chat</h2>
              <p className="text-gray-500 mt-2">Select a conversation or start a new chat</p>
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => setShowNewChatModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">New Chat</button>
                <button onClick={() => setShowGroupModal(true)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Create Group</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Chat</h2>
              <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {allStaff.filter((s: Staff) => s.id !== staff?.id).map((member: Staff) => (
                <div key={member.id} onClick={() => startDirectChat(member.id)} className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  {member.profile_photo ? (
                    <Image src={member.profile_photo} alt={member.name} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{member.name.charAt(0)}</div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.department || member.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <CreateGroupModal
          allStaff={allStaff.filter((s: Staff) => s.id !== staff?.id)}
          onClose={() => setShowGroupModal(false)}
          onCreate={createGroup}
        />
      )}
    </div>
  )
}

// Create Group Modal Component
function CreateGroupModal({ allStaff, onClose, onCreate }: { allStaff: Staff[]; onClose: () => void; onCreate: (name: string, ids: string[]) => void }) {
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="p-2 border-b bg-gray-50">
          <p className="text-sm text-gray-500 px-2">Select members ({selectedMembers.length} selected)</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {allStaff.map((member) => (
            <div key={member.id} onClick={() => toggleMember(member.id)} className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedMembers.includes(member.id) ? 'bg-teal-50' : ''}`}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedMembers.includes(member.id) ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}>
                {selectedMembers.includes(member.id) && <Check className="h-3 w-3 text-white" />}
              </div>
              {member.profile_photo ? (
                <Image src={member.profile_photo} alt={member.name} width={36} height={36} className="rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">{member.name.charAt(0)}</div>
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">{member.department}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={() => onCreate(groupName.trim(), selectedMembers)}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            Create Group ({selectedMembers.length + 1} members)
          </button>
        </div>
      </div>
    </div>
  )
}
