'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Upload,
  X,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Grid3X3,
  List,
  Filter,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'

interface WebsiteContent {
  id: string
  key: string
  label: string
  description: string | null
  location: string | null
  current_image_url: string | null
  image_dimensions: string | null
  category?: string | null  // Optional - may not exist in DB yet
  updated_at: string
  updated_by: string | null
}

// Derive category from location if category column doesn't exist
function deriveCategory(item: WebsiteContent): string {
  if (item.category) return item.category
  const loc = item.location?.toLowerCase() || ''
  if (loc.includes('hero') || loc.includes('global') || loc.includes('seo')) return 'Hero'
  if (loc.includes('activit')) return 'Activities'
  if (loc.includes('rooms') || loc.includes('malili')) return 'Rooms - Malili'
  if (loc.includes('gallery')) return 'Gallery'
  if (loc.includes('wedding')) return 'Wedding'
  if (loc.includes('drone') || loc.includes('archive')) return 'Drone'
  if (loc.includes('resort') || loc.includes('card')) return 'Resort'
  return 'General'
}

const ITEMS_PER_PAGE = 24

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Hero': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Activities': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Resort': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Wedding': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Rooms - Malili': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Gallery': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Drone': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
}

export default function ContentManagementPage() {
  const [content, setContent] = useState<WebsiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Upload modal state
  const [uploadModal, setUploadModal] = useState<{
    open: boolean
    item: WebsiteContent | null
  }>({ open: false, item: null })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/content')
      if (!res.ok) throw new Error('Failed to fetch content')
      const data = await res.json()
      setContent(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Get unique categories (derived from location if no category column)
  const categories = useMemo(() => {
    const cats = new Set(content.map(item => deriveCategory(item)))
    return ['all', ...Array.from(cats).sort()] as string[]
  }, [content])

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: content.length }
    content.forEach(item => {
      const cat = deriveCategory(item)
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [content])

  // Filter and paginate content
  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesSearch = 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || deriveCategory(item) === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [content, searchQuery, selectedCategory])

  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE)
  
  const paginatedContent = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredContent.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredContent, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  const openUploadModal = (item: WebsiteContent) => {
    setUploadModal({ open: true, item })
    setUploadFile(null)
    setUploadPreview(null)
    setUploadError(null)
    setUploadProgress(0)
  }

  const closeUploadModal = () => {
    setUploadModal({ open: false, item: null })
    setUploadFile(null)
    setUploadPreview(null)
    setUploadError(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB')
      return
    }

    setUploadFile(file)
    setUploadError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files
        handleFileSelect({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadModal.item) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('key', uploadModal.item.key)
      formData.append('contentId', uploadModal.item.id)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      await fetchContent()
      closeUploadModal()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryStyle = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ImageIcon className="h-7 w-7 text-teal-600" />
            Website Content
          </h1>
          <p className="text-gray-500 mt-1">
            Manage {content.length} images across the website
          </p>
        </div>
        <button
          onClick={fetchContent}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const style = cat === 'all' 
            ? { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
            : getCategoryStyle(cat)
          const isSelected = selectedCategory === cat
          
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                ${isSelected 
                  ? `${style.bg} ${style.text} border-2 ${style.border} shadow-sm` 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {cat === 'all' ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              {cat === 'all' ? 'All Images' : cat}
              <span className={`
                px-2 py-0.5 rounded-full text-xs
                ${isSelected ? 'bg-white/50' : 'bg-gray-100'}
              `}>
                {categoryCounts[cat] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Results count */}
          <span className="text-sm text-gray-500">
            Showing {paginatedContent.length} of {filteredContent.length}
          </span>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedContent.map((item, index) => {
            const itemCategory = deriveCategory(item)
            const catStyle = getCategoryStyle(itemCategory)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                {/* Image Preview */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {item.current_image_url ? (
                    <Image
                      src={item.current_image_url}
                      alt={item.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                    {itemCategory}
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => openUploadModal(item)}
                      className="bg-white text-gray-900 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Change Image
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.label}</h3>
                  {item.location && (
                    <p className="text-xs text-teal-600 mt-1 truncate">{item.location}</p>
                  )}
                  {item.image_dimensions && (
                    <p className="text-xs text-gray-400 mt-1">{item.image_dimensions}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.updated_at)}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {paginatedContent.map((item, index) => {
              const itemCategory = deriveCategory(item)
              const catStyle = getCategoryStyle(itemCategory)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.current_image_url ? (
                      <Image
                        src={item.current_image_url}
                        alt={item.label}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                        {itemCategory}
                      </span>
                      {item.location && (
                        <span className="text-xs text-teal-600">{item.location}</span>
                      )}
                      {item.image_dimensions && (
                        <span className="text-xs text-gray-400">{item.image_dimensions}</span>
                      )}
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {formatDate(item.updated_at)}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => openUploadModal(item)}
                    className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl font-medium text-sm hover:bg-teal-100 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Change
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (totalPages <= 7) return true
                if (page === 1 || page === totalPages) return true
                if (Math.abs(page - currentPage) <= 1) return true
                return false
              })
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`
                        w-10 h-10 rounded-lg font-medium transition-colors
                        ${currentPage === page
                          ? 'bg-teal-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredContent.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No content found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Content will appear here'}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal.open && uploadModal.item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeUploadModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Change Image
                  </h2>
                  <p className="text-sm text-gray-500">{uploadModal.item.label}</p>
                </div>
                <button
                  onClick={closeUploadModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Current Image */}
                {uploadModal.item.current_image_url && !uploadPreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={uploadModal.item.current_image_url}
                        alt="Current"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {uploadPreview ? 'New Image Preview' : 'Upload New Image'}
                  </p>
                  
                  {uploadPreview ? (
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={uploadPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => {
                          setUploadFile(null)
                          setUploadPreview(null)
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        Drop image here or click to browse
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {uploadModal.item.image_dimensions}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                {uploadModal.item.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">{uploadModal.item.description}</p>
                  </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-teal-600 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-teal-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {uploadError && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
