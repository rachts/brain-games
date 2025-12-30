import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"

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

    const { plan } = await request.json()

    const session = await createCheckoutSession(user.data.user.id, plan)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
