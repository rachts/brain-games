"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  rank: number
  username: string
  totalPoints: number
  gamesPlayed: number
  avgScore: number
}

export function PublicLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    try {
      const response = await fetch("/api/community/leaderboard")
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error("[v0] Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading leaderboard...</div>
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((entry, index) => (
        <Card key={index} className="glass p-6 flex items-center justify-between hover:bg-card/60 transition-smooth">
          <div className="flex items-center gap-6 flex-1">
            <div className="text-3xl font-bold text-primary w-12 text-center">#{entry.rank}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{entry.username}</h3>
              <p className="text-sm text-muted-foreground">
                {entry.gamesPlayed} games played • Avg score: {entry.avgScore.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="text-lg px-4 py-2">{entry.totalPoints.toLocaleString()} pts</Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
