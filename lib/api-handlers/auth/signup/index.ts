import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { generateToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, displayName } = await request.json()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      email,
      username: email.split("@")[0],
      password: hashedPassword,
      xp: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      totalGamesPlayed: 0,
      totalPoints: 0,
      subscriptionTier: "free",
    })

    await newUser.save()

    const token = generateToken(newUser._id.toString())

    const userData = {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      displayName: newUser.username,
      xp: newUser.xp,
      level: newUser.level,
      currentStreak: newUser.currentStreak,
      bestStreak: newUser.bestStreak,
      totalGamesPlayed: newUser.totalGamesPlayed,
      totalPoints: newUser.totalPoints,
      subscriptionTier: newUser.subscriptionTier,
    }

    return NextResponse.json({ user: userData, token })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
