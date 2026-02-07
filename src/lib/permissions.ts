import { Permissions, Permission, Staff, Role } from '@/types'

// Check if user has a specific permission
export function hasPermission(
  permissions: Permissions | null | undefined,
  module: keyof Permissions,
  action: keyof Permission
): boolean {
  if (!permissions) return false
  const modulePermissions = permissions[module]
  if (!modulePermissions) return false
  return Boolean(modulePermissions[action])
}

// Check if user can access a route based on permissions
export function canAccessRoute(
  staff: Staff | null,
  role: Role | null,
  route: string
): boolean {
  if (!staff || !role) return false

  const permissions = role.permissions

  // Define route to permission mappings
  const routePermissions: Record<string, { module: keyof Permissions; action: keyof Permission }[]> = {
    '/admin': [], // Dashboard is always accessible to authenticated staff
    '/admin/bookings': [{ module: 'bookings', action: 'view' }],
    '/admin/rooms': [{ module: 'rooms', action: 'view' }],
    '/admin/guests': [{ module: 'guests', action: 'view' }],
    '/admin/services': [{ module: 'services', action: 'view' }],
    '/admin/conferences': [{ module: 'conferences', action: 'view' }],
    '/admin/communications': [{ module: 'messages', action: 'view' }],
    '/admin/staff': [{ module: 'staff', action: 'view' }],
    '/admin/roles': [{ module: 'roles', action: 'view' }],
    '/admin/announcements': [{ module: 'announcements', action: 'view' }],
    '/admin/attendance': [{ module: 'attendance', action: 'view_all' }],
    '/admin/reports': [{ module: 'reports', action: 'view' }],
    '/admin/settings': [{ module: 'settings', action: 'view' }],
    '/staff': [], // Staff dashboard is accessible to all staff
    '/staff/clock': [{ module: 'attendance', action: 'view' }],
    '/staff/tasks': [], // All staff can view their tasks
    '/staff/announcements': [{ module: 'announcements', action: 'view' }],
    '/kitchen': [{ module: 'kitchen', action: 'view_orders' }],
  }

  // Exact match first
  const requiredPermissions = routePermissions[route]
  if (requiredPermissions !== undefined) {
    if (requiredPermissions.length === 0) return true
    return requiredPermissions.some(({ module, action }) => 
      hasPermission(permissions, module, action)
    )
  }

  // Check for prefix matches
  for (const [routePattern, perms] of Object.entries(routePermissions)) {
    if (route.startsWith(routePattern) && perms.length > 0) {
      return perms.some(({ module, action }) => 
        hasPermission(permissions, module, action)
      )
    }
  }

  return true // Default allow for unmatched routes
}

// Get accessible routes for sidebar
export function getAccessibleRoutes(
  staff: Staff | null,
  role: Role | null
): string[] {
  if (!staff || !role) return []

  const allRoutes = [
    '/admin',
    '/admin/bookings',
    '/admin/rooms',
    '/admin/guests',
    '/admin/services',
    '/admin/conferences',
    '/admin/communications',
    '/admin/staff',
    '/admin/roles',
    '/admin/announcements',
    '/admin/attendance',
    '/admin/reports',
    '/admin/settings',
  ]

  return allRoutes.filter(route => canAccessRoute(staff, role, route))
}

// Check if user is super admin
export function isSuperAdmin(role: Role | null): boolean {
  return role?.name === 'Super Admin'
}

// Check if user is manager or higher
export function isManager(role: Role | null): boolean {
  return role?.name === 'Super Admin' || role?.name === 'Manager'
}

// Format permission for display
export function formatPermissionName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Permission module descriptions
export const permissionModules: Record<keyof Permissions, string> = {
  staff: 'Staff Management',
  bookings: 'Booking Management',
  guests: 'Guest Management',
  rooms: 'Room Management',
  services: 'Service Management',
  conferences: 'Conference Bookings',
  messages: 'Communications',
  announcements: 'Announcements',
  attendance: 'Attendance Tracking',
  roles: 'Role Management',
  reports: 'Reports',
  settings: 'System Settings',
  kitchen: 'Kitchen Operations',
  housekeeping: 'Housekeeping',
}

// Permission action descriptions
export const permissionActions: Record<keyof Permission, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  invite: 'Invite Staff',
  approve: 'Approve',
  reject: 'Reject',
  reschedule: 'Reschedule',
  send_sms: 'Send SMS',
  send_email: 'Send Email',
  broadcast: 'Broadcast Messages',
  pin: 'Pin',
  view_all: 'View All',
  export: 'Export',
  view_orders: 'View Orders',
  update_orders: 'Update Orders',
  view_rooms: 'View Rooms',
  update_cleaning: 'Update Cleaning Status',
}
