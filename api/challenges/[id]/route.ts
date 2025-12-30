import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("friend_challenges")
      .select(
        `
        *,
        challenger_profile:challenger_id(display_name, username, avatar_url),
        opponent_profile:opponent_id(display_name, username, avatar_url)
      `,
      )
      .eq("share_token", params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { score, status } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: challenge } = await supabase
      .from("friend_challenges")
      .select("*")
      .eq("share_token", params.id)
      .single()

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const isChallenger = challenge.challenger_id === user.id
    const updateData: Record<string, unknown> = {}

    if (score !== undefined) {
      updateData[isChallenger ? "challenger_score" : "opponent_score"] = score
    }

    if (status) {
      updateData.status = status
    }

    const { data, error } = await supabase
      .from("friend_challenges")
      .update(updateData)
      .eq("id", challenge.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
