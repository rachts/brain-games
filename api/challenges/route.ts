import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("friend_challenges")
      .select(
        `
        *,
        challenger_profile:challenger_id(display_name, username, avatar_url),
        opponent_profile:opponent_id(display_name, username, avatar_url)
      `,
      )
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { opponentId, gameType } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const { data, error } = await supabase
      .from("friend_challenges")
      .insert({
        challenger_id: user.id,
        opponent_id: opponentId,
        game_type: gameType,
        status: "pending",
        share_token: shareToken,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
