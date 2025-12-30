"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface GameResultProps {
  title: string
  score: number
  stats: Array<{ label: string; value: string | number }>
  onSave: () => void
  onPlayAgain: () => void
}

export function GameResult({ title, score, stats, onSave, onPlayAgain }: GameResultProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[600px]">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Game Over!</h1>

        <div className="glass p-12 rounded-xl">
          <p className="text-muted-foreground mb-2">Your Score</p>
          <p className="text-6xl font-bold gradient-text">{score}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onSave} size="lg">
            Save Score
          </Button>
          <Button onClick={onPlayAgain} variant="outline" size="lg">
            Play Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
