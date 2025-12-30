"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AdminStats {
  totalUsers: number
  totalGamesPlayed: number
  totalPointsDistributed: number
  averageScorePerGame: number
  gameStats: Record<string, { count: number; avgScore: number }>
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const allUsers = storage.getAllUsers()
    setUsers(allUsers)

    let totalGames = 0
    let totalPoints = 0
    const gameStats: Record<string, { count: number; scores: number[] }> = {}

    allUsers.forEach((u) => {
      u.scores.forEach((score) => {
        totalGames++
        totalPoints += score.score

        if (!gameStats[score.gameType]) {
          gameStats[score.gameType] = { count: 0, scores: [] }
        }
        gameStats[score.gameType].count++
        gameStats[score.gameType].scores.push(score.score)
      })
    })

    const processedGameStats: Record<string, { count: number; avgScore: number }> = {}
    Object.entries(gameStats).forEach(([game, data]) => {
      processedGameStats[game] = {
        count: data.count,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      }
    })

    setStats({
      totalUsers: allUsers.length,
      totalGamesPlayed: totalGames,
      totalPointsDistributed: totalPoints,
      averageScorePerGame: totalGames > 0 ? Math.round(totalPoints / totalGames) : 0,
      gameStats: processedGameStats,
    })
  }, [])

  const handleResetUser = (userId: string) => {
    try {
      const user = storage.getUserById(userId)
      if (user) {
        storage.updateUser(userId, {
          scores: [],
          achievements: [],
          totalPoints: 0,
        })
        setUsers(storage.getAllUsers())
        toast.success("User data reset successfully")
      }
    } catch (error) {
      toast.error("Failed to reset user data")
    }
  }

  const handleDeleteUser = (userId: string) => {
    try {
      const allUsers = storage.getAllUsers()
      const filtered = allUsers.filter((u) => u.id !== userId)
      localStorage.setItem("brain_games_users", JSON.stringify(filtered))
      setUsers(filtered)
      toast.success("User deleted successfully")
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

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
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and view platform statistics</p>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              {[
                { label: "Total Users", value: stats.totalUsers },
                { label: "Games Played", value: stats.totalGamesPlayed },
                { label: "Total Points", value: stats.totalPointsDistributed },
                { label: "Avg Score", value: stats.averageScorePerGame },
              ].map((stat) => (
                <div key={stat.label} className="glass p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Game Stats */}
          {stats && (
            <div className="glass p-8 rounded-xl mb-12">
              <h2 className="text-2xl font-bold mb-6">Game Statistics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(stats.gameStats).map(([game, data]) => (
                  <div key={game} className="border border-border/50 p-4 rounded-lg">
                    <p className="font-semibold capitalize mb-2">{game}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Games Played: {data.count}</span>
                      <span className="text-primary font-bold">Avg Score: {data.avgScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Management */}
          <div className="glass p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6">Users Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Games</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Points</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-card/50 transition-smooth">
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4">{u.scores.length}</td>
                      <td className="py-3 px-4 font-bold text-primary">{u.totalPoints}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleResetUser(u.id)} className="text-xs">
                            Reset
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-xs text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
