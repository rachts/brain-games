"use client"

import { useEffect, useState } from "react"
import { subscribeToBattleRoom, subscribeToBattleParticipants, unsubscribeFromChannel } from "@/lib/realtime"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface BattleParticipant {
  userId: string
  score: number
  finished: boolean
}

export function useBattleRoomRealtime(roomId: string) {
  const [participants, setParticipants] = useState<BattleParticipant[]>([])
  const [roomStatus, setRoomStatus] = useState("waiting")
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  useEffect(() => {
    const roomChannel = subscribeToBattleRoom(roomId, (update) => {
      setRoomStatus(update.status)
    })

    const participantsChannel = subscribeToBattleParticipants(roomId, (update) => {
      setParticipants((prev) => {
        const existing = prev.find((p) => p.userId === update.userId)
        if (existing) {
          return prev.map((p) => (p.userId === update.userId ? { ...p, ...update } : p))
        }
        return [...prev, update]
      })
    })

    setChannels([roomChannel, participantsChannel])

    return () => {
      roomChannel && unsubscribeFromChannel(roomChannel)
      participantsChannel && unsubscribeFromChannel(participantsChannel)
    }
  }, [roomId])

  return { participants, roomStatus, isConnected: channels.length > 0 }
}
