import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ valid: false })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    // Hash the incoming token and compare with stored hash
    const tokenHash = hashToken(token)

    const { data: staff, error } = await supabase
      .from('staff')
      .select('id, reset_token_expires')
      .eq('reset_token', tokenHash)
      .single()

    if (error || !staff) {
      return NextResponse.json({ valid: false })
    }

    if (staff.reset_token_expires && new Date(staff.reset_token_expires) < new Date()) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
