"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { GameCard } from "@/components/game-card"
import { QuickStats } from "@/components/quick-stats"
import { Button } from "@/components/ui/button"
import { getGuestData } from "@/lib/guest-storage"

const GAMES = [
  {
    id: "memory",
    name: "Memory Master",
    description: "Match pairs and test your memory",
    icon: "🧠",
    color: "from-blue-500 to-cyan-500",
    difficulty: ["Easy", "Medium", "Hard"],
  },
  {
    id: "speed",
    name: "Speed Challenge",
    description: "React fast to visual stimuli",
    icon: "⚡",
    color: "from-yellow-500 to-orange-500",
    difficulty: ["Easy", "Medium", "Hard"],
  },
  {
    id: "logic",
    name: "Logic Puzzles",
    description: "Solve complex pattern puzzles",
    icon: "🎯",
    color: "from-purple-500 to-pink-500",
    difficulty: ["Easy", "Medium", "Hard"],
  },
  {
    id: "attention",
    name: "Attention Trainer",
    description: "Improve focus and concentration",
    icon: "👁️",
    color: "from-green-500 to-emerald-500",
    difficulty: ["Easy", "Medium", "Hard"],
  },
]

export default function DashboardPage() {
  const { user, isGuest, isLoading } = useAuth()
  const router = useRouter()
  const [guestStats, setGuestStats] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && isGuest) {
      // Load guest data
      const data = getGuestData()
      setGuestStats(data)
    }
  }, [isGuest, isLoading])

  if (isLoading) {
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

  const displayUser = user || guestStats

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isGuest && (
            <div className="mb-6 glass p-4 rounded-lg border border-primary/50 bg-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Playing as Guest</p>
                  <p className="text-xs text-muted-foreground">
                    Your progress is saved locally. Login to save permanently.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => router.push("/login")}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => router.push("/signup")}>
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back{displayUser ? `, ${isGuest ? "Guest" : displayUser.username}` : ""}!
            </h1>
            <p className="text-muted-foreground">Choose a game to start training your brain</p>
          </div>

          {/* Quick Stats */}
          {displayUser && (
            <QuickStats
              stats={{
                totalGamesPlayed: displayUser.totalGamesPlayed || 0,
                totalPoints: displayUser.totalPoints || 0,
                currentStreak: displayUser.currentStreak || 0,
                level: displayUser.level || 1,
              }}
            />
          )}

          {/* Games Grid */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Available Games</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {GAMES.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
