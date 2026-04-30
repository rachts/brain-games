import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Challenge from "@/lib/models/Challenge"
import User from "@/lib/models/User"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const challenges = await Challenge.find({
      $or: [{ challengerId: decoded.userId }, { opponentId: decoded.userId }]
    })
    .sort({ createdAt: -1 })
    .populate("challengerId", "username")
    .populate("opponentId", "username")
    .lean()

    const formattedData = challenges.map(c => ({
      id: c._id.toString(),
      challenger_id: c.challengerId?._id?.toString(),
      opponent_id: c.opponentId?._id?.toString(),
      game_type: c.gameType,
      status: c.status,
      share_token: c.shareToken,
      challenger_score: c.challengerScore,
      opponent_score: c.opponentScore,
      created_at: c.createdAt,
      challenger_profile: {
        display_name: c.challengerId?.username,
        username: c.challengerId?.username,
        avatar_url: null
      },
      opponent_profile: {
        display_name: c.opponentId?.username,
        username: c.opponentId?.username,
        avatar_url: null
      }
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("GET challenges error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { opponentId, gameType } = await request.json()
    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const challenge = new Challenge({
      challengerId: decoded.userId,
      opponentId: opponentId,
      gameType,
      status: "pending",
      shareToken
    })
    await challenge.save()

    return NextResponse.json({
      id: challenge._id.toString(),
      challenger_id: challenge.challengerId.toString(),
      opponent_id: challenge.opponentId?.toString(),
      game_type: challenge.gameType,
      status: challenge.status,
      share_token: challenge.shareToken,
      created_at: challenge.createdAt,
    })
  } catch (error) {
    console.error("POST challenges error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
