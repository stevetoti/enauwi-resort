'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Package,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  ClipboardList,
} from 'lucide-react'
import { format } from 'date-fns'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  category: string
  unit: string
  current_stock: number
  min_stock: number
  max_stock: number | null
  unit_cost: number | null
  supplier: string | null
  supplier_contact: string | null
  location: string | null
  notes: string | null
  is_active: boolean
}

interface InventoryLog {
  id: string
  item_id: string
  quantity: number
  type: 'in' | 'out' | 'adjust'
  reason: string | null
  notes: string | null
  created_at: string
  inventory_items?: { name: string }
}

interface Supplier {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  category: string | null
  is_active: boolean
}

const CATEGORIES = ['F&B', 'Supplies', 'Amenities', 'Equipment', 'Cleaning', 'Other']

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'items' | 'logs' | 'suppliers'>('items')
  const [showItemModal, setShowItemModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  const [itemForm, setItemForm] = useState({
    name: '',
    sku: '',
    category: 'F&B',
    unit: 'pieces',
    current_stock: '',
    min_stock: '',
    max_stock: '',
    unit_cost: '',
    supplier: '',
    location: '',
    notes: '',
  })

  const [stockForm, setStockForm] = useState({
    type: 'in' as 'in' | 'out' | 'adjust',
    quantity: '',
    reason: '',
    notes: '',
  })

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    category: '',
  })

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name')
    setItems(data || [])
  }, [])

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from('inventory_logs')
      .select('*, inventory_items(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setLogs(data || [])
  }, [])

  const fetchSuppliers = useCallback(async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setSuppliers(data || [])
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchItems(), fetchLogs(), fetchSuppliers()])
      setLoading(false)
    }
    load()
  }, [fetchItems, fetchLogs, fetchSuppliers])

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.unit) {
      alert('Name and unit are required')
      return
    }

    const itemData = {
      name: itemForm.name,
      sku: itemForm.sku || null,
      category: itemForm.category,
      unit: itemForm.unit,
      current_stock: parseFloat(itemForm.current_stock) || 0,
      min_stock: parseFloat(itemForm.min_stock) || 0,
      max_stock: itemForm.max_stock ? parseFloat(itemForm.max_stock) : null,
      unit_cost: itemForm.unit_cost ? parseFloat(itemForm.unit_cost) : null,
      supplier: itemForm.supplier || null,
      location: itemForm.location || null,
      notes: itemForm.notes || null,
    }

    if (editingItem) {
      await supabase.from('inventory_items').update(itemData).eq('id', editingItem.id)
    } else {
      await supabase.from('inventory_items').insert(itemData)
    }

    resetItemForm()
    fetchItems()
  }

  const handleStockUpdate = async () => {
    if (!selectedItem || !stockForm.quantity) {
      alert('Please enter quantity')
      return
    }

    const qty = parseFloat(stockForm.quantity)
    let newStock = selectedItem.current_stock

    if (stockForm.type === 'in') {
      newStock += qty
    } else if (stockForm.type === 'out') {
      newStock -= qty
    } else {
      newStock = qty
    }

    // Update stock
    await supabase
      .from('inventory_items')
      .update({ current_stock: newStock })
      .eq('id', selectedItem.id)

    // Log the change
    await supabase.from('inventory_logs').insert({
      item_id: selectedItem.id,
      quantity: qty,
      type: stockForm.type,
      reason: stockForm.reason || null,
      notes: stockForm.notes || null,
    })

    resetStockForm()
    fetchItems()
    fetchLogs()
  }

  const handleSaveSupplier = async () => {
    if (!supplierForm.name) {
      alert('Supplier name is required')
      return
    }

    const supplierData = {
      name: supplierForm.name,
      contact_person: supplierForm.contact_person || null,
      email: supplierForm.email || null,
      phone: supplierForm.phone || null,
      category: supplierForm.category || null,
    }

    if (editingSupplier) {
      await supabase.from('suppliers').update(supplierData).eq('id', editingSupplier.id)
    } else {
      await supabase.from('suppliers').insert(supplierData)
    }

    resetSupplierForm()
    fetchSuppliers()
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('inventory_items').update({ is_active: false }).eq('id', id)
    fetchItems()
  }

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Delete this supplier?')) return
    await supabase.from('suppliers').update({ is_active: false }).eq('id', id)
    fetchSuppliers()
  }

  const resetItemForm = () => {
    setShowItemModal(false)
    setEditingItem(null)
    setItemForm({
      name: '',
      sku: '',
      category: 'F&B',
      unit: 'pieces',
      current_stock: '',
      min_stock: '',
      max_stock: '',
      unit_cost: '',
      supplier: '',
      location: '',
      notes: '',
    })
  }

  const resetStockForm = () => {
    setShowStockModal(false)
    setSelectedItem(null)
    setStockForm({
      type: 'in',
      quantity: '',
      reason: '',
      notes: '',
    })
  }

  const resetSupplierForm = () => {
    setShowSupplierModal(false)
    setEditingSupplier(null)
    setSupplierForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      category: '',
    })
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLowStock = !showLowStockOnly || item.current_stock <= item.min_stock
    return matchesCategory && matchesSearch && matchesLowStock
  })

  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock)
  const totalValue = items.reduce((acc, i) => acc + (i.current_stock * (i.unit_cost || 0)), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">{items.length} items, {lowStockItems.length} low stock alerts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Truck className="w-4 h-4" />
            Suppliers
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
            <Package className="w-8 h-8 text-ocean-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold">{totalValue.toLocaleString()} VT</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
            <Truck className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Low Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item)
                  setShowStockModal(true)
                }}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm hover:bg-amber-100"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-amber-600 ml-2">({item.current_stock} / {item.min_stock} {item.unit})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === 'items' ? 'border-ocean-600 text-ocean-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1" />
          Items
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === 'logs' ? 'border-ocean-600 text-ocean-600' : 'border-transparent text-gray-500'
          }`}
        >
          <ClipboardList className="w-4 h-4 inline mr-1" />
          Stock Logs
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === 'suppliers' ? 'border-ocean-600 text-ocean-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Truck className="w-4 h-4 inline mr-1" />
          Suppliers
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Low stock only</span>
            </label>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Min/Max</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map(item => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${
                      item.current_stock <= item.min_stock ? 'bg-amber-50' : ''
                    }`}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            item.current_stock <= item.min_stock ? 'text-amber-600' : ''
                          }`}>
                            {item.current_stock} {item.unit}
                          </span>
                          {item.current_stock <= item.min_stock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.min_stock} / {item.max_stock || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.unit_cost ? `${item.unit_cost.toLocaleString()} VT` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.supplier || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowStockModal(true)
                          }}
                          className="text-green-600 hover:text-green-800 mr-2"
                          title="Update Stock"
                        >
                          <ArrowUp className="w-4 h-4 inline" />
                          <ArrowDown className="w-4 h-4 inline -ml-1" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item)
                            setItemForm({
                              name: item.name,
                              sku: item.sku || '',
                              category: item.category,
                              unit: item.unit,
                              current_stock: item.current_stock.toString(),
                              min_stock: item.min_stock.toString(),
                              max_stock: item.max_stock?.toString() || '',
                              unit_cost: item.unit_cost?.toString() || '',
                              supplier: item.supplier || '',
                              location: item.location || '',
                              notes: item.notes || '',
                            })
                            setShowItemModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
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
        </>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.inventory_items?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        log.type === 'in' ? 'bg-green-100 text-green-800' :
                        log.type === 'out' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.type === 'in' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {log.type === 'out' && <TrendingDown className="w-3 h-3 mr-1" />}
                        {log.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {log.type === 'in' ? '+' : log.type === 'out' ? '-' : ''}{log.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.reason || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Suppliers</h3>
            <button
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center gap-1 text-sm text-ocean-600 hover:text-ocean-800"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {suppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-sm">{supplier.contact_person || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{supplier.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">{supplier.phone || '-'}</td>
                    <td className="px-4 py-3">
                      {supplier.category && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{supplier.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingSupplier(supplier)
                          setSupplierForm({
                            name: supplier.name,
                            contact_person: supplier.contact_person || '',
                            email: supplier.email || '',
                            phone: supplier.phone || '',
                            category: supplier.category || '',
                          })
                          setShowSupplierModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
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

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h3>
              <button onClick={resetItemForm}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="pieces, kg, liters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={itemForm.current_stock}
                    onChange={(e) => setItemForm({ ...itemForm, current_stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock (Alert)</label>
                  <input
                    type="number"
                    value={itemForm.min_stock}
                    onChange={(e) => setItemForm({ ...itemForm, min_stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                  <input
                    type="number"
                    value={itemForm.max_stock}
                    onChange={(e) => setItemForm({ ...itemForm, max_stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (VT)</label>
                  <input
                    type="number"
                    value={itemForm.unit_cost}
                    onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={itemForm.supplier}
                    onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Storage A, Kitchen"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-white">
              <button onClick={resetItemForm} className="flex-1 px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
              >
                {editingItem ? 'Update' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Update Stock</h3>
              <button onClick={resetStockForm}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-gray-500">
                  Current: {selectedItem.current_stock} {selectedItem.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setStockForm({ ...stockForm, type: 'in' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      stockForm.type === 'in' ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    <ArrowUp className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Stock In</span>
                  </button>
                  <button
                    onClick={() => setStockForm({ ...stockForm, type: 'out' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      stockForm.type === 'out' ? 'border-red-500 bg-red-50' : ''
                    }`}
                  >
                    <ArrowDown className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Stock Out</span>
                  </button>
                  <button
                    onClick={() => setStockForm({ ...stockForm, type: 'adjust' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      stockForm.type === 'adjust' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Adjust</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {stockForm.type === 'adjust' ? 'New Stock Level' : 'Quantity'}
                </label>
                <input
                  type="number"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select reason...</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Return">Return</option>
                  <option value="Usage">Usage</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Expired">Expired</option>
                  <option value="Count Adjustment">Count Adjustment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={stockForm.notes}
                  onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button onClick={resetStockForm} className="flex-1 px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleStockUpdate}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  stockForm.type === 'in' ? 'bg-green-600 hover:bg-green-700' :
                  stockForm.type === 'out' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
              </h3>
              <button onClick={resetSupplierForm}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={supplierForm.category}
                  onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="F&B, Supplies, etc."
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button onClick={resetSupplierForm} className="flex-1 px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
              >
                {editingSupplier ? 'Update' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
