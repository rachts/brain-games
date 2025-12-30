import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

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
      .from("battle_rooms")
      .select("*, battle_participants(count)")
      .eq("status", "waiting")
      .order("created_at", { ascending: false })

    if (error) throw error

    const rooms = data.map((room) => ({
      id: room.id,
      gameId: room.game_id,
      difficulty: room.difficulty_level,
      maxPlayers: room.max_players,
      currentPlayers: room.battle_participants[0]?.count || 0,
      status: room.status,
      roomCode: room.room_code,
    }))

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("[v0] Error fetching battle rooms:", error)
    return NextResponse.json({ error: "Failed to fetch battle rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { gameId, difficulty } = await request.json()

    const { data, error } = await supabase
      .from("battle_rooms")
      .insert({
        created_by: user.data.user.id,
        game_id: gameId,
        difficulty_level: difficulty,
        room_code: generateRoomCode(),
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as first participant
    await supabase.from("battle_participants").insert({
      room_id: data.id,
      user_id: user.data.user.id,
    })

    return NextResponse.json({ roomId: data.id, roomCode: data.room_code })
  } catch (error) {
    console.error("[v0] Error creating battle room:", error)
    return NextResponse.json({ error: "Failed to create battle room" }, { status: 500 })
  }
}
