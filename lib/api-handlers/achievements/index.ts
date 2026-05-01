import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import UserAchievement from "@/lib/models/Achievement"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const achievements = await UserAchievement.find({ userId: decoded.userId }).lean()

    const formattedData = achievements.map(a => ({
      id: a._id.toString(),
      user_id: a.userId?.toString(),
      achievement_type: a.achievementId,
      created_at: a.unlockedAt
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("GET achievements error:", error)
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

    const { achievementType } = await request.json()

    const newAchievement = new UserAchievement({
      userId: decoded.userId,
      achievementId: achievementType
    })
    
    await newAchievement.save()

    return NextResponse.json({
      id: newAchievement._id.toString(),
      user_id: newAchievement.userId.toString(),
      achievement_type: newAchievement.achievementId,
      created_at: newAchievement.unlockedAt
    })
  } catch (error) {
    console.error("POST achievements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
