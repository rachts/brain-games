"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"

interface QuickStatsProps {
  userId: string
}

export function QuickStats({ userId }: QuickStatsProps) {
  const [stats, setStats] = useState({
    totalPoints: 0,
    gamesPlayed: 0,
    bestScore: 0,
    streak: 0,
  })

  useEffect(() => {
    const user = storage.getUserById(userId)
    if (user) {
      const scores = user.scores
      setStats({
        totalPoints: user.totalPoints,
        gamesPlayed: scores.length,
        bestScore: scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0,
        streak: calculateStreak(scores),
      })
    }
  }, [userId])

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {[
        { label: "Total Points", value: stats.totalPoints },
        { label: "Games Played", value: stats.gamesPlayed },
        { label: "Best Score", value: stats.bestScore },
        { label: "Current Streak", value: stats.streak },
      ].map((stat) => (
        <div key={stat.label} className="glass p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

function calculateStreak(scores: any[]): number {
  if (scores.length === 0) return 0

  const sortedScores = [...scores].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedScores.length; i++) {
    const scoreDate = new Date(sortedScores[i].timestamp)
    scoreDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (scoreDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}
