'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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
} from 'lucide-react'
import { format } from 'date-fns'

interface MenuItem {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  available: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

interface Order {
  id: string
  order_number: number
  items: CartItem[]
  total: number
  payment_method: string
  payment_status: string
  guest_name: string | null
  table_number: string | null
  created_at: string
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

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [showManageMenu, setShowManageMenu] = useState(false)
  const [showReceipt, setShowReceipt] = useState<Order | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  
  // Checkout form
  const [checkoutData, setCheckoutData] = useState({
    payment_method: 'cash',
    guest_name: '',
    table_number: '',
    room_charge_booking_id: '',
  })

  // Menu item form
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    price: '',
    available: true,
  })

  const fetchMenuItems = useCallback(async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    setMenuItems(data || [])
  }, [])

  const fetchOrders = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('pos_orders')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
    setOrders(data || [])
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
      await Promise.all([fetchMenuItems(), fetchOrders(), fetchActiveBookings()])
      setLoading(false)
    }
    load()
  }, [fetchMenuItems, fetchOrders, fetchActiveBookings])

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === itemId) {
          const newQty = i.quantity + delta
          return newQty > 0 ? { ...i, quantity: newQty } : i
        }
        return i
      }).filter(i => i.quantity > 0)
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return

    const orderData = {
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal: cartTotal,
      total: cartTotal,
      payment_method: checkoutData.payment_method,
      payment_status: 'paid',
      guest_name: checkoutData.guest_name || null,
      table_number: checkoutData.table_number || null,
      booking_id: checkoutData.room_charge_booking_id || null,
    }

    const { data, error } = await supabase
      .from('pos_orders')
      .insert(orderData)
      .select()
      .single()

    if (error) {
      alert('Error creating order: ' + error.message)
      return
    }

    // Also add to finance if payment received
    if (checkoutData.payment_method !== 'room_charge') {
      await supabase.from('finance_transactions').insert({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Restaurant',
        subcategory: 'POS Sale',
        amount: cartTotal,
        type: 'income',
        description: `Order #${data.order_number}`,
        payment_method: checkoutData.payment_method,
      })
    }

    setShowReceipt(data)
    setCart([])
    setShowCheckout(false)
    setCheckoutData({
      payment_method: 'cash',
      guest_name: '',
      table_number: '',
      room_charge_booking_id: '',
    })
    fetchOrders()
  }

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

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && item.available
  })

  const todaySales = orders.reduce((acc, o) => acc + Number(o.total), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant POS</h1>
          <p className="text-gray-500">Today&apos;s Sales: {todaySales.toLocaleString()} VT ({orders.length} orders)</p>
        </div>
        <button
          onClick={() => setShowManageMenu(!showManageMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
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
              className="px-3 py-2 border rounded-lg"
            />
            <select
              value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price (VT)"
              value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveMenuItem}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
              {editingItem && (
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setMenuForm({ name: '', description: '', category: 'Main Course', price: '', available: true })
                  }}
                  className="px-4 py-2 border rounded-lg"
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
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-sm">{item.name}</td>
                    <td className="px-3 py-2 text-sm">{item.category}</td>
                    <td className="px-3 py-2 text-sm">{item.price.toLocaleString()} VT</td>
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
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Categories */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-ocean-600 text-white'
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
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl border p-4 text-left hover:border-ocean-500 hover:shadow-md transition-all"
              >
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                <p className="text-lg font-bold text-ocean-600 mt-2">{item.price.toLocaleString()} VT</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl border h-fit sticky top-4">
          <div className="p-4 border-b flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-ocean-600" />
            <h3 className="font-semibold">Current Order</h3>
            <span className="ml-auto bg-ocean-100 text-ocean-800 px-2 py-0.5 rounded-full text-sm">
              {cart.length} items
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Click menu items to add</p>
            </div>
          ) : (
            <>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.price.toLocaleString()} VT each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{cartTotal.toLocaleString()} VT</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Proceed to Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Today&apos;s Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 10).map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium">#{order.order_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(order.created_at), 'HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.items.length} items
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      order.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                      order.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {Number(order.total).toLocaleString()} VT
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setShowReceipt(order)}
                      className="text-ocean-600 hover:text-ocean-800"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <button onClick={() => setShowCheckout(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCheckoutData({ ...checkoutData, payment_method: 'cash' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      checkoutData.payment_method === 'cash' ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-xs">Cash</span>
                  </button>
                  <button
                    onClick={() => setCheckoutData({ ...checkoutData, payment_method: 'card' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      checkoutData.payment_method === 'card' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Card</span>
                  </button>
                  <button
                    onClick={() => setCheckoutData({ ...checkoutData, payment_method: 'room_charge' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      checkoutData.payment_method === 'room_charge' ? 'border-amber-500 bg-amber-50' : ''
                    }`}
                  >
                    <BedDouble className="w-5 h-5" />
                    <span className="text-xs">Room</span>
                  </button>
                </div>
              </div>

              {checkoutData.payment_method === 'room_charge' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Room/Guest</label>
                  <select
                    value={checkoutData.room_charge_booking_id}
                    onChange={(e) => {
                      const booking = activeBookings.find(b => b.id === e.target.value)
                      setCheckoutData({
                        ...checkoutData,
                        room_charge_booking_id: e.target.value,
                        guest_name: booking?.guest_name || '',
                      })
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select a guest...</option>
                    {activeBookings.map(booking => (
                      <option key={booking.id} value={booking.id}>
                        {booking.guest_name} - {booking.rooms?.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name (optional)</label>
                <input
                  type="text"
                  value={checkoutData.guest_name}
                  onChange={(e) => setCheckoutData({ ...checkoutData, guest_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter guest name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number (optional)</label>
                <input
                  type="text"
                  value={checkoutData.table_number}
                  onChange={(e) => setCheckoutData({ ...checkoutData, table_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., T1, T2"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>{cartTotal.toLocaleString()} VT</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{cartTotal.toLocaleString()} VT</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
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
              {showReceipt.table_number && (
                <div className="flex justify-between text-sm">
                  <span>Table</span>
                  <span>{showReceipt.table_number}</span>
                </div>
              )}

              <div className="border-t border-dashed pt-4">
                {showReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} VT</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{Number(showReceipt.total).toLocaleString()} VT</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Payment</span>
                  <span className="capitalize">{showReceipt.payment_method}</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 pt-4">
                Thank you for dining with us!
              </p>
            </div>

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setShowReceipt(null)}
                className="flex-1 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
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
