"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { getAllAchievements } from "@/lib/gamification"

interface UnlockedAchievement {
  achievement_type: string
  created_at: string
}

export function AchievementsShowcase() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!isLoading && user) {
        try {
          const response = await fetch("/api/achievements", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })
          if (response.ok) {
            const data: UnlockedAchievement[] = await response.json()
            setUnlockedAchievements(new Set(data.map((a) => a.achievement_type)))
          }
        } catch (error) {
          console.error("Failed to fetch achievements:", error)
        }
      }
      if (!isLoading) {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [user, isLoading])

  if (loading || !user) return null

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
