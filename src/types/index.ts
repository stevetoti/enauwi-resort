export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  guest_id: string
  channel: string
  language: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  language: string
  created_at: string
}

export interface Room {
  id: string
  name: string
  type: string
  description: string
  price_vt: number
  max_guests: number
  amenities: string[]
  images: string[]
  available: boolean
  created_at: string
  tagline?: string
  bed_config?: string
}

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  language: string
  preferences: Record<string, string>
  created_at: string
}

export interface Booking {
  id: string
  room_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
  notes: string
  language: string
  total_price?: number
  num_guests: number
  special_requests?: string
  created_at: string
  room?: Room
}

// Role & Permissions Types
export interface Permission {
  view?: boolean
  create?: boolean
  edit?: boolean
  delete?: boolean
  invite?: boolean
  approve?: boolean
  reject?: boolean
  reschedule?: boolean
  send_sms?: boolean
  send_email?: boolean
  broadcast?: boolean
  pin?: boolean
  view_all?: boolean
  export?: boolean
  view_orders?: boolean
  update_orders?: boolean
  view_rooms?: boolean
  update_cleaning?: boolean
}

export interface Permissions {
  staff?: Permission
  bookings?: Permission
  guests?: Permission
  rooms?: Permission
  services?: Permission
  conferences?: Permission
  messages?: Permission
  announcements?: Permission
  attendance?: Permission
  roles?: Permission
  reports?: Permission
  settings?: Permission
  kitchen?: Permission
  housekeeping?: Permission
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permissions
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'manager' | 'staff'
  role_id?: string
  department?: string
  department_id?: string
  profile_photo?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  nationality?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  date_employed?: string
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'casual'
  salary?: number
  salary_frequency?: 'hourly' | 'weekly' | 'fortnightly' | 'monthly'
  bank_name?: string
  bank_account_number?: string
  tax_id?: string
  contract_end_date?: string
  notes?: string
  status: 'active' | 'inactive' | 'pending'
  invited_at?: string
  invited_by?: string
  first_login: boolean
  last_login?: string
  created_at: string
  updated_at: string
  role_details?: Role
  department_details?: Department
}

export interface StaffAttendance {
  id: string
  staff_id: string
  date: string
  clock_in?: string
  clock_out?: string
  hours_worked?: number
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave'
  notes?: string
  created_at: string
  updated_at: string
  staff?: Staff
}

export interface Announcement {
  id: string
  title: string
  content: string
  author_id?: string
  pinned: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  target_roles?: string[]
  expires_at?: string
  created_at: string
  updated_at: string
  author?: Staff
  is_read?: boolean
}

export interface AnnouncementRead {
  id: string
  announcement_id: string
  staff_id: string
  read_at: string
}

export interface MessageLog {
  id: string
  recipient_id?: string
  recipient_name?: string
  recipient_contact: string
  channel: 'sms' | 'email' | 'whatsapp'
  message_type?: string
  subject?: string
  message: string
  template_id?: string
  sent_by?: string
  sent_at: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  error_message?: string
  metadata?: Record<string, unknown>
  sender?: Staff
}

