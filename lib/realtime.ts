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

// Mocking RealtimeChannel for compatibility with existing hooks
export interface PollingChannel {
  unsubscribe: () => void
}

export function subscribeToLeaderboard(callback: (update: LiveLeaderboardUpdate) => void): PollingChannel {
  let lastData: any = null
  const interval = setInterval(async () => {
    try {
      const res = await fetch('/api/community/leaderboard')
      if (res.ok) {
        const data = await res.json()
        if (data.leaderboard && data.leaderboard.length > 0) {
          const top = data.leaderboard[0]
          // Just trigger callback with top player for now as a mock for realtime
          if (JSON.stringify(top) !== JSON.stringify(lastData)) {
            callback({
              userId: top.username,
              username: top.username,
              totalPoints: top.totalPoints,
              rank: top.rank,
            })
            lastData = top
          }
        }
      }
    } catch (e) {}
  }, 5000)

  return {
    unsubscribe: () => clearInterval(interval)
  }
}

export function subscribeToBattleRoom(roomId: string, callback: (update: BattleRoomUpdate) => void): PollingChannel {
  const interval = setInterval(async () => {
    try {
      const res = await fetch('/api/community/battle-rooms')
      if (res.ok) {
        const data = await res.json()
        const room = data.rooms?.find((r: any) => r.id === roomId)
        if (room) {
          callback({
            roomId: room.id,
            status: room.status,
            participants: room.currentPlayers,
          })
        }
      }
    } catch (e) {}
  }, 3000)

  return {
    unsubscribe: () => clearInterval(interval)
  }
}

export function subscribeToBattleParticipants(
  roomId: string,
  callback: (update: { userId: string; score: number; finished: boolean }) => void,
): PollingChannel {
  // Mock polling for participants
  const interval = setInterval(async () => {
    // Left empty for now, as we don't have a specific battle participants API in MongoDB yet
  }, 3000)

  return {
    unsubscribe: () => clearInterval(interval)
  }
}

export function subscribeToFriendNotifications(userId: string, callback: (notification: FriendNotification) => void): PollingChannel {
  // Not implemented in polling yet
  return {
    unsubscribe: () => {}
  }
}

export async function sendFriendNotification(
  toUserId: string,
  notification: FriendNotification,
): Promise<{ status: number }> {
  // No-op for now
  return { status: 200 }
}

export function unsubscribeFromChannel(channel: PollingChannel) {
  if (channel && channel.unsubscribe) {
    channel.unsubscribe()
  }
}
