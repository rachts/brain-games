import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import BattleRoom from "@/lib/models/BattleRoom"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const roomsData = await BattleRoom.find({ status: "waiting" })
      .sort({ createdAt: -1 })
      .lean()

    const rooms = roomsData.map((room) => ({
      id: room._id.toString(),
      gameId: room.gameId,
      difficulty: room.difficultyLevel,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.participants ? room.participants.length : 0,
      status: room.status,
      roomCode: room.roomCode,
    }))

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("[v0] Error fetching battle rooms:", error)
    return NextResponse.json({ error: "Failed to fetch battle rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { gameId, difficulty } = await request.json()

    const newRoom = new BattleRoom({
      createdBy: decoded.userId,
      gameId: gameId,
      difficultyLevel: difficulty,
      roomCode: generateRoomCode(),
      participants: [decoded.userId]
    })
    
    await newRoom.save()

    return NextResponse.json({ roomId: newRoom._id.toString(), roomCode: newRoom.roomCode })
  } catch (error) {
    console.error("[v0] Error creating battle room:", error)
    return NextResponse.json({ error: "Failed to create battle room" }, { status: 500 })
  }
}
