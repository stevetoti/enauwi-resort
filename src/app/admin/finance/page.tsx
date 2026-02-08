'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Search,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

interface Transaction {
  id: string
  date: string
  category: string
  subcategory: string | null
  amount: number
  type: 'income' | 'expense'
  description: string | null
  payment_method: string | null
  created_at: string
}

interface DailyData {
  date: string
  income: number
  expense: number
}

const CATEGORIES = ['Rooms', 'Restaurant', 'Conference', 'Activities', 'Bar', 'Other']
const EXPENSE_CATEGORIES = ['Supplies', 'Maintenance', 'Utilities', 'Salaries', 'Marketing', 'Other']
const COLORS = ['#0D4F8B', '#E8941C', '#17A2B8', '#40916C', '#C77B0A', '#854B06']

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'income' | 'expense'>('income')
  const [dateFilter, setDateFilter] = useState('month')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Rooms',
    subcategory: '',
    amount: '',
    description: '',
    payment_method: 'cash',
  })

  // Stats
  const [stats, setStats] = useState({
    todayIncome: 0,
    todayExpense: 0,
    monthIncome: 0,
    monthExpense: 0,
    lastMonthIncome: 0,
    weekIncome: 0,
  })

  const getDateRange = useCallback(() => {
    const today = new Date()
    switch (dateFilter) {
      case 'today':
        return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
      case 'week':
        return { start: format(startOfWeek(today), 'yyyy-MM-dd'), end: format(endOfWeek(today), 'yyyy-MM-dd') }
      case 'month':
        return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end: format(endOfMonth(today), 'yyyy-MM-dd') }
      case 'year':
        return { start: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
      default:
        return { start: format(subDays(today, 30), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
    }
  }, [dateFilter])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { start, end } = getDateRange()
    
    let query = supabase
      .from('finance_transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }, [getDateRange, categoryFilter])

  const calculateStats = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')
    const lastMonthStart = format(startOfMonth(subDays(startOfMonth(new Date()), 1)), 'yyyy-MM-dd')
    const lastMonthEnd = format(endOfMonth(subDays(startOfMonth(new Date()), 1)), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd')

    // Today's transactions
    const { data: todayData } = await supabase
      .from('finance_transactions')
      .select('amount, type')
      .eq('date', today)

    // This month's transactions
    const { data: monthData } = await supabase
      .from('finance_transactions')
      .select('amount, type')
      .gte('date', monthStart)
      .lte('date', monthEnd)

    // Last month's income
    const { data: lastMonthData } = await supabase
      .from('finance_transactions')
      .select('amount, type')
      .gte('date', lastMonthStart)
      .lte('date', lastMonthEnd)
      .eq('type', 'income')

    // This week's income
    const { data: weekData } = await supabase
      .from('finance_transactions')
      .select('amount, type')
      .gte('date', weekStart)
      .eq('type', 'income')

    setStats({
      todayIncome: todayData?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0,
      todayExpense: todayData?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0,
      monthIncome: monthData?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0,
      monthExpense: monthData?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0,
      lastMonthIncome: lastMonthData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0,
      weekIncome: weekData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0,
    })
  }, [])

  useEffect(() => {
    fetchTransactions()
    calculateStats()
  }, [fetchTransactions, calculateStats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('finance_transactions')
      .insert({
        date: formData.date,
        category: formData.category,
        subcategory: formData.subcategory || null,
        amount: parseFloat(formData.amount),
        type: modalType,
        description: formData.description || null,
        payment_method: formData.payment_method,
      })

    if (error) {
      alert('Error adding transaction: ' + error.message)
    } else {
      setShowModal(false)
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Rooms',
        subcategory: '',
        amount: '',
        description: '',
        payment_method: 'cash',
      })
      fetchTransactions()
      calculateStats()
    }
  }

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Subcategory', 'Amount', 'Description', 'Payment Method']
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.subcategory || '',
      t.amount,
      t.description || '',
      t.payment_method || ''
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  // Prepare chart data
  const dailyData: DailyData[] = []
  const incomeByCategory = CATEGORIES.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat && t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
  })).filter(d => d.value > 0)

  // Group by date for bar chart
  const dateGroups: { [key: string]: { income: number; expense: number } } = {}
  transactions.forEach(t => {
    const date = format(new Date(t.date), 'MMM dd')
    if (!dateGroups[date]) dateGroups[date] = { income: 0, expense: 0 }
    if (t.type === 'income') dateGroups[date].income += Number(t.amount)
    else dateGroups[date].expense += Number(t.amount)
  })
  Object.entries(dateGroups).slice(-7).forEach(([date, data]) => {
    dailyData.push({ date, ...data })
  })

  const filteredTransactions = transactions.filter(t => 
    searchQuery === '' || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const monthChange = stats.lastMonthIncome > 0 
    ? ((stats.monthIncome - stats.lastMonthIncome) / stats.lastMonthIncome * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-500">Track income and expenses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setModalType('income'); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
          <button
            onClick={() => { setModalType('expense'); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayIncome.toLocaleString()} VT</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weekIncome.toLocaleString()} VT</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthIncome.toLocaleString()} VT</p>
              <div className={`flex items-center text-xs mt-1 ${Number(monthChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(monthChange) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {monthChange}% vs last month
              </div>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Month Expenses</p>
              <p className="text-2xl font-bold text-red-600">{stats.monthExpense.toLocaleString()} VT</p>
              <p className="text-xs text-gray-500 mt-1">Net: {(stats.monthIncome - stats.monthExpense).toLocaleString()} VT</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Daily Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} VT`} />
              <Bar dataKey="income" fill="#40916C" name="Income" />
              <Bar dataKey="expense" fill="#dc2626" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {incomeByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} VT`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{t.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{t.description || '-'}</td>
                    <td className="px-4 py-3 text-sm capitalize">{t.payment_method || '-'}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()} VT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Add {modalType === 'income' ? 'Income' : 'Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {(modalType === 'income' ? CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (VT)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    modalType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Add {modalType === 'income' ? 'Income' : 'Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
