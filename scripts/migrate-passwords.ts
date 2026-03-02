/**
 * One-time migration script to hash all plain text passwords
 * Run with: npx ts-node scripts/migrate-passwords.ts
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jfiqbifwueoyqtajbhed.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function migratePasswords() {
  console.log('🔐 Starting password migration...\n')

  // Fetch all staff with passwords
  const { data: staff, error } = await supabase
    .from('staff')
    .select('id, email, password_hash')

  if (error) {
    console.error('❌ Error fetching staff:', error)
    return
  }

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const member of staff || []) {
    if (!member.password_hash) {
      console.log(`⏭️  ${member.email}: No password set`)
      skipped++
      continue
    }

    // Check if already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (member.password_hash.startsWith('$2a$') || member.password_hash.startsWith('$2b$')) {
      console.log(`✅ ${member.email}: Already hashed`)
      skipped++
      continue
    }

    // Hash the plain text password
    try {
      const hashedPassword = await bcrypt.hash(member.password_hash, 10)
      
      const { error: updateError } = await supabase
        .from('staff')
        .update({ password_hash: hashedPassword })
        .eq('id', member.id)

      if (updateError) {
        console.log(`❌ ${member.email}: Update failed - ${updateError.message}`)
        failed++
      } else {
        console.log(`🔒 ${member.email}: Migrated successfully`)
        migrated++
      }
    } catch (err) {
      console.log(`❌ ${member.email}: Hash failed - ${err}`)
      failed++
    }
  }

  console.log('\n📊 Migration Summary:')
  console.log(`   ✅ Migrated: ${migrated}`)
  console.log(`   ⏭️  Skipped:  ${skipped}`)
  console.log(`   ❌ Failed:   ${failed}`)
}

migratePasswords()
