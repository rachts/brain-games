"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GameHeader } from "@/components/games/game-header"
import { GameResult } from "@/components/games/game-result"
import { storage } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import { toast } from "sonner"

interface MemoryGameProps {
  userId: string
}

export function MemoryGame({ userId }: MemoryGameProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [cards, setCards] = useState<Array<{ id: string; value: number; flipped: boolean; matched: boolean }>>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [duration, setDuration] = useState(0)

  const difficultyConfig = {
    easy: { pairs: 6, time: 120 },
    medium: { pairs: 8, time: 180 },
    hard: { pairs: 12, time: 240 },
  }

  const initializeGame = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level)
    const config = difficultyConfig[level]
    const values = Array.from({ length: config.pairs }, (_, i) => i)
    const shuffled = [...values, ...values].sort(() => Math.random() - 0.5)

    setCards(
      shuffled.map((value) => ({
        id: generateId(),
        value,
        flipped: false,
        matched: false,
      })),
    )
    setFlipped([])
    setMoves(0)
    setMatched(0)
    setGameOver(false)
    setScore(0)
    setStartTime(Date.now())
    setDuration(0)
  }

  useEffect(() => {
    if (!startTime || gameOver) return

    const timer = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 100)

    return () => clearInterval(timer)
  }, [startTime, gameOver])

  useEffect(() => {
    if (flipped.length !== 2) return

    const [first, second] = flipped
    const firstCard = cards.find((c) => c.id === first)
    const secondCard = cards.find((c) => c.id === second)

    if (firstCard?.value === secondCard?.value) {
      setCards((prev) => prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true } : c)))
      setMatched((prev) => prev + 1)
      setFlipped([])
    } else {
      setTimeout(() => setFlipped([]), 1000)
    }

    setMoves((prev) => prev + 1)
  }, [flipped, cards])

  useEffect(() => {
    if (matched > 0 && difficulty && matched === difficultyConfig[difficulty].pairs) {
      const finalScore = Math.max(0, 1000 - moves * 10 - duration * 2)
      setScore(finalScore)
      setGameOver(true)
    }
  }, [matched, difficulty, moves, duration])

  const handleCardClick = (id: string) => {
    if (gameOver || flipped.length === 2 || flipped.includes(id)) return
    setFlipped((prev) => [...prev, id])
  }

  const handleSaveScore = async () => {
    if (!difficulty) return

    try {
      const gameScore = {
        id: generateId(),
        gameType: "memory",
        score,
        difficulty,
        timestamp: new Date().toISOString(),
        duration,
      }

      storage.addScore(userId, gameScore)
      toast.success("Score saved!")
    } catch (error) {
      toast.error("Failed to save score")
    }
  }

  if (!difficulty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GameHeader title="Memory Master" description="Match pairs to test your memory" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {Object.entries(difficultyConfig).map(([level, config]) => (
            <button
              key={level}
              onClick={() => initializeGame(level as "easy" | "medium" | "hard")}
              className="glass p-8 rounded-xl hover:bg-card/60 transition-smooth text-center"
            >
              <h3 className="text-2xl font-bold capitalize mb-2">{level}</h3>
              <p className="text-muted-foreground mb-4">{config.pairs} pairs</p>
              <Button className="w-full">Start Game</Button>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <GameResult
        title="Memory Master"
        score={score}
        stats={[
          { label: "Moves", value: moves },
          { label: "Time", value: `${duration}s` },
          { label: "Difficulty", value: difficulty.toUpperCase() },
        ]}
        onSave={handleSaveScore}
        onPlayAgain={() => setDifficulty(null)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <GameHeader title="Memory Master" description="Match pairs to test your memory" />

      <div className="mt-8 flex justify-between items-center">
        <div className="flex gap-8">
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Moves</p>
            <p className="text-3xl font-bold text-primary">{moves}</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="text-3xl font-bold text-primary">{duration}s</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Matched</p>
            <p className="text-3xl font-bold text-primary">
              {matched}/{difficultyConfig[difficulty].pairs}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setDifficulty(null)}>
          Back
        </Button>
      </div>

      <div
        className={`mt-12 grid gap-4 ${difficulty === "easy" ? "grid-cols-4" : difficulty === "medium" ? "grid-cols-4" : "grid-cols-6"}`}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-lg font-bold text-2xl transition-all ${
              flipped.includes(card.id) || card.matched ? "bg-primary text-white" : "glass hover:bg-card/60"
            }`}
            disabled={card.matched}
          >
            {flipped.includes(card.id) || card.matched ? card.value + 1 : "?"}
          </button>
        ))}
      </div>
    </div>
  )
}
