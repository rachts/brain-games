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
      .from("community_discussions")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    const discussions = data.map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      username: d.profiles?.username || "Anonymous",
      gameId: d.game_id,
      likes: d.likes,
      repliesCount: d.replies_count,
      createdAt: d.created_at,
    }))

    return NextResponse.json({ discussions })
  } catch (error) {
    console.error("[v0] Error fetching discussions:", error)
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 })
  }
}
