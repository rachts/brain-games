"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GameHeader } from "@/components/games/game-header"
import { GameResult } from "@/components/games/game-result"
import { storage } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import { toast } from "sonner"

interface LogicGameProps {
  userId?: string
}

interface Puzzle {
  id: string
  pattern: number[]
  options: number[][]
  correct: number
}

export function LogicGame({ userId }: LogicGameProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [gameState, setGameState] = useState<"ready" | "playing" | "over">("ready")
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [currentPuzzle, setCurrentPuzzle] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const difficultyConfig = {
    easy: { puzzles: 5, maxNum: 10 },
    medium: { puzzles: 8, maxNum: 20 },
    hard: { puzzles: 12, maxNum: 50 },
  }

  const generatePuzzles = (level: "easy" | "medium" | "hard") => {
    const config = difficultyConfig[level]
    const newPuzzles: Puzzle[] = []

    for (let i = 0; i < config.puzzles; i++) {
      const pattern = Array.from({ length: 3 }, () => Math.floor(Math.random() * config.maxNum))
      const correctAnswer = pattern.reduce((a, b) => a + b)
      const options = [
        [correctAnswer],
        [correctAnswer + Math.floor(Math.random() * 10) + 1],
        [correctAnswer - Math.floor(Math.random() * 10) - 1],
      ].sort(() => Math.random() - 0.5)

      newPuzzles.push({
        id: generateId(),
        pattern,
        options: options.map((o) => o),
        correct: options.findIndex((o) => o[0] === correctAnswer),
      })
    }

    setPuzzles(newPuzzles)
  }

  const startGame = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level)
    setGameState("playing")
    setScore(0)
    setCorrect(0)
    setCurrentPuzzle(0)
    setDuration(0)
    setStartTime(Date.now())
    generatePuzzles(level)
  }

  useEffect(() => {
    if (gameState !== "playing" || !startTime) return

    const timer = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 100)

    return () => clearInterval(timer)
  }, [gameState, startTime])

  const handleAnswer = (optionIndex: number) => {
    const puzzle = puzzles[currentPuzzle]
    const isCorrect = optionIndex === puzzle.correct

    if (isCorrect) {
      setCorrect((prev) => prev + 1)
      setScore((prev) => prev + 100)
    } else {
      setScore((prev) => Math.max(0, prev - 25))
    }

    if (currentPuzzle + 1 < puzzles.length) {
      setCurrentPuzzle((prev) => prev + 1)
    } else {
      setGameState("over")
    }
  }

  const handleSaveScore = async () => {
    if (!difficulty) return
    if (!userId) {
      toast.error("Please log in to save your score")
      return
    }

    try {
      const gameScore = {
        id: generateId(),
        gameType: "logic",
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

  if (gameState === "ready" && !difficulty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GameHeader title="Logic Puzzles" description="Solve complex pattern puzzles" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {Object.entries(difficultyConfig).map(([level, config]) => (
            <div
              key={level}
              onClick={() => startGame(level as "easy" | "medium" | "hard")}
              className="glass p-8 rounded-xl hover:bg-card/60 transition-smooth text-center cursor-pointer"
            >
              <h3 className="text-2xl font-bold capitalize mb-2">{level}</h3>
              <p className="text-muted-foreground mb-4">{config.puzzles} puzzles</p>
              <Button className="w-full pointer-events-none">Start Game</Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (gameState === "over") {
    return (
      <GameResult
        title="Logic Puzzles"
        score={score}
        stats={[
          { label: "Correct", value: `${correct}/${puzzles.length}` },
          { label: "Time", value: `${duration}s` },
          { label: "Difficulty", value: difficulty?.toUpperCase() || "" },
        ]}
        onSave={handleSaveScore}
        onPlayAgain={() => setDifficulty(null)}
      />
    )
  }

  const puzzle = puzzles[currentPuzzle]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <GameHeader title="Logic Puzzles" description="Solve the pattern" />

      <div className="mt-8 flex justify-between items-center mb-12">
        <div className="flex gap-8">
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-3xl font-bold text-primary">{score}</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-3xl font-bold text-primary">
              {currentPuzzle + 1}/{puzzles.length}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setDifficulty(null)}>
          Back
        </Button>
      </div>

      <div className="glass p-12 rounded-xl text-center mb-12">
        <p className="text-lg text-muted-foreground mb-6">What is the sum?</p>
        <div className="flex justify-center gap-8 mb-8">
          {puzzle.pattern.map((num, i) => (
            <div
              key={i}
              className="w-20 h-20 bg-primary/20 rounded-lg flex items-center justify-center text-3xl font-bold"
            >
              {num}
            </div>
          ))}
        </div>
        <p className="text-2xl font-bold">= ?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {puzzle.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="glass p-8 rounded-xl hover:bg-card/60 transition-smooth text-center"
          >
            <p className="text-4xl font-bold text-primary">{option[0]}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
