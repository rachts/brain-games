"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { storage } from "@/lib/storage"

const ALL_ACHIEVEMENTS = [
  {
    id: "first-game",
    name: "First Steps",
    description: "Complete your first game",
    icon: "🎮",
  },
  {
    id: "memory-master",
    name: "Memory Master",
    description: "Score 500+ points in Memory game",
    icon: "🧠",
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Score 500+ points in Speed Challenge",
    icon: "⚡",
  },
  {
    id: "logic-wizard",
    name: "Logic Wizard",
    description: "Score 500+ points in Logic Puzzles",
    icon: "🎯",
  },
  {
    id: "attention-expert",
    name: "Attention Expert",
    description: "Score 500+ points in Attention Trainer",
    icon: "👁️",
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
  },
  {
    id: "100-games",
    name: "Centennial",
    description: "Play 100 games",
    icon: "💯",
  },
  {
    id: "10k-points",
    name: "Point Master",
    description: "Earn 10,000 total points",
    icon: "👑",
  },
]

export default function AchievementsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [achievements, setAchievements] = useState<any[]>([])
  const [unlockedCount, setUnlockedCount] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return

    const userData = storage.getUserById(user.id)
    if (userData) {
      const unlockedIds = userData.achievements.map((a) => a.id)
      const achievementsList = ALL_ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id),
        unlockedAt: userData.achievements.find((a) => a.id === achievement.id)?.unlockedAt,
      }))

      setAchievements(achievementsList)
      setUnlockedCount(unlockedIds.length)
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground">
              {unlockedCount} of {ALL_ACHIEVEMENTS.length} unlocked
            </p>
          </div>

          {/* Progress Bar */}
          <div className="glass p-6 rounded-xl mb-12">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold">Overall Progress</p>
              <p className="text-primary font-bold">{Math.round((unlockedCount / ALL_ACHIEVEMENTS.length) * 100)}%</p>
            </div>
            <div className="w-full bg-border rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                style={{
                  width: `${(unlockedCount / ALL_ACHIEVEMENTS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`glass p-6 rounded-xl text-center transition-smooth ${
                  achievement.unlocked ? "border border-primary/50" : "opacity-50"
                }`}
              >
                <div className="text-5xl mb-4">{achievement.icon}</div>
                <h3 className="font-bold mb-2">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                {achievement.unlocked && (
                  <p className="text-xs text-primary font-semibold">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
