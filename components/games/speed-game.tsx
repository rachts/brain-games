"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GameHeader } from "@/components/games/game-header"
import { GameResult } from "@/components/games/game-result"
import { storage } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import { toast } from "sonner"

interface SpeedGameProps {
  userId?: string
}

export function SpeedGame({ userId }: SpeedGameProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [gameState, setGameState] = useState<"ready" | "playing" | "over">("ready")
  const [target, setTarget] = useState<string>("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [reactionTime, setReactionTime] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)

  const difficultyConfig = {
    easy: { duration: 30, rounds: 5 },
    medium: { duration: 45, rounds: 8 },
    hard: { duration: 60, rounds: 12 },
  }

  const generateTarget = () => {
    const colors = ["red", "blue", "green", "yellow", "purple"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const startGame = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level)
    setGameState("playing")
    setScore(0)
    setReactionTime([])
    setTimeLeft(difficultyConfig[level].duration)
    setTarget(generateTarget())
    setStartTime(Date.now())
  }

  useEffect(() => {
    if (gameState !== "playing" || !difficulty) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("over")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, difficulty])

  const handleTargetClick = () => {
    if (!startTime) return

    const reaction = Date.now() - startTime
    setReactionTime((prev) => [...prev, reaction])
    setScore((prev) => prev + 1)
    setTarget(generateTarget())
    setStartTime(Date.now())
  }

  const handleSaveScore = async () => {
    if (!difficulty) return
    if (!userId) {
      toast.error("Please log in to save your score")
      return
    }

    try {
      const avgReaction =
        reactionTime.length > 0 ? Math.round(reactionTime.reduce((a, b) => a + b) / reactionTime.length) : 0
      const finalScore = score * 100 + Math.max(0, 500 - avgReaction)

      const gameScore = {
        id: generateId(),
        gameType: "speed",
        score: finalScore,
        difficulty,
        timestamp: new Date().toISOString(),
        duration: difficultyConfig[difficulty].duration,
      }

      storage.addScore(userId, gameScore)
      toast.success("Score saved!")
    } catch (error) {
      toast.error("Failed to save score")
    }
  }

  if (gameState === "ready" && !difficulty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GameHeader title="Speed Challenge" description="React fast to visual stimuli" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {Object.entries(difficultyConfig).map(([level, config]) => (
            <div
              key={level}
              onClick={() => startGame(level as "easy" | "medium" | "hard")}
              className="glass p-8 rounded-xl hover:bg-card/60 transition-smooth text-center cursor-pointer"
            >
              <h3 className="text-2xl font-bold capitalize mb-2">{level}</h3>
              <p className="text-muted-foreground mb-4">{config.duration}s</p>
              <Button className="w-full pointer-events-none">Start Game</Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (gameState === "over") {
    const avgReaction =
      reactionTime.length > 0 ? Math.round(reactionTime.reduce((a, b) => a + b) / reactionTime.length) : 0
    const finalScore = score * 100 + Math.max(0, 500 - avgReaction)

    return (
      <GameResult
        title="Speed Challenge"
        score={finalScore}
        stats={[
          { label: "Clicks", value: score },
          { label: "Avg Reaction", value: `${avgReaction}ms` },
          { label: "Difficulty", value: difficulty?.toUpperCase() || "" },
        ]}
        onSave={handleSaveScore}
        onPlayAgain={() => setDifficulty(null)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[600px]">
      <GameHeader title="Speed Challenge" description="Click the target as fast as you can!" />

      <div className="mt-12 flex gap-8 mb-12">
        <div className="glass p-6 rounded-lg">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-4xl font-bold text-primary">{score}</p>
        </div>
        <div className="glass p-6 rounded-lg">
          <p className="text-sm text-muted-foreground">Time Left</p>
          <p className="text-4xl font-bold text-primary">{timeLeft}s</p>
        </div>
      </div>

      <button
        onClick={handleTargetClick}
        className={`w-48 h-48 rounded-full font-bold text-2xl transition-all transform hover:scale-105 ${
          target === "red"
            ? "bg-red-500"
            : target === "blue"
              ? "bg-blue-500"
              : target === "green"
                ? "bg-green-500"
                : target === "yellow"
                  ? "bg-yellow-500"
                  : "bg-purple-500"
        } text-white shadow-lg`}
      >
        Click!
      </button>
    </div>
  )
}
