"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ChallengeCardProps {
  challenge: {
    id: string
    game_type: string
    status: string
    challenger_score?: number
    opponent_score?: number
    challenger_profile?: { display_name: string }
    opponent_profile?: { display_name: string }
  }
}

const GAME_ICONS: Record<string, string> = {
  memory: "🧠",
  speed: "⚡",
  logic: "🎯",
  attention: "👁️",
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isCompleted = challenge.status === "completed"
  const winner =
    isCompleted && challenge.challenger_score !== undefined && challenge.opponent_score !== undefined
      ? challenge.challenger_score > challenge.opponent_score
        ? "challenger"
        : "opponent"
      : null

  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{GAME_ICONS[challenge.game_type] || "🎮"}</span>
          <div>
            <div className="font-semibold capitalize">{challenge.game_type}</div>
            <div className="text-xs text-muted-foreground">{challenge.status}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>{challenge.challenger_profile?.display_name}</span>
          {isCompleted && <span className="font-bold">{challenge.challenger_score}</span>}
        </div>
        <div className="flex justify-between text-sm">
          <span>{challenge.opponent_profile?.display_name}</span>
          {isCompleted && <span className="font-bold">{challenge.opponent_score}</span>}
        </div>
      </div>

      {isCompleted && winner && (
        <div className="text-center text-sm font-semibold text-primary mb-3">
          {winner === "challenger"
            ? challenge.challenger_profile?.display_name
            : challenge.opponent_profile?.display_name}{" "}
          wins!
        </div>
      )}

      <Link href={`/challenges/${challenge.id}`}>
        <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
          {isCompleted ? "View Results" : "View Challenge"}
        </Button>
      </Link>
    </Card>
  )
}
