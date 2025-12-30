"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
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

  useEffect(() => {
    const fetchChallenges = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const data = await getWeeklyChallenges(user.id)
        setChallenges(data)
      }
      setLoading(false)
    }

    fetchChallenges()
  }, [])

  if (loading) return null

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
