'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Sparkles,
  BedDouble,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Plus,
  X,
  Filter,
  Calendar,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { format, isToday, isTomorrow, addDays } from 'date-fns'

interface Room {
  id: string
  name: string
  type: string
}

interface RoomStatus {
  id: string
  room_id: string
  status: string
  last_cleaned_at: string | null
  last_inspected_at: string | null
  notes: string | null
  rooms?: Room
}

interface HousekeepingTask {
  id: string
  room_id: string
  task_type: string
  status: string
  priority: string
  assigned_to: string | null
  scheduled_date: string
  started_at: string | null
  completed_at: string | null
  inspected_by: string | null
  inspected_at: string | null
  notes: string | null
  issues: string | null
  rooms?: Room
  staff?: { name: string }
}

interface Staff {
  id: string
  name: string
  department_id: string
}

interface Booking {
  id: string
  room_id: string
  guest_name: string
  check_in: string
  check_out: string
  rooms?: Room
}

const ROOM_STATUSES = [
  { value: 'clean', label: 'Clean', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'dirty', label: 'Dirty', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  { value: 'inspected', label: 'Inspected', color: 'bg-teal-100 text-teal-800', icon: Eye },
  { value: 'out_of_order', label: 'Out of Order', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  { value: 'do_not_disturb', label: 'Do Not Disturb', color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
]

const TASK_TYPES = [
  { value: 'cleaning', label: 'Standard Cleaning' },
  { value: 'turndown', label: 'Turndown Service' },
  { value: 'deep_clean', label: 'Deep Clean' },
  { value: 'maintenance', label: 'Maintenance Request' },
  { value: 'inspection', label: 'Inspection' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([])
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [checkoutsToday, setCheckoutsToday] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [taskForm, setTaskForm] = useState({
    room_id: '',
    task_type: 'cleaning',
    priority: 'normal',
    assigned_to: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  })

  const fetchRooms = useCallback(async () => {
    const { data } = await supabase.from('rooms').select('id, name, type').order('name')
    setRooms(data || [])
  }, [])

  const fetchRoomStatuses = useCallback(async () => {
    const { data } = await supabase
      .from('room_status')
      .select('*, rooms(id, name, type)')
    setRoomStatuses(data || [])
  }, [])

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('housekeeping_tasks')
      .select('*, rooms(id, name, type), staff:assigned_to(name)')
      .gte('scheduled_date', format(addDays(new Date(), -7), 'yyyy-MM-dd'))
      .order('scheduled_date', { ascending: false })
      .order('priority', { ascending: false })
    setTasks(data || [])
  }, [])

  const fetchStaff = useCallback(async () => {
    // Get housekeeping staff
    const { data: depts } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Housekeeping')
      .single()

    if (depts) {
      const { data } = await supabase
        .from('staff')
        .select('id, name, department_id')
        .eq('department_id', depts.id)
        .eq('status', 'active')
      setStaff(data || [])
    }
  }, [])

  const fetchCheckoutsToday = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('bookings')
      .select('*, rooms(id, name, type)')
      .eq('check_out', today)
      .eq('status', 'confirmed')
    setCheckoutsToday((data as unknown as Booking[]) || [])
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([
        fetchRooms(),
        fetchRoomStatuses(),
        fetchTasks(),
        fetchStaff(),
        fetchCheckoutsToday(),
      ])
      setLoading(false)
    }
    load()
  }, [fetchRooms, fetchRoomStatuses, fetchTasks, fetchStaff, fetchCheckoutsToday])

  const handleUpdateRoomStatus = async (roomId: string, newStatus: string) => {
    const { data: existing } = await supabase
      .from('room_status')
      .select('id')
      .eq('room_id', roomId)
      .single()

    const updateData = {
      status: newStatus,
      ...(newStatus === 'clean' && { last_cleaned_at: new Date().toISOString() }),
      ...(newStatus === 'inspected' && { last_inspected_at: new Date().toISOString() }),
    }

    if (existing) {
      await supabase.from('room_status').update(updateData).eq('room_id', roomId)
    } else {
      await supabase.from('room_status').insert({ room_id: roomId, ...updateData })
    }

    fetchRoomStatuses()
  }

  const handleCreateTask = async () => {
    if (!taskForm.room_id) {
      alert('Please select a room')
      return
    }

    const taskData = {
      room_id: taskForm.room_id,
      task_type: taskForm.task_type,
      priority: taskForm.priority,
      assigned_to: taskForm.assigned_to || null,
      scheduled_date: taskForm.scheduled_date,
      notes: taskForm.notes || null,
      status: 'pending',
    }

    await supabase.from('housekeeping_tasks').insert(taskData)

    // Also set room to dirty if it's a cleaning task
    if (taskForm.task_type === 'cleaning' || taskForm.task_type === 'deep_clean') {
      await handleUpdateRoomStatus(taskForm.room_id, 'dirty')
    }

    resetTaskForm()
    fetchTasks()
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    const updateData: Record<string, unknown> = { status: newStatus }
    
    if (newStatus === 'in_progress') {
      updateData.started_at = new Date().toISOString()
    } else if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    await supabase.from('housekeeping_tasks').update(updateData).eq('id', taskId)

    // Update room status based on task
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      if (newStatus === 'in_progress') {
        await handleUpdateRoomStatus(task.room_id, 'in_progress')
      } else if (newStatus === 'completed') {
        await handleUpdateRoomStatus(task.room_id, 'clean')
      }
    }

    fetchTasks()
    fetchRoomStatuses()
  }

  const handleQuickAssign = async (taskId: string, staffId: string) => {
    await supabase.from('housekeeping_tasks').update({ assigned_to: staffId }).eq('id', taskId)
    fetchTasks()
  }

  const resetTaskForm = () => {
    setShowTaskModal(false)
    setSelectedRoom(null)
    setTaskForm({
      room_id: '',
      task_type: 'cleaning',
      priority: 'normal',
      assigned_to: '',
      scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    })
  }

  const getRoomStatus = (roomId: string) => {
    return roomStatuses.find(s => s.room_id === roomId)?.status || 'clean'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesDate = task.scheduled_date === dateFilter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesDate && matchesStatus
  })

  const todaysTasks = tasks.filter(t => t.scheduled_date === format(new Date(), 'yyyy-MM-dd'))
  const pendingTasks = todaysTasks.filter(t => t.status === 'pending')
  const inProgressTasks = todaysTasks.filter(t => t.status === 'in_progress')
  const completedTasks = todaysTasks.filter(t => t.status === 'completed')

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-gray-500">
            {pendingTasks.length} pending, {inProgressTasks.length} in progress, {completedTasks.length} completed today
          </p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roomStatuses.filter(s => s.status === 'clean').length}</p>
              <p className="text-sm text-gray-500">Clean</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roomStatuses.filter(s => s.status === 'dirty').length}</p>
              <p className="text-sm text-gray-500">Dirty</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roomStatuses.filter(s => s.status === 'in_progress').length}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{checkoutsToday.length}</p>
              <p className="text-sm text-gray-500">Checkouts Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkouts Alert */}
      {checkoutsToday.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Rooms Checking Out Today</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {checkoutsToday.map(booking => {
              const status = getRoomStatus(booking.room_id)
              const statusInfo = ROOM_STATUSES.find(s => s.value === status)
              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded-lg"
                >
                  <BedDouble className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{booking.rooms?.name}</span>
                  <span className="text-sm text-gray-500">({booking.guest_name})</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${statusInfo?.color}`}>
                    {statusInfo?.label}
                  </span>
                  {status !== 'clean' && (
                    <button
                      onClick={() => {
                        setSelectedRoom(booking.rooms || null)
                        setTaskForm({ ...taskForm, room_id: booking.room_id })
                        setShowTaskModal(true)
                      }}
                      className="text-xs text-ocean-600 hover:text-ocean-800"
                    >
                      + Task
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Room Status Board */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Room Status Board</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {rooms.map(room => {
            const status = getRoomStatus(room.id)
            const statusInfo = ROOM_STATUSES.find(s => s.value === status)
            const StatusIcon = statusInfo?.icon || CheckCircle

            return (
              <div
                key={room.id}
                className={`p-3 rounded-lg border-2 ${
                  status === 'clean' ? 'border-green-300 bg-green-50' :
                  status === 'dirty' ? 'border-red-300 bg-red-50' :
                  status === 'in_progress' ? 'border-blue-300 bg-blue-50' :
                  status === 'inspected' ? 'border-teal-300 bg-teal-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{room.name}</span>
                  <StatusIcon className={`w-4 h-4 ${
                    status === 'clean' ? 'text-green-600' :
                    status === 'dirty' ? 'text-red-600' :
                    status === 'in_progress' ? 'text-blue-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <p className="text-xs text-gray-500 mb-2">{room.type}</p>
                <select
                  value={status}
                  onChange={(e) => handleUpdateRoomStatus(room.id, e.target.value)}
                  className="w-full text-xs px-2 py-1 border rounded bg-white"
                >
                  {ROOM_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center">
          <h3 className="font-semibold">Tasks</h3>
          <div className="flex-1" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No tasks for this date</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredTasks.map(task => {
              const priorityInfo = PRIORITIES.find(p => p.value === task.priority)
              const taskTypeInfo = TASK_TYPES.find(t => t.value === task.task_type)

              return (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Room & Type */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{task.rooms?.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${priorityInfo?.color}`}>
                          {priorityInfo?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{taskTypeInfo?.label}</p>
                      {task.notes && (
                        <p className="text-xs text-gray-400 mt-1">{task.notes}</p>
                      )}
                    </div>

                    {/* Assigned To */}
                    <div className="min-w-[150px]">
                      <label className="text-xs text-gray-500">Assigned to</label>
                      <select
                        value={task.assigned_to || ''}
                        onChange={(e) => handleQuickAssign(task.id, e.target.value)}
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      >
                        <option value="">Unassigned</option>
                        {staff.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="min-w-[140px]">
                      <label className="text-xs text-gray-500">Status</label>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        className={`w-full mt-1 px-2 py-1 border rounded text-sm ${
                          task.status === 'completed' ? 'bg-green-100' :
                          task.status === 'in_progress' ? 'bg-blue-100' :
                          ''
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="inspected">Inspected</option>
                        <option value="issue_reported">Issue Reported</option>
                      </select>
                    </div>

                    {/* Times */}
                    <div className="text-xs text-gray-500 min-w-[120px]">
                      {task.started_at && (
                        <p>Started: {format(new Date(task.started_at), 'HH:mm')}</p>
                      )}
                      {task.completed_at && (
                        <p>Done: {format(new Date(task.completed_at), 'HH:mm')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Create Task</h3>
              <button onClick={resetTaskForm}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                <select
                  value={taskForm.room_id}
                  onChange={(e) => setTaskForm({ ...taskForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select room...</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name} ({room.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                <select
                  value={taskForm.task_type}
                  onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {TASK_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Unassigned</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={taskForm.scheduled_date}
                  onChange={(e) => setTaskForm({ ...taskForm, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button onClick={resetTaskForm} className="flex-1 px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
