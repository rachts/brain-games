"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BattleRoom {
  id: string
  gameId: string
  difficulty: number
  maxPlayers: number
  currentPlayers: number
  status: string
  roomCode: string
}

export function BattleRoomsList() {
  const [rooms, setRooms] = useState<BattleRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBattleRooms()
    const interval = setInterval(fetchBattleRooms, 3000)
    return () => clearInterval(interval)
  }, [])

  async function fetchBattleRooms() {
    try {
      const response = await fetch("/api/community/battle-rooms")
      const data = await response.json()
      setRooms(data.rooms || [])
    } catch (error) {
      console.error("[v0] Error fetching battle rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  async function joinBattleRoom(roomId: string) {
    try {
      const response = await fetch(`/api/community/battle-rooms/${roomId}/join`, {
        method: "POST",
      })
      if (response.ok) {
        window.location.href = `/games/battle/${roomId}`
      }
    } catch (error) {
      console.error("[v0] Error joining battle room:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading battle rooms...</div>
  }

  if (rooms.length === 0) {
    return (
      <Card className="glass p-12 text-center">
        <p className="text-muted-foreground mb-4">No active battle rooms. Create one to get started!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <Card key={room.id} className="glass p-6 flex items-center justify-between hover:bg-card/60 transition-smooth">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold capitalize">{room.gameId}</h3>
              <Badge variant={room.status === "waiting" ? "default" : "secondary"}>{room.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Difficulty: Level {room.difficulty} • Players: {room.currentPlayers}/{room.maxPlayers}
            </p>
          </div>
          <Button onClick={() => joinBattleRoom(room.id)} disabled={room.currentPlayers >= room.maxPlayers}>
            Join Battle
          </Button>
        </Card>
      ))}
    </div>
  )
}
