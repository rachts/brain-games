"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { getWeeklyChallenges } from "@/lib/gamification"

interface Challenge {
  id: string
  challenge_type: string
  target_score: number
  current_progress: number
  completed: boolean
}

const CHALLENGE_ICONS: Record<string, string> = {
  memory: "🧠",
  speed: "⚡",
  logic: "🎯",
  attention: "👁️",
}

export function WeeklyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!isLoading && user) {
        const data = await getWeeklyChallenges(user.id)
        // Ensure data is plain object without symbols if passing from server action to client
        setChallenges(JSON.parse(JSON.stringify(data)))
      }
      if (!isLoading) {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [user, isLoading])

  if (loading || !user) return null

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Weekly Challenges</h3>
      {challenges.map((challenge) => (
        <Card key={challenge.id} className="glass p-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{CHALLENGE_ICONS[challenge.challenge_type] || "🎮"}</div>
            <div className="flex-1">
              <div className="text-sm font-medium capitalize">{challenge.challenge_type}</div>
              <div className="w-full bg-card/50 rounded-full h-1.5 mt-1">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((challenge.current_progress / challenge.target_score) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {challenge.current_progress}/{challenge.target_score}
              </div>
            </div>
            {challenge.completed && <div className="text-lg">✓</div>}
          </div>
        </Card>
      ))}
    </div>
  )
}
