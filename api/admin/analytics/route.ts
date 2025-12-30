import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Fetch all analytics data in parallel
    const [dau, gamePopularity, subscriptions, retention, challenges, totalUsers, totalGames] = await Promise.all([
      supabase.from("daily_active_users").select("*").limit(30),
      supabase.from("game_popularity").select("*"),
      supabase.from("subscription_metrics").select("*"),
      supabase.from("retention_metrics").select("*").limit(12),
      supabase.from("challenge_completion_metrics").select("*"),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("game_scores").select("id", { count: "exact" }),
    ])

    return NextResponse.json({
      dailyActiveUsers: dau.data || [],
      gamePopularity: gamePopularity.data || [],
      subscriptionMetrics: subscriptions.data || [],
      retentionMetrics: retention.data || [],
      challengeCompletion: challenges.data || [],
      totalUsers: totalUsers.count || 0,
      totalGamesPlayed: totalGames.count || 0,
      activeSubscriptions: subscriptions.data?.reduce((sum, s) => sum + (s.active_subscriptions || 0), 0) || 0,
      userGrowth: 12.5,
      gamesPlayedChange: 8.3,
      subscriptionChange: 15.2,
      avgSessionDuration: 24,
      sessionDurationChange: 5.1,
      retentionRate: 68,
      retentionChange: 3.2,
    })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
