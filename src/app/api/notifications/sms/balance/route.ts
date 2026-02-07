import { NextResponse } from 'next/server'

/**
 * Check VanuConnect SMS balance
 */

const VANUCONNECT_API_KEY = process.env.ENAUWI_VANUCONNECT_API_KEY || process.env.VANUCONNECT_API_KEY
const VANUCONNECT_BALANCE_URL = 'https://zqxcrvjsnunjuelmrydm.supabase.co/functions/v1/check-balance-api'

export async function GET() {
  try {
    if (!VANUCONNECT_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'VanuConnect API key not configured',
      }, { status: 500 })
    }

    const response = await fetch(VANUCONNECT_BALANCE_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VANUCONNECT_API_KEY}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to check balance',
        details: result,
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      credits: result.credits,
      plan: result.subscription_plan,
      status: result.status,
    })

  } catch (error) {
    console.error('[VanuConnect] Balance check error:', error)
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    )
  }
}
