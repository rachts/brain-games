"use client"

import { useBattleRoomRealtime } from "@/hooks/use-battle-room-realtime"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BattleRoomLiveScoresProps {
  roomId: string
}

export function BattleRoomLiveScores({ roomId }: BattleRoomLiveScoresProps) {
  const { participants, roomStatus, isConnected } = useBattleRoomRealtime(roomId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Scores</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          <span className="text-sm text-muted-foreground capitalize">{roomStatus}</span>
        </div>
      </div>

      <div className="space-y-2">
        {participants
          .sort((a, b) => b.score - a.score)
          .map((participant, index) => (
            <Card key={participant.userId} className="glass p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary w-8 text-center">#{index + 1}</span>
                <div>
                  <p className="font-semibold">Player {participant.userId.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{participant.finished ? "Finished" : "In Progress"}</p>
                </div>
              </div>
              <Badge className="text-lg">{participant.score}</Badge>
            </Card>
          ))}
      </div>
    </div>
  )
}
