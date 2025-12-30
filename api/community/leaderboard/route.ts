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

    const { data, error } = await supabase
      .from("public_leaderboard")
      .select("*")
      .order("rank", { ascending: true })
      .limit(100)

    if (error) throw error

    const leaderboard = data.map((entry) => ({
      rank: entry.rank,
      username: entry.username,
      totalPoints: entry.total_points,
      gamesPlayed: entry.games_played,
      avgScore: entry.avg_score,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("[v0] Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
