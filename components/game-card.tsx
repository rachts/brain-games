"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GameCardProps {
  game: {
    id: string
    name: string
    description: string
    icon: string
    color: string
    difficulty: string[]
  }
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="glass p-6 rounded-xl hover:bg-card/60 transition-smooth group">
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{game.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{game.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {game.difficulty.map((diff) => (
          <span key={diff} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
            {diff}
          </span>
        ))}
      </div>

      <Link href={`/games/${game.id}`} className="block">
        <Button className="w-full" size="sm">
          Play Now
        </Button>
      </Link>
    </div>
  )
}
