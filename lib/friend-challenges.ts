import { createClient } from "@/lib/supabase/client"

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
export async function createFriendChallenge(opponentId: string, gameType: string): Promise<FriendChallenge | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const shareToken = generateShareToken()

  const { data, error } = await supabase
    .from("friend_challenges")
    .insert({
      challenger_id: user.id,
      opponent_id: opponentId,
      game_type: gameType,
      status: "pending",
      share_token: shareToken,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

// Get challenge by share token
export async function getChallengeByToken(token: string): Promise<FriendChallenge | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("friend_challenges")
    .select(
      `
      *,
      challenger_profile:challenger_id(display_name, username, avatar_url),
      opponent_profile:opponent_id(display_name, username, avatar_url)
    `,
    )
    .eq("share_token", token)
    .single()

  if (error) return null

  return data
}

// Accept a challenge
export async function acceptChallenge(challengeId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("friend_challenges").update({ status: "accepted" }).eq("id", challengeId)

  if (error) throw error
}

// Submit score for challenge
export async function submitChallengeScore(challengeId: string, score: number): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data: challenge } = await supabase.from("friend_challenges").select("*").eq("id", challengeId).single()

  if (!challenge) throw new Error("Challenge not found")

  const isChallenger = challenge.challenger_id === user.id
  const updateData = isChallenger ? { challenger_score: score } : { opponent_score: score }

  const { error } = await supabase.from("friend_challenges").update(updateData).eq("id", challengeId)

  if (error) throw error

  // Check if both players have submitted
  const { data: updated } = await supabase.from("friend_challenges").select("*").eq("id", challengeId).single()

  if (updated && updated.challenger_score !== null && updated.opponent_score !== null) {
    await supabase
      .from("friend_challenges")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", challengeId)
  }
}

// Get user's challenges
export async function getUserChallenges(): Promise<FriendChallenge[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("friend_challenges")
    .select(
      `
      *,
      challenger_profile:challenger_id(display_name, username, avatar_url),
      opponent_profile:opponent_id(display_name, username, avatar_url)
    `,
    )
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) return []

  return data || []
}

// Get challenge share URL
export function getChallengeShareUrl(shareToken: string): string {
  return `${typeof window !== "undefined" ? window.location.origin : ""}/challenges/${shareToken}`
}
