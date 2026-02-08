import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time setup endpoint to add reset token columns
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Add reset_token and reset_token_expires columns if they don't exist
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'reset_token') THEN
            ALTER TABLE staff ADD COLUMN reset_token TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'reset_token_expires') THEN
            ALTER TABLE staff ADD COLUMN reset_token_expires TIMESTAMPTZ;
          END IF;
        END $$;
      `
    })

    if (error) {
      // Try direct alter if rpc doesn't exist
      console.log('RPC failed, trying direct approach:', error)
      
      // Alternative: just try to update with the new columns and see if it works
      const testUpdate = await supabase
        .from('staff')
        .update({ reset_token: null, reset_token_expires: null })
        .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent ID
      
      if (testUpdate.error && testUpdate.error.message.includes('column')) {
        return NextResponse.json({ 
          error: 'Columns need to be added manually in Supabase dashboard',
          instructions: 'Go to Supabase > Table Editor > staff > Add columns: reset_token (text), reset_token_expires (timestamptz)'
        }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, message: 'Reset columns configured' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
