'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Facebook,
  Instagram,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileEdit,
  Loader2
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday
} from 'date-fns'
import { toast, Toaster } from 'sonner'

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  published_at: string | null
  status: 'draft' | 'review' | 'scheduled' | 'publishing' | 'published' | 'failed'
  ai_generated: boolean
  hashtags: string[]
  post_type: string
  created_at: string
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
  publishing: 'bg-purple-100 text-purple-700 border-purple-300',
  published: 'bg-green-100 text-green-700 border-green-300',
  failed: 'bg-red-100 text-red-700 border-red-300'
}

const STATUS_ICONS = {
  draft: FileEdit,
  review: Eye,
  scheduled: Clock,
  publishing: Loader2,
  published: CheckCircle,
  failed: AlertCircle
}

const PLATFORM_ICONS: Record<string, React.FC<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: () => <span className="font-bold text-xs">𝕏</span>
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#000000'
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = startOfMonth(currentMonth).toISOString()
      const endDate = endOfMonth(currentMonth).toISOString()
      
      const response = await fetch(
        `/api/social/posts?startDate=${startDate}&endDate=${endDate}&limit=100`
      )
      const data = await response.json()
      setPosts(data.posts || [])
    } catch {
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group posts by date
  const postsByDate = posts.reduce((acc, post) => {
    if (post.scheduled_at) {
      const dateKey = format(parseISO(post.scheduled_at), 'yyyy-MM-dd')
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(post)
    }
    return acc
  }, {} as Record<string, SocialPost[]>)

  const getPostsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return postsByDate[dateKey] || []
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowPostModal(true)
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Delete failed')

      toast.success('Post deleted')
      fetchPosts()
      setShowPostModal(false)
    } catch {
      toast.error('Failed to delete post')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/social" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600">View and manage your scheduled posts</p>
          </div>
          <Link
            href="/admin/social/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Link>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayPosts = getPostsForDate(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isTodayDate = isToday(day)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-[120px] p-2 rounded-lg cursor-pointer transition-all ${
                        isCurrentMonth 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-gray-50 opacity-50'
                      } ${
                        isTodayDate ? 'ring-2 ring-blue-500' : ''
                      } ${
                        isSelected ? 'ring-2 ring-orange-500' : ''
                      } border border-gray-100`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isTodayDate 
                          ? 'text-blue-600' 
                          : isCurrentMonth 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {format(day, 'd')}
                      </div>

                      {/* Post indicators */}
                      <div className="space-y-1">
                        {dayPosts.slice(0, 3).map(post => {
                          const StatusIcon = STATUS_ICONS[post.status]
                          return (
                            <div
                              key={post.id}
                              className={`text-xs p-1.5 rounded truncate border ${STATUS_COLORS[post.status]}`}
                              title={post.content}
                            >
                              <div className="flex items-center gap-1">
                                <StatusIcon className={`w-3 h-3 ${post.status === 'publishing' ? 'animate-spin' : ''}`} />
                                <span className="truncate flex-1">{post.content.slice(0, 20)}...</span>
                              </div>
                              <div className="flex gap-0.5 mt-1">
                                {post.platforms.slice(0, 3).map(platform => {
                                  const PlatformIcon = PLATFORM_ICONS[platform]
                                  return PlatformIcon ? (
                                    <span 
                                      key={platform}
                                      className="w-4 h-4 rounded flex items-center justify-center"
                                      style={{ backgroundColor: PLATFORM_COLORS[platform], color: 'white' }}
                                    >
                                      <PlatformIcon className="w-2.5 h-2.5" />
                                    </span>
                                  ) : null
                                })}
                              </div>
                            </div>
                          )
                        })}
                        {dayPosts.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayPosts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_COLORS).map(([status, colors]) => {
            const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS]
            return (
              <div key={status} className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${colors}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Post Detail Modal */}
      {showPostModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Posts for {format(selectedDate, 'PPP')}
                </h3>
                <button
                  onClick={() => {
                    setShowPostModal(false)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {getPostsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No posts scheduled for this date</p>
                  <Link
                    href="/admin/social/create"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4" />
                    Create a post
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getPostsForDate(selectedDate).map(post => {
                    const StatusIcon = STATUS_ICONS[post.status]
                    return (
                      <div
                        key={post.id}
                        className={`p-4 rounded-lg border ${STATUS_COLORS[post.status]}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${post.status === 'publishing' ? 'animate-spin' : ''}`} />
                            <span className="font-medium capitalize">{post.status}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {post.platforms.map(platform => {
                              const PlatformIcon = PLATFORM_ICONS[platform]
                              return PlatformIcon ? (
                                <span 
                                  key={platform}
                                  className="w-6 h-6 rounded flex items-center justify-center"
                                  style={{ backgroundColor: PLATFORM_COLORS[platform], color: 'white' }}
                                >
                                  <PlatformIcon className="w-3.5 h-3.5" />
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>

                        <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">
                          {post.content.length > 200 
                            ? post.content.slice(0, 200) + '...' 
                            : post.content}
                        </p>

                        {post.scheduled_at && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                            <Clock className="w-4 h-4" />
                            {format(parseISO(post.scheduled_at), 'h:mm a')}
                          </div>
                        )}

                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.hashtags.slice(0, 5).map(tag => (
                              <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-gray-200/50">
                          <Link
                            href={`/admin/social/create?edit=${post.id}`}
                            className="flex-1 text-center py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 inline mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="flex-1 text-center py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
