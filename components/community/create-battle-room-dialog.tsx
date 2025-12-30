"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CreateBattleRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBattleRoomDialog({ open, onOpenChange }: CreateBattleRoomDialogProps) {
  const [selectedGame, setSelectedGame] = useState("memory")
  const [difficulty, setDifficulty] = useState(1)
  const [loading, setLoading] = useState(false)

  const games = [
    { id: "memory", name: "Memory Master" },
    { id: "speed", name: "Speed Challenge" },
    { id: "logic", name: "Logic Puzzles" },
    { id: "attention", name: "Attention Trainer" },
  ]

  async function createBattleRoom() {
    setLoading(true)
    try {
      const response = await fetch("/api/community/battle-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          difficulty,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = `/games/battle/${data.roomId}`
      }
    } catch (error) {
      console.error("[v0] Error creating battle room:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Battle Room</DialogTitle>
          <DialogDescription>Challenge other players in real-time competitions</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Select Game</label>
            <div className="grid grid-cols-2 gap-2">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className={`p-3 cursor-pointer transition-smooth ${
                    selectedGame === game.id ? "bg-primary text-primary-foreground" : "glass hover:bg-card/60"
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <p className="text-sm font-medium text-center">{game.name}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Difficulty Level: {difficulty}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={createBattleRoom} disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Battle"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
