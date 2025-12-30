"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  totalPoints: number
  gamesPlayed: number
  isCurrentUser: boolean
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [filter, setFilter] = useState<"all" | "week" | "month">("all")

  useEffect(() => {
    const users = storage.getAllUsers()
    const entries = users
      .map((u) => ({
        id: u.id,
        name: u.name,
        totalPoints: u.totalPoints,
        gamesPlayed: u.scores.length,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: entry.id === user?.id,
      }))

    setLeaderboard(entries)
  }, [user])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
            <p className="text-muted-foreground">Compete with players worldwide</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 justify-center">
            {(["all", "week", "month"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period)}
                className={`px-6 py-2 rounded-lg transition-smooth ${
                  filter === period ? "bg-primary text-white" : "glass hover:bg-card/60"
                }`}
              >
                {period === "all" ? "All Time" : period === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Rank</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Player</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Points</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Games</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-border/50 transition-smooth ${
                        entry.isCurrentUser ? "bg-primary/10" : "hover:bg-card/50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-sm">
                            {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{entry.name}</p>
                            {entry.isCurrentUser && <p className="text-xs text-primary">You</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-primary text-lg">{entry.totalPoints}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-muted-foreground">{entry.gamesPlayed}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Your Rank */}
          {user && (
            <div className="mt-12 glass p-8 rounded-xl text-center">
              <p className="text-muted-foreground mb-2">Your Rank</p>
              <div className="flex items-center justify-center gap-4">
                <p className="text-5xl font-bold text-primary">
                  {leaderboard.find((e) => e.id === user.id)?.rank || "N/A"}
                </p>
                <div>
                  <p className="text-2xl font-bold">{user.name}</p>
                  <p className="text-muted-foreground">
                    {leaderboard.find((e) => e.id === user.id)?.totalPoints || 0} points
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
