import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const gameType = request.nextUrl.searchParams.get("gameType")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "100")

    const query = supabase
      .from("user_stats")
      .select("user_id, total_points, xp_level, current_streak, profiles(display_name, username, avatar_url)")
      .order("total_points", { ascending: false })
      .limit(limit)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { gameType } = await request.json()

    const { data, error } = await supabase.rpc("get_game_leaderboard", {
      p_game_type: gameType,
      p_limit: 50,
    })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
