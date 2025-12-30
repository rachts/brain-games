"use client"

import { useRealtimeLeaderboard } from "@/hooks/use-realtime-leaderboard"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function LiveLeaderboardTicker() {
  const { updates, isConnected } = useRealtimeLeaderboard()

  if (!isConnected) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 space-y-2 z-50">
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm text-muted-foreground">Live Updates</span>
      </div>

      {updates.slice(0, 3).map((update) => (
        <Card key={update.userId} className="glass p-3 animate-in slide-in-from-right">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{update.username}</p>
              <p className="text-xs text-muted-foreground">Rank #{update.rank}</p>
            </div>
            <Badge>{update.totalPoints.toLocaleString()} pts</Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