export interface MessageTemplate {
  id: string
  name: string
  channel: 'sms' | 'email' | 'whatsapp'
  subject?: string
  content: string
  variables: string[]
  category?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface StaffInvitation {
  id: string
  email: string
  name: string
  role_id?: string
  department?: string
  invitation_token: string
  invited_by?: string
  expires_at: string
  accepted_at?: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  created_at: string
  role?: Role
  inviter?: Staff
}

export interface RoomCleaningStatus {
  id: string
  room_id: string
  date: string
  status: 'pending' | 'in_progress' | 'cleaned' | 'inspected' | 'needs_maintenance'
  assigned_to?: string
  cleaned_by?: string
  cleaned_at?: string
  inspected_by?: string
  inspected_at?: string
  notes?: string
  created_at: string
  updated_at: string
  room?: Room
  assigned_staff?: Staff
}

export interface StaffTask {
  id: string
  title: string
  description?: string
  assigned_to?: string
  assigned_by?: string
  due_date?: string
  due_time?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  category?: string
  completed_at?: string
  created_at: string
  updated_at: string
  assignee?: Staff
  assigner?: Staff
}

export interface StaffShift {
  id: string
  staff_id: string
  date: string
  start_time: string
  end_time: string
  shift_type: 'regular' | 'overtime' | 'on_call'
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  staff?: Staff
}

export interface RoomAvailability {
  id: string
  room_id: string
  date: string
  available: boolean
  price_override?: number
  room?: Room
}

export interface BookingFormData {
  checkIn?: string
  checkOut?: string
  check_in?: string
  check_out?: string
  guests: number
  roomId?: string
  room_id?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  specialRequests?: string
  special_requests?: string
  payment_method?: string
  total_price?: number
}

export interface AdminStats {
  totalBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  totalRevenue: number
  pendingBookings: number
}

export interface Service {
  id: string
  name: string
  category: 'conference' | 'food_beverage' | 'activities' | 'other_services'
  description: string
  unit_price: number
  price_unit: string
  is_placeholder_price: boolean
  amenities: string[] | null
  available: boolean
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ConferenceBooking {
  id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  booking_type: 'half_day' | 'full_day'
  number_of_attendees: number
  special_requirements: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  total_price: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  updated_at: string
  service?: Service
}

export interface ServiceOrder {
  id: string
  booking_id: string | null
  service_id: string
  quantity: number
  unit_price: number
  total_price: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  notes: string | null
  room_number: string | null
  guest_name: string | null
  guest_email: string | null
  created_at: string
  updated_at: string
  service?: Service
  booking?: Booking
}

// Communication Hub Types
export interface BroadcastMessage {
  channel: 'sms' | 'email'
  recipients: string[]
  message: string
  subject?: string
  template_id?: string
}

export interface SendMessageRequest {
  channel: 'sms' | 'email'
  recipient: string
  recipientName?: string
  message: string
  subject?: string
  guestId?: string
}

// =====================================================
// DEPARTMENT TYPES
// =====================================================
export interface Department {
  id: string
  name: string
  description?: string
  image_url?: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
  member_count?: number
}

export interface DepartmentAnnouncement {
  id: string
  department_id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  pinned: boolean
  created_by?: string
  expires_at?: string
  created_at: string
  updated_at: string
  author?: Staff
  department?: Department
}

export interface DepartmentDocument {
  id: string
  department_id: string
  name: string
  description?: string
  url: string
  file_type?: string
  file_size?: number
  category?: string
  uploaded_by?: string
  created_at: string
  updated_at: string
  uploader?: Staff
  department?: Department
}

// =====================================================
// PERMISSION AREAS FOR GRANULAR ACCESS CONTROL
// =====================================================
export interface PermissionArea {
  key: string
  label: string
  description: string
  actions: {
    key: string
    label: string
  }[]
}

export const PERMISSION_AREAS: PermissionArea[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'View dashboard and statistics',
    actions: [{ key: 'view', label: 'View' }]
  },
  {
    key: 'bookings',
    label: 'Bookings',
    description: 'Manage room reservations',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'rooms',
    label: 'Rooms',
    description: 'Manage room inventory',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'guests',
    label: 'Guests',
    description: 'Manage guest information',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'staff',
    label: 'Staff',
    description: 'Manage staff members',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'communications',
    label: 'Communications',
    description: 'Send messages to guests',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'send', label: 'Send' }
    ]
  },
  {
    key: 'conferences',
    label: 'Conferences',
    description: 'Manage conference bookings',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'announcements',
    label: 'Announcements',
    description: 'Internal staff announcements',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'reports',
    label: 'Reports',
    description: 'View analytics and reports',
    actions: [{ key: 'view', label: 'View' }]
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'System configuration',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' }
    ]
  },
  {
    key: 'departments',
    label: 'Departments',
    description: 'Manage resort departments',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    key: 'roles',
    label: 'Roles',
    description: 'Manage staff roles and permissions',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  }
]
