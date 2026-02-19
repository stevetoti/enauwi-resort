import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET analytics data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const summary = searchParams.get('summary') === 'true'

    // If summary requested, get aggregated stats
    if (summary) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Get all posts published in the last 30 days
      const { data: posts } = await supabase
        .from('social_posts')
        .select('id, platforms, published_at, content, hashtags')
        .eq('status', 'published')
        .gte('published_at', thirtyDaysAgo.toISOString())

      // Get analytics for those posts
      const { data: analytics } = await supabase
        .from('social_analytics')
        .select('*')
        .gte('recorded_at', thirtyDaysAgo.toISOString())

      // Calculate summary statistics
      const summaryData = {
        totalPosts: posts?.length || 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        totalReach: 0,
        totalImpressions: 0,
        avgEngagementRate: 0,
        platformBreakdown: {} as Record<string, { posts: number; engagement: number }>,
        topPosts: [] as { id: string; content: string; engagement: number }[],
        dailyStats: {} as Record<string, { posts: number; engagement: number }>
      }

      if (analytics && analytics.length > 0) {
        analytics.forEach(a => {
          summaryData.totalLikes += a.likes || 0
          summaryData.totalShares += a.shares || 0
          summaryData.totalComments += a.comments || 0
          summaryData.totalReach += a.reach || 0
          summaryData.totalImpressions += a.impressions || 0

          // Platform breakdown
          if (!summaryData.platformBreakdown[a.platform]) {
            summaryData.platformBreakdown[a.platform] = { posts: 0, engagement: 0 }
          }
          summaryData.platformBreakdown[a.platform].posts++
          summaryData.platformBreakdown[a.platform].engagement += 
            (a.likes || 0) + (a.shares || 0) + (a.comments || 0)

          // Daily stats
          const date = new Date(a.recorded_at).toISOString().split('T')[0]
          if (!summaryData.dailyStats[date]) {
            summaryData.dailyStats[date] = { posts: 0, engagement: 0 }
          }
          summaryData.dailyStats[date].engagement += 
            (a.likes || 0) + (a.shares || 0) + (a.comments || 0)
        })

        // Calculate average engagement rate
        const totalEngagement = summaryData.totalLikes + summaryData.totalShares + summaryData.totalComments
        summaryData.avgEngagementRate = summaryData.totalReach > 0 
          ? (totalEngagement / summaryData.totalReach) * 100 
          : 0
      }

      // Count posts per day
      posts?.forEach(p => {
        const date = new Date(p.published_at).toISOString().split('T')[0]
        if (!summaryData.dailyStats[date]) {
          summaryData.dailyStats[date] = { posts: 0, engagement: 0 }
        }
        summaryData.dailyStats[date].posts++
      })

      return NextResponse.json({ summary: summaryData })
    }

    // Regular query for specific analytics
    let query = supabase
      .from('social_analytics')
      .select('*, post:social_posts(content, platforms, published_at)')
      .order('recorded_at', { ascending: false })

    if (postId) {
      query = query.eq('post_id', postId)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (startDate) {
      query = query.gte('recorded_at', startDate)
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate)
    }

    const { data, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ analytics: data })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

// POST new analytics data
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('social_analytics')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ analytics: data })
  } catch (error) {
    console.error('Error creating analytics:', error)
    return NextResponse.json({ error: 'Failed to create analytics' }, { status: 500 })
  }
}
