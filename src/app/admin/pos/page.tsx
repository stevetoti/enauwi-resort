'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatVatu } from '@/lib/utils'
import {
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Banknote,
  BedDouble,
  X,
  Search,
  Receipt,
  Trash2,
  Edit,
  Check,
  Printer,
  Clock,
  ChefHat,
  ChevronsRight,
  StickyNote,
  Users,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MenuItem {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  available: boolean
}

interface CartItem {
  id?: string
  name: string
  price: number
  quantity: number
  notes?: string
}

interface Tab {
  id: string
  tab_name: string
  tab_status: 'open' | 'closed'
  guest_name: string | null
  table_number: string | null
  room_id: string | null
  booking_id: string | null
  items: CartItem[]
  subtotal: number
  total: number
  order_number: number
  payment_method: string | null
  payment_status: string
  send_to_kitchen: boolean
  created_at: string
  opened_at: string | null
  closed_at: string | null
}

interface Room {
  id: string
  name: string
}

interface Booking {
  id: string
  guest_name: string
  room_id: string
  rooms: Room
}

const CATEGORIES = ['All', 'Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function POSPage() {
  // Menu data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Tab system
  const [openTabs, setOpenTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [showNewTabForm, setShowNewTabForm] = useState(false)
  const [newTabForm, setNewTabForm] = useState({ tab_name: '', table_number: '', booking_id: '' })

  // Cart (items staged locally before saving to a tab or quick-sale)
  const [cart, setCart] = useState<CartItem[]>([])

  // Bookings for room-charge lookup
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])

  // Sales summary
  const [closedTodayTabs, setClosedTodayTabs] = useState<Tab[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [showManageMenu, setShowManageMenu] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState<Tab | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [savingTab, setSavingTab] = useState(false)

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    payment_method: 'cash',
    guest_name: '',
    room_charge_booking_id: '',
  })

  // Menu item CRUD form
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    price: '',
    available: true,
  })

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------

  const activeTab = openTabs.find((t) => t.id === activeTabId) ?? null
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const todaySalesTotal = closedTodayTabs.reduce((acc, t) => acc + Number(t.total), 0)
  const todaySalesCount = closedTodayTabs.length

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && item.available
  })

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const fetchMenuItems = useCallback(async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    setMenuItems(data || [])
  }, [])

  const fetchOpenTabs = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/tabs?status=open')
      if (res.ok) {
        const data: Tab[] = await res.json()
        setOpenTabs(data)
      }
    } catch {
      // silent
    }
  }, [])

  const fetchClosedToday = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/tabs?status=closed&today=true')
      if (res.ok) {
        const data: Tab[] = await res.json()
        setClosedTodayTabs(data)
      }
    } catch {
      // silent
    }
  }, [])

  const fetchActiveBookings = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('bookings')
      .select('id, guest_name, room_id, rooms:rooms(id, name)')
      .lte('check_in', today)
      .gte('check_out', today)
      .eq('status', 'confirmed')
    setActiveBookings((data as unknown as Booking[]) || [])
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchMenuItems(), fetchOpenTabs(), fetchClosedToday(), fetchActiveBookings()])
      setLoading(false)
    }
    load()
  }, [fetchMenuItems, fetchOpenTabs, fetchClosedToday, fetchActiveBookings])

  // -------------------------------------------------------------------------
  // Cart helpers
  // -------------------------------------------------------------------------

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, notes: '' }]
    })
  }

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItemNotes = (index: number, notes: string) => {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, notes } : item)))
  }

  // -------------------------------------------------------------------------
  // Tab operations
  // -------------------------------------------------------------------------

  const handleCreateTab = async () => {
    if (!newTabForm.tab_name && !newTabForm.table_number) {
      alert('Please enter a tab name or table number')
      return
    }

    setSavingTab(true)
    try {
      const booking = activeBookings.find((b) => b.id === newTabForm.booking_id)
      const res = await fetch('/api/pos/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab_name: newTabForm.tab_name || `Table ${newTabForm.table_number}`,
          guest_name: booking?.guest_name || null,
          table_number: newTabForm.table_number || null,
          room_id: booking?.room_id || null,
          booking_id: newTabForm.booking_id || null,
          items: [],
        }),
      })
      if (res.ok) {
        const tab: Tab = await res.json()
        setOpenTabs((prev) => [tab, ...prev])
        setActiveTabId(tab.id)
        setShowNewTabForm(false)
        setNewTabForm({ tab_name: '', table_number: '', booking_id: '' })
        setCart([])
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create tab')
      }
    } finally {
      setSavingTab(false)
    }
  }

  const handleAddToTab = async (sendToKitchen: boolean) => {
    if (!activeTabId || cart.length === 0) return

    setSavingTab(true)
    try {
      const payload: Record<string, unknown> = {
        add_items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      }
      if (sendToKitchen) {
        payload.send_to_kitchen = true
      }

      const res = await fetch(`/api/pos/tabs/${activeTabId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated: Tab = await res.json()
        setOpenTabs((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        setCart([])
      } else {
        alert('Failed to add items to tab')
      }
    } finally {
      setSavingTab(false)
    }
  }

  const handleCloseTab = async () => {
    const tabToClose = activeTab
    if (!tabToClose) return

    setSavingTab(true)
    try {
      const res = await fetch(`/api/pos/tabs/${tabToClose.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          close: true,
          payment_method: paymentData.payment_method,
          guest_name: paymentData.guest_name || tabToClose.guest_name || null,
        }),
      })
      if (res.ok) {
        const closed: Tab = await res.json()
        setOpenTabs((prev) => prev.filter((t) => t.id !== closed.id))
        setClosedTodayTabs((prev) => [closed, ...prev])
        setActiveTabId(null)
        setCart([])
        setShowPaymentModal(false)
        setShowReceipt(closed)
        resetPaymentData()
      } else {
        alert('Failed to close tab')
      }
    } finally {
      setSavingTab(false)
    }
  }

  const handleQuickSale = async () => {
    if (cart.length === 0) return

    setSavingTab(true)
    try {
      // 1. Create a tab with items
      const booking = activeBookings.find((b) => b.id === paymentData.room_charge_booking_id)
      const createRes = await fetch('/api/pos/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab_name: paymentData.guest_name || 'Quick Sale',
          guest_name: paymentData.guest_name || booking?.guest_name || null,
          table_number: null,
          booking_id: paymentData.room_charge_booking_id || null,
          room_id: booking?.room_id || null,
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          send_to_kitchen: true,
        }),
      })
      if (!createRes.ok) {
        alert('Failed to create order')
        return
      }
      const created: Tab = await createRes.json()

      // 2. Immediately close it with payment
      const closeRes = await fetch(`/api/pos/tabs/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          close: true,
          payment_method: paymentData.payment_method,
          guest_name: paymentData.guest_name || null,
        }),
      })
      if (closeRes.ok) {
        const closed: Tab = await closeRes.json()
        setClosedTodayTabs((prev) => [closed, ...prev])
        setCart([])
        setShowPaymentModal(false)
        setShowReceipt(closed)
        resetPaymentData()
      } else {
        alert('Failed to process payment')
      }
    } finally {
      setSavingTab(false)
    }
  }

  const handleDeleteTab = async (tabId: string) => {
    if (!confirm('Delete this tab? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/pos/tabs/${tabId}`, { method: 'DELETE' })
      if (res.ok) {
        setOpenTabs((prev) => prev.filter((t) => t.id !== tabId))
        if (activeTabId === tabId) {
          setActiveTabId(null)
          setCart([])
        }
      }
    } catch {
      alert('Failed to delete tab')
    }
  }

  const resetPaymentData = () => {
    setPaymentData({ payment_method: 'cash', guest_name: '', room_charge_booking_id: '' })
  }

  // When selecting a tab, load its existing items into cart view context
  const selectTab = (tabId: string) => {
    if (activeTabId === tabId) {
      // Deselect
      setActiveTabId(null)
      setCart([])
    } else {
      setActiveTabId(tabId)
      setCart([]) // Fresh cart for adding new items to this tab
    }
  }

  // Open payment modal — for closing a tab or quick sale
  const openPayment = () => {
    if (activeTab) {
      // Closing a tab — pre-fill guest name from tab
      setPaymentData({
        payment_method: 'cash',
        guest_name: activeTab.guest_name || '',
        room_charge_booking_id: activeTab.booking_id || '',
      })
    } else {
      resetPaymentData()
    }
    setShowPaymentModal(true)
  }

  // -------------------------------------------------------------------------
  // Menu Management
  // -------------------------------------------------------------------------

  const handleSaveMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) {
      alert('Name and price are required')
      return
    }

    const itemData = {
      name: menuForm.name,
      description: menuForm.description || null,
      category: menuForm.category,
      price: parseFloat(menuForm.price),
      available: menuForm.available,
    }

    if (editingItem) {
      await supabase.from('menu_items').update(itemData).eq('id', editingItem.id)
    } else {
      await supabase.from('menu_items').insert(itemData)
    }

    setMenuForm({ name: '', description: '', category: 'Main Course', price: '', available: true })
    setEditingItem(null)
    fetchMenuItems()
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    fetchMenuItems()
  }

  const toggleItemAvailability = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id)
    fetchMenuItems()
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const tabItemCount = (tab: Tab) => {
    const items = tab.items || []
    return items.reduce((sum, i) => sum + i.quantity, 0)
  }

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant POS</h1>
          <p className="text-sm text-gray-500">
            Manage tabs, orders, and menu items
          </p>
        </div>
        <button
          onClick={() => setShowManageMenu(!showManageMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm"
        >
          <Edit className="w-4 h-4" />
          Manage Menu
        </button>
      </div>

      {/* Menu Management Panel */}
      {showManageMenu && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Item name"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <select
              value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price (VT)"
              value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveMenuItem}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
              {editingItem && (
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setMenuForm({ name: '', description: '', category: 'Main Course', price: '', available: true })
                  }}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Menu Items List */}
          <div className="mt-4 max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-sm">{item.name}</td>
                    <td className="px-3 py-2 text-sm">{item.category}</td>
                    <td className="px-3 py-2 text-sm">{formatVatu(item.price)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleItemAvailability(item)}
                        className={`px-2 py-1 rounded text-xs ${
                          item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setMenuForm({
                            name: item.name,
                            description: item.description || '',
                            category: item.category,
                            price: item.price.toString(),
                            available: item.available,
                          })
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3-Column Layout: Tabs | Menu | Cart                               */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ─── LEFT PANEL: Open Tabs ─── */}
        <div className="lg:col-span-3 space-y-3">
          {/* Mobile: horizontal scrollable row; Desktop: vertical list */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <h3 className="font-semibold text-sm">Open Tabs</h3>
              </div>
              <button
                onClick={() => setShowNewTabForm(!showNewTabForm)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-700 text-white rounded-lg text-xs hover:bg-teal-800"
              >
                <Plus className="w-3 h-3" />
                New Tab
              </button>
            </div>

            {/* New Tab Form */}
            {showNewTabForm && (
              <div className="p-3 border-b bg-teal-50 space-y-2">
                <input
                  type="text"
                  placeholder="Tab name (e.g. Table 3, John)"
                  value={newTabForm.tab_name}
                  onChange={(e) => setNewTabForm({ ...newTabForm, tab_name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-sm"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Table # (optional)"
                  value={newTabForm.table_number}
                  onChange={(e) => setNewTabForm({ ...newTabForm, table_number: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-sm"
                />
                <select
                  value={newTabForm.booking_id}
                  onChange={(e) => setNewTabForm({ ...newTabForm, booking_id: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-sm"
                >
                  <option value="">Link to booking (optional)</option>
                  {activeBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.guest_name} — {b.rooms?.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTab}
                    disabled={savingTab}
                    className="flex-1 py-1.5 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800 disabled:opacity-50"
                  >
                    {savingTab ? 'Creating...' : 'Open Tab'}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTabForm(false)
                      setNewTabForm({ tab_name: '', table_number: '', booking_id: '' })
                    }}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Tab List — horizontal scroll on mobile, vertical on desktop */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 p-3 lg:max-h-[360px] lg:overflow-y-auto">
              {openTabs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4 w-full">No open tabs</p>
              )}
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex-shrink-0 lg:flex-shrink rounded-lg border p-3 cursor-pointer transition-all min-w-[160px] lg:min-w-0 ${
                    activeTabId === tab.id
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => selectTab(tab.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{tab.tab_name}</p>
                      {tab.table_number && (
                        <p className="text-xs text-gray-500">Table {tab.table_number}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTab(tab.id)
                      }}
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{tabItemCount(tab)} items</span>
                    <span className="text-sm font-semibold text-teal-700">{formatVatu(tab.total)}</span>
                  </div>
                  {tab.opened_at && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {format(new Date(tab.opened_at), 'HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Sales Summary */}
          <div className="bg-white rounded-xl border p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Today&apos;s Sales
            </h4>
            <p className="text-2xl font-bold text-gray-900">{formatVatu(todaySalesTotal)}</p>
            <p className="text-sm text-gray-500">{todaySalesCount} orders completed</p>
          </div>
        </div>

        {/* ─── CENTER PANEL: Menu ─── */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category & Search */}
          <div className="bg-white rounded-xl border p-3 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-teal-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl border p-3 text-left hover:border-teal-500 hover:shadow-md transition-all group"
              >
                <h4 className="font-medium text-sm text-gray-900 leading-tight">{item.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                <p className="text-base font-bold text-teal-700 mt-1.5">{formatVatu(item.price)}</p>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                No menu items found
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: Cart / Active Tab ─── */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border h-fit sticky top-4">
            {/* Cart Header */}
            <div className="p-3 border-b flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-teal-700" />
              <h3 className="font-semibold text-sm">
                {activeTab ? activeTab.tab_name : 'Quick Sale'}
              </h3>
              {activeTab && (
                <span className="ml-auto bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
                  Tab Open
                </span>
              )}
              {!activeTab && cart.length > 0 && (
                <span className="ml-auto bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Quick
                </span>
              )}
            </div>

            {/* Existing items on the active tab (read-only view) */}
            {activeTab && activeTab.items && activeTab.items.length > 0 && (
              <div className="border-b bg-gray-50">
                <div className="px-3 py-2 flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    On this tab
                  </span>
                </div>
                <div className="px-3 pb-2 space-y-1 max-h-32 overflow-y-auto">
                  {activeTab.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-600">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">{formatVatu(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t border-gray-200">
                    <span>Tab subtotal</span>
                    <span>{formatVatu(activeTab.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* New items being added (cart) */}
            {cart.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  {activeTab ? 'Add items to this tab' : 'Click menu items to start'}
                </p>
              </div>
            ) : (
              <>
                {activeTab && (
                  <div className="px-3 pt-2 flex items-center gap-1">
                    <ChevronsRight className="w-3 h-3 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700 uppercase tracking-wide">
                      New items to add
                    </span>
                  </div>
                )}
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatVatu(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {/* Item notes */}
                      <div className="flex items-center gap-1 pl-0.5">
                        <StickyNote className="w-3 h-3 text-gray-300" />
                        <input
                          type="text"
                          placeholder="Special instructions..."
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(index, e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Totals & Actions */}
            {(cart.length > 0 || (activeTab && activeTab.items.length > 0)) && (
              <div className="p-3 border-t space-y-3">
                {/* Totals */}
                <div className="space-y-1">
                  {cart.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">New items</span>
                      <span className="font-medium">{formatVatu(cartTotal)}</span>
                    </div>
                  )}
                  {activeTab && (
                    <div className="flex justify-between text-base font-bold text-gray-900">
                      <span>Tab Total</span>
                      <span>{formatVatu(activeTab.total + cartTotal)}</span>
                    </div>
                  )}
                  {!activeTab && cart.length > 0 && (
                    <div className="flex justify-between text-base font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatVatu(cartTotal)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {activeTab ? (
                    <>
                      {cart.length > 0 && (
                        <>
                          <button
                            onClick={() => handleAddToTab(true)}
                            disabled={savingTab}
                            className="w-full py-2.5 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <ChefHat className="w-4 h-4" />
                            Send to Kitchen
                          </button>
                          <button
                            onClick={() => handleAddToTab(false)}
                            disabled={savingTab}
                            className="w-full py-2.5 bg-teal-700 text-white rounded-lg font-medium text-sm hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add to Tab
                          </button>
                        </>
                      )}
                      <button
                        onClick={openPayment}
                        className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Close &amp; Pay
                      </button>
                    </>
                  ) : (
                    cart.length > 0 && (
                      <button
                        onClick={openPayment}
                        className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Quick Sale
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Payment Modal                                                      */}
      {/* ================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {activeTab ? `Close Tab: ${activeTab.tab_name}` : 'Quick Sale Payment'}
              </h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentData({ ...paymentData, payment_method: 'cash' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                      paymentData.payment_method === 'cash'
                        ? 'border-green-500 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium">Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentData({ ...paymentData, payment_method: 'card' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                      paymentData.payment_method === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentData({ ...paymentData, payment_method: 'room_charge' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                      paymentData.payment_method === 'room_charge'
                        ? 'border-amber-500 bg-amber-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <BedDouble className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-medium">Room</span>
                  </button>
                </div>
              </div>

              {/* Room Charge Booking Selector */}
              {paymentData.payment_method === 'room_charge' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Room/Guest
                  </label>
                  <select
                    value={paymentData.room_charge_booking_id}
                    onChange={(e) => {
                      const booking = activeBookings.find((b) => b.id === e.target.value)
                      setPaymentData({
                        ...paymentData,
                        room_charge_booking_id: e.target.value,
                        guest_name: booking?.guest_name || paymentData.guest_name,
                      })
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Select a guest...</option>
                    {activeBookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.guest_name} — {booking.rooms?.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Guest Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name (optional)
                </label>
                <input
                  type="text"
                  value={paymentData.guest_name}
                  onChange={(e) => setPaymentData({ ...paymentData, guest_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Enter guest name"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Order Summary
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {/* Items from the active tab */}
                  {activeTab?.items.map((item, idx) => (
                    <div key={`tab-${idx}`} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatVatu(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {/* Items from cart (for quick sale or new additions) */}
                  {cart.map((item, idx) => (
                    <div key={`cart-${idx}`} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatVatu(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>
                    {formatVatu(activeTab ? activeTab.total + cartTotal : cartTotal)}
                  </span>
                </div>
              </div>

              {/* Complete Button */}
              <button
                onClick={async () => {
                  if (activeTab) {
                    // If there are new cart items, add them first
                    if (cart.length > 0) {
                      await handleAddToTab(true)
                    }
                    await handleCloseTab()
                  } else {
                    await handleQuickSale()
                  }
                }}
                disabled={savingTab}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                {savingTab ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Receipt Modal                                                      */}
      {/* ================================================================= */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-6 text-center border-b">
              <h3 className="text-xl font-bold">E&apos;Nauwi Beach Resort</h3>
              <p className="text-sm text-gray-500">Restaurant Receipt</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Order #</span>
                <span className="font-medium">{showReceipt.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date</span>
                <span>{format(new Date(showReceipt.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              {showReceipt.tab_name && (
                <div className="flex justify-between text-sm">
                  <span>Tab</span>
                  <span>{showReceipt.tab_name}</span>
                </div>
              )}
              {showReceipt.table_number && (
                <div className="flex justify-between text-sm">
                  <span>Table</span>
                  <span>{showReceipt.table_number}</span>
                </div>
              )}
              {showReceipt.guest_name && (
                <div className="flex justify-between text-sm">
                  <span>Guest</span>
                  <span>{showReceipt.guest_name}</span>
                </div>
              )}

              <div className="border-t border-dashed pt-4">
                {(showReceipt.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatVatu(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatVatu(Number(showReceipt.total))}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Payment</span>
                  <span className="capitalize">{showReceipt.payment_method || 'N/A'}</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 pt-4">
                Thank you for dining with us!
              </p>
            </div>

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 text-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setShowReceipt(null)}
                className="flex-1 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
