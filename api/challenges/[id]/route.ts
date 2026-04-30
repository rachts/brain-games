import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Challenge from "@/lib/models/Challenge"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const challenge = await Challenge.findOne({ shareToken: params.id })
      .populate("challengerId", "username")
      .populate("opponentId", "username")
      .lean()

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const formattedData = {
      id: challenge._id.toString(),
      challenger_id: challenge.challengerId?._id?.toString(),
      opponent_id: challenge.opponentId?._id?.toString(),
      game_type: challenge.gameType,
      status: challenge.status,
      share_token: challenge.shareToken,
      challenger_score: challenge.challengerScore,
      opponent_score: challenge.opponentScore,
      created_at: challenge.createdAt,
      challenger_profile: {
        display_name: challenge.challengerId?.username,
        username: challenge.challengerId?.username,
        avatar_url: null
      },
      opponent_profile: {
        display_name: challenge.opponentId?.username,
        username: challenge.opponentId?.username,
        avatar_url: null
      }
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("GET challenge error:", error)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { score, status } = await request.json()

    const challenge = await Challenge.findOne({ shareToken: params.id })
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const isChallenger = challenge.challengerId.toString() === decoded.userId

    if (score !== undefined) {
      if (isChallenger) challenge.challengerScore = score
      else challenge.opponentScore = score
    }

    if (status) {
      challenge.status = status
    }

    await challenge.save()

    return NextResponse.json({
      id: challenge._id.toString(),
      status: challenge.status,
      challenger_score: challenge.challengerScore,
      opponent_score: challenge.opponentScore,
      share_token: challenge.shareToken
    })
  } catch (error) {
    console.error("PATCH challenge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
