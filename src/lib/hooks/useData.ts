'use client'

import useSWR from 'swr'

// Global fetcher with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// SWR config for fast, cached responses
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 10000, // 10 seconds
  errorRetryCount: 2,
}

// Staff list - cached for 30 seconds
export function useStaffList() {
  return useSWR('/api/staff', fetcher, {
    ...swrConfig,
    refreshInterval: 30000,
  })
}

// Conversations - cached, refresh every 5 seconds when visible
export function useConversations(staffId: string | undefined) {
  return useSWR(
    staffId ? `/api/chat/conversations?staff_id=${staffId}` : null,
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 5000,
    }
  )
}

// Messages - refresh every 3 seconds when visible
export function useMessages(conversationId: string | undefined) {
  return useSWR(
    conversationId ? `/api/chat/conversations/${conversationId}/messages` : null,
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 3000,
    }
  )
}

// Announcements - cached for 30 seconds
export function useAnnouncements(departmentId?: string) {
  const url = departmentId 
    ? `/api/announcements?department_id=${departmentId}`
    : '/api/announcements'
  return useSWR(url, fetcher, {
    ...swrConfig,
    refreshInterval: 30000,
  })
}

// Videos - cached for 30 seconds
export function useVideos() {
  return useSWR('/api/videos', fetcher, {
    ...swrConfig,
    refreshInterval: 30000,
  })
}

// Departments - cached for 60 seconds (rarely changes)
export function useDepartments() {
  return useSWR('/api/departments', fetcher, {
    ...swrConfig,
    refreshInterval: 60000,
  })
}

// Department documents - cached for 30 seconds
export function useDepartmentDocuments(departmentId: string | undefined) {
  return useSWR(
    departmentId ? `/api/departments/${departmentId}/documents` : null,
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 30000,
    }
  )
}
