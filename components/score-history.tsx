"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

interface ScoreHistoryProps {
  userId: string
}

export function ScoreHistory({ userId }: ScoreHistoryProps) {
  const [scores, setScores] = useState<any[]>([])

  useEffect(() => {
    const userScores = storage.getUserScores(userId)
    setScores(userScores.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10))
  }, [userId])

  if (scores.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No scores yet. Start playing to see your history!</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Game</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Score</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Difficulty</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Duration</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.id} className="border-b border-border/50 hover:bg-card/50 transition-smooth">
              <td className="py-3 px-4 capitalize">{score.gameType}</td>
              <td className="py-3 px-4 font-bold text-primary">{score.score}</td>
              <td className="py-3 px-4 capitalize text-sm">{score.difficulty}</td>
              <td className="py-3 px-4 text-sm">{score.duration}s</td>
              <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(new Date(score.timestamp))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
