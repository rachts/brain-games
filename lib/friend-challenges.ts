"use server"

import connectDB from "@/lib/mongodb"
import Challenge from "@/lib/models/Challenge"

export interface FriendChallenge {
  id: string
  challenger_id: string
  opponent_id: string
  game_type: string
  challenger_score?: number
  opponent_score?: number
  status: "pending" | "accepted" | "completed"
  share_token: string
  created_at: string
  completed_at?: string
  challenger_profile?: {
    display_name: string
    username: string
    avatar_url?: string
  }
  opponent_profile?: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

// Generate unique share token
function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Create a friend challenge
export async function createFriendChallenge(userId: string, opponentId: string, gameType: string): Promise<FriendChallenge | null> {
  await connectDB()

  const shareToken = generateShareToken()

  const challenge = await Challenge.create({
    challengerId: userId,
    opponentId: opponentId,
    gameType: gameType,
    status: "pending",
    shareToken: shareToken,
  })

  return {
    id: challenge._id.toString(),
    challenger_id: challenge.challengerId.toString(),
    opponent_id: challenge.opponentId?.toString(),
    game_type: challenge.gameType,
    status: challenge.status,
    share_token: challenge.shareToken,
    created_at: challenge.createdAt.toISOString()
  }
}

// Get challenge by share token
export async function getChallengeByToken(token: string): Promise<FriendChallenge | null> {
  await connectDB()

  const challenge = await Challenge.findOne({ shareToken: token })
    .populate("challengerId", "username")
    .populate("opponentId", "username")
    .lean()

  if (!challenge) return null

  return {
    id: challenge._id.toString(),
    challenger_id: challenge.challengerId?._id?.toString(),
    opponent_id: challenge.opponentId?._id?.toString(),
    game_type: challenge.gameType,
    status: challenge.status,
    share_token: challenge.shareToken,
    created_at: challenge.createdAt.toISOString(),
    challenger_profile: {
      display_name: challenge.challengerId?.username,
      username: challenge.challengerId?.username,
    },
    opponent_profile: {
      display_name: challenge.opponentId?.username,
      username: challenge.opponentId?.username,
    }
  }
}

// Accept a challenge
export async function acceptChallenge(challengeId: string): Promise<void> {
  await connectDB()
  await Challenge.findByIdAndUpdate(challengeId, { status: "accepted" })
}

// Submit score for challenge
export async function submitChallengeScore(challengeId: string, userId: string, score: number): Promise<void> {
  await connectDB()

  const challenge = await Challenge.findById(challengeId)
  if (!challenge) throw new Error("Challenge not found")

  const isChallenger = challenge.challengerId.toString() === userId
  if (isChallenger) {
    challenge.challengerScore = score
  } else {
    challenge.opponentScore = score
  }

  if (challenge.challengerScore !== undefined && challenge.opponentScore !== undefined) {
    challenge.status = "completed"
  }

  await challenge.save()
}

// Get user's challenges
export async function getUserChallenges(userId: string): Promise<FriendChallenge[]> {
  await connectDB()

  const challenges = await Challenge.find({
    $or: [{ challengerId: userId }, { opponentId: userId }]
  })
    .sort({ createdAt: -1 })
    .populate("challengerId", "username")
    .populate("opponentId", "username")
    .lean()

  return challenges.map(challenge => ({
    id: challenge._id.toString(),
    challenger_id: challenge.challengerId?._id?.toString(),
    opponent_id: challenge.opponentId?._id?.toString(),
    game_type: challenge.gameType,
    status: challenge.status,
    share_token: challenge.shareToken,
    created_at: challenge.createdAt.toISOString(),
    challenger_profile: {
      display_name: challenge.challengerId?.username,
      username: challenge.challengerId?.username,
    },
    opponent_profile: {
      display_name: challenge.opponentId?.username,
      username: challenge.opponentId?.username,
    }
  }))
}

// Get challenge share URL
export function getChallengeShareUrl(shareToken: string): string {
  return `${typeof window !== "undefined" ? window.location.origin : ""}/challenges/${shareToken}`
}
