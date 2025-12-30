"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { storage } from "@/lib/storage"
import { AnalyticsChart } from "@/components/analytics-chart"
import { ScoreHistory } from "@/components/score-history"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPoints: 0,
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    gameBreakdown: {} as Record<string, number>,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return

    const userData = storage.getUserById(user.id)
    if (userData) {
      const scores = userData.scores
      const gameBreakdown: Record<string, number> = {}

      scores.forEach((score) => {
        gameBreakdown[score.gameType] = (gameBreakdown[score.gameType] || 0) + 1
      })

      setStats({
        totalPoints: userData.totalPoints,
        gamesPlayed: scores.length,
        bestScore: scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0,
        gameBreakdown,
      })
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
          {/* Profile Header */}
          <div className="glass p-8 rounded-xl mb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Points", value: stats.totalPoints },
              { label: "Games Played", value: stats.gamesPlayed },
              { label: "Best Score", value: stats.bestScore },
              { label: "Average Score", value: stats.averageScore },
            ].map((stat) => (
              <div key={stat.label} className="glass p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Analytics */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="glass p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Games Played</h2>
              <AnalyticsChart data={stats.gameBreakdown} />
            </div>

            <div className="glass p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Game Distribution</h2>
              <div className="space-y-4">
                {Object.entries(stats.gameBreakdown).map(([game, count]) => (
                  <div key={game} className="flex items-center justify-between">
                    <span className="capitalize text-muted-foreground">{game}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-border rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(count / stats.gamesPlayed) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score History */}
          <div className="glass p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6">Recent Scores</h2>
            <ScoreHistory userId={user.id} />
          </div>
        </div>
      </main>
    </>
  )
}
