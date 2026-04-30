import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { plan } = await request.json()

    const session = await createCheckoutSession(decoded.userId, plan)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
