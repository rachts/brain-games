"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { MemoryGame } from "@/components/games/memory-game"
import { SpeedGame } from "@/components/games/speed-game"
import { LogicGame } from "@/components/games/logic-game"
import { AttentionGame } from "@/components/games/attention-game"

const GAME_COMPONENTS: Record<string, React.ComponentType<any>> = {
  memory: MemoryGame,
  speed: SpeedGame,
  logic: LogicGame,
  attention: AttentionGame,
}

export default function GamePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const gameId = params.gameId as string

  useEffect(() => {
    // Make login optional: we no longer redirect if user is not logged in.
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </main>
      </>
    )
  }

  const GameComponent = GAME_COMPONENTS[gameId]

  if (!GameComponent) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Game not found</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-card">
        <GameComponent userId={user?.id} />
      </main>
    </>
  )
}
