"use client"

import { useEffect, useState } from "react"
import { subscribeToLeaderboard, unsubscribeFromChannel, type LiveLeaderboardUpdate, type PollingChannel } from "@/lib/realtime"

export function useRealtimeLeaderboard() {
  const [updates, setUpdates] = useState<LiveLeaderboardUpdate[]>([])
  const [channel, setChannel] = useState<PollingChannel | null>(null)

  useEffect(() => {
    const newChannel = subscribeToLeaderboard((update) => {
      setUpdates((prev) => {
        const filtered = prev.filter((u) => u.userId !== update.userId)
        return [update, ...filtered].slice(0, 100)
      })
    })

    setChannel(newChannel)

    return () => {
      if (newChannel) {
        unsubscribeFromChannel(newChannel)
      }
    }
  }, [])

  return { updates, isConnected: !!channel }
}
