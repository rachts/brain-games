import { createBrowserClient } from "@supabase/ssr"
import type { RealtimeChannel } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

export interface LiveLeaderboardUpdate {
  userId: string
  username: string
  totalPoints: number
  rank: number
}

export interface BattleRoomUpdate {
  roomId: string
  status: string
  participants: number
  winner?: string
}

export interface FriendNotification {
  type: "challenge" | "achievement" | "score_update"
  fromUser: string
  message: string
  timestamp: string
}

export function subscribeToLeaderboard(callback: (update: LiveLeaderboardUpdate) => void): RealtimeChannel {
  const supabase = getSupabaseClient()

  const channel = supabase
    .channel("public:leaderboard")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "public_leaderboard",
      },
      (payload) => {
        callback({
          userId: payload.new.user_id,
          username: payload.new.username,
          totalPoints: payload.new.total_points,
          rank: payload.new.rank,
        })
      },
    )
    .subscribe()

  return channel
}

export function subscribeToBattleRoom(roomId: string, callback: (update: BattleRoomUpdate) => void): RealtimeChannel {
  const supabase = getSupabaseClient()

  const channel = supabase
    .channel(`battle:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battle_rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        callback({
          roomId: payload.new.id,
          status: payload.new.status,
          participants: payload.new.max_players,
        })
      },
    )
    .subscribe()

  return channel
}

export function subscribeToBattleParticipants(
  roomId: string,
  callback: (update: { userId: string; score: number; finished: boolean }) => void,
): RealtimeChannel {
  const supabase = getSupabaseClient()

  const channel = supabase
    .channel(`battle-participants:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battle_participants",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        callback({
          userId: payload.new.user_id,
          score: payload.new.score,
          finished: !!payload.new.finished_at,
        })
      },
    )
    .subscribe()

  return channel
}

export function subscribeToFriendNotifications(userId: string, callback: (notification: FriendNotification) => void) {
  const supabase = getSupabaseClient()

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on("broadcast", { event: "friend_notification" }, (payload) => {
      callback(payload.payload as FriendNotification)
    })
    .subscribe()

  return channel
}

export function sendFriendNotification(
  toUserId: string,
  notification: FriendNotification,
): Promise<{ status: number }> {
  const supabase = getSupabaseClient()

  return supabase.channel(`notifications:${toUserId}`).send("broadcast", {
    event: "friend_notification",
    payload: notification,
  })
}

export function unsubscribeFromChannel(channel: RealtimeChannel) {
  return channel.unsubscribe()
}
