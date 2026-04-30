"use server"

import connectDB from "@/lib/mongodb"
import GeneratedQuestion from "@/lib/models/GeneratedQuestion"

export async function getCachedOrGenerateQuestions(gameId: string, difficulty: number, count = 5) {
  await connectDB()

  // Try to get cached questions
  const cachedQuestions = await GeneratedQuestion.find({
    gameId,
    difficultyLevel: difficulty,
    expiresAt: { $gt: new Date() }
  })
    .limit(count)
    .lean()

  if (cachedQuestions && cachedQuestions.length >= count) {
    return cachedQuestions.map((q) => q.questionData)
  }

  // Generate new questions via API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-questions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, difficulty, count }),
    },
  )

  const { questions } = await response.json()

  // Cache the generated questions
  for (const question of questions) {
    await GeneratedQuestion.create({
      gameId: gameId,
      difficultyLevel: difficulty,
      questionData: question,
    })
  }

  return questions
}
