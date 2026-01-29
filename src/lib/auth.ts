import { createServerSupabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'manager' | 'staff'
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = createServerSupabase()
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Get staff record with role information
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', user.email)
      .single()

    if (staffError || !staff) {
      return null
    }

    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

export function hasPermission(userRole: string, requiredRole: 'staff' | 'manager' | 'super_admin'): boolean {
  const roleHierarchy = {
    'staff': 1,
    'manager': 2,
    'super_admin': 3
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  return userLevel >= requiredLevel
}

export async function requireAuth(requiredRole: 'staff' | 'manager' | 'super_admin' = 'staff') {
  const user = await getAdminUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  if (!hasPermission(user.role, requiredRole)) {
    throw new Error('Insufficient permissions')
  }

  return user
}