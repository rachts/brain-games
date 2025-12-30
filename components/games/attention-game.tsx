"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GameHeader } from "@/components/games/game-header"
import { GameResult } from "@/components/games/game-result"
import { storage } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import { toast } from "sonner"

interface AttentionGameProps {
  userId: string
}

export function AttentionGame({ userId }: AttentionGameProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [gameState, setGameState] = useState<"ready" | "playing" | "over">("ready")
  const [target, setTarget] = useState<string>("")
  const [items, setItems] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const difficultyConfig = {
    easy: { duration: 30, itemCount: 9, target: "🎯" },
    medium: { duration: 45, itemCount: 16, target: "🎯" },
    hard: { duration: 60, itemCount: 25, target: "🎯" },
  }

  const generateItems = (count: number) => {
    const items = Array(count).fill("⭕")
    const randomIndex = Math.floor(Math.random() * count)
    items[randomIndex] = "🎯"
    return items.sort(() => Math.random() - 0.5)
  }

  const startGame = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level)
    setGameState("playing")
    setScore(0)
    setMistakes(0)
    setTimeLeft(difficultyConfig[level].duration)
    setItems(generateItems(difficultyConfig[level].itemCount))
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

  const handleItemClick = (item: string) => {
    if (item === "🎯") {
      setScore((prev) => prev + 10)
      setItems(generateItems(difficultyConfig[difficulty!].itemCount))
    } else {
      setMistakes((prev) => prev + 1)
    }
  }

  const handleSaveScore = async () => {
    if (!difficulty) return

    try {
      const finalScore = Math.max(0, score - mistakes * 5)

      const gameScore = {
        id: generateId(),
        gameType: "attention",
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
        <GameHeader title="Attention Trainer" description="Find the target among distractors" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {Object.entries(difficultyConfig).map(([level, config]) => (
            <button
              key={level}
              onClick={() => startGame(level as "easy" | "medium" | "hard")}
              className="glass p-8 rounded-xl hover:bg-card/60 transition-smooth text-center"
            >
              <h3 className="text-2xl font-bold capitalize mb-2">{level}</h3>
              <p className="text-muted-foreground mb-4">{config.itemCount} items</p>
              <Button className="w-full">Start Game</Button>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (gameState === "over") {
    const finalScore = Math.max(0, score - mistakes * 5)

    return (
      <GameResult
        title="Attention Trainer"
        score={finalScore}
        stats={[
          { label: "Found", value: score / 10 },
          { label: "Mistakes", value: mistakes },
          { label: "Difficulty", value: difficulty?.toUpperCase() || "" },
        ]}
        onSave={handleSaveScore}
        onPlayAgain={() => setDifficulty(null)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <GameHeader title="Attention Trainer" description="Find the target (🎯) among the distractors" />

      <div className="mt-8 flex justify-between items-center mb-12">
        <div className="flex gap-8">
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Found</p>
            <p className="text-3xl font-bold text-primary">{score / 10}</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Mistakes</p>
            <p className="text-3xl font-bold text-primary">{mistakes}</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Time Left</p>
            <p className="text-3xl font-bold text-primary">{timeLeft}s</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setDifficulty(null)}>
          Back
        </Button>
      </div>

      <div
        className={`grid gap-4 ${difficulty === "easy" ? "grid-cols-3" : difficulty === "medium" ? "grid-cols-4" : "grid-cols-5"}`}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => handleItemClick(item)}
            className="aspect-square rounded-lg text-4xl hover:scale-110 transition-transform glass hover:bg-card/60"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
