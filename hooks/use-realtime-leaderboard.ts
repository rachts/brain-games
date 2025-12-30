"use client"

import { useEffect, useState } from "react"
import { subscribeToLeaderboard, unsubscribeFromChannel, type LiveLeaderboardUpdate } from "@/lib/realtime"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtimeLeaderboard() {
  const [updates, setUpdates] = useState<LiveLeaderboardUpdate[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

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
