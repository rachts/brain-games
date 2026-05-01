import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Discussion from "@/lib/models/Discussion"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const data = await Discussion.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "username")
      .lean()

    const discussions = data.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      content: d.content,
      username: d.userId?.username || "Anonymous",
      gameId: d.gameId,
      likes: d.likes,
      repliesCount: d.repliesCount,
      createdAt: d.createdAt,
    }))

    return NextResponse.json({ discussions })
  } catch (error) {
    console.error("[v0] Error fetching discussions:", error)
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 })
  }
}
