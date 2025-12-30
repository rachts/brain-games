"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { getAllAchievements } from "@/lib/gamification"

interface UnlockedAchievement {
  achievement_type: string
  unlocked_at: string
}

export function AchievementsShowcase() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("achievements").select("achievement_type").eq("user_id", user.id)

        setUnlockedAchievements(new Set(data?.map((a) => a.achievement_type) || []))
      }
      setLoading(false)
    }

    fetchAchievements()
  }, [])

  if (loading) return null

  const allAchievements = getAllAchievements()

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Achievements</h3>
      <div className="grid grid-cols-4 gap-2">
        {allAchievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.has(achievement.id)
          return (
            <Card
              key={achievement.id}
              className={`glass p-3 text-center transition-all ${isUnlocked ? "opacity-100" : "opacity-40"}`}
              title={achievement.name}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className="text-xs font-medium line-clamp-2">{achievement.name}</div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
