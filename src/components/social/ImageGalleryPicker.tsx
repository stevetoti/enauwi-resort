'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Search,
  Grid,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface GalleryImage {
  id: string
  url: string
  thumbnail_url: string
  title: string
  description: string
  category: string
  tags: string[]
  created_at: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Images' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'beach', label: 'Beach' },
  { id: 'activities', label: 'Activities' },
  { id: 'dining', label: 'Dining' },
  { id: 'culture', label: 'Culture' },
  { id: 'events', label: 'Events' },
  { id: 'general', label: 'General' }
]

interface ImageGalleryPickerProps {
  selectedImages: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageGalleryPicker({
  selectedImages,
  onImagesChange,
  maxImages = 4,
  isOpen,
  onClose
}: ImageGalleryPickerProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [uploadCategory, setUploadCategory] = useState('general')

  const fetchImages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      params.set('limit', '100')

      const response = await fetch(`/api/social/gallery?${params}`)
      const data = await response.json()
      setImages(data.images || [])
    } catch {
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    if (isOpen) {
      fetchImages()
    }
  }, [isOpen, fetchImages])

  const toggleImage = (url: string) => {
    if (selectedImages.includes(url)) {
      onImagesChange(selectedImages.filter(img => img !== url))
    } else if (selectedImages.length < maxImages) {
      onImagesChange([...selectedImages, url])
    } else {
      toast.error(`Maximum ${maxImages} images allowed`)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', uploadCategory)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

        const response = await fetch('/api/social/gallery', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }
      }

      toast.success(`${files.length} image(s) uploaded!`)
      fetchImages()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image from the gallery?')) return

    try {
      const response = await fetch(`/api/social/gallery?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Delete failed')

      toast.success('Image deleted')
      fetchImages()
    } catch {
      toast.error('Failed to delete image')
    }
  }

  const filteredImages = images.filter(img => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      img.title?.toLowerCase().includes(searchLower) ||
      img.description?.toLowerCase().includes(searchLower) ||
      img.tags?.some(t => t.toLowerCase().includes(searchLower))
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-teal-600" />
              Image Gallery
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedImages.length} of {maxImages} images selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {/* Upload */}
          <div className="flex gap-2">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-sm"
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Grid className="w-12 h-12 mb-2" />
              <p>No images found</p>
              <p className="text-sm">Upload some images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map(image => {
                const isSelected = selectedImages.includes(image.url)
                return (
                  <div
                    key={image.id}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                      isSelected 
                        ? 'border-teal-500 ring-2 ring-teal-200' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => toggleImage(image.url)}
                  >
                    <Image
                      src={image.thumbnail_url || image.url}
                      alt={image.title || 'Gallery image'}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
                      {image.category}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteImage(image.id)
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Title overlay */}
                    {image.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-xs truncate">{image.title}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Preview */}
        {selectedImages.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
            <div className="flex gap-2 flex-wrap">
              {selectedImages.map((url, index) => (
                <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={url} alt={`Selected ${index + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => onImagesChange(selectedImages.filter(img => img !== url))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Done ({selectedImages.length} selected)
          </button>
        </div>
      </div>
    </div>
  )
}
