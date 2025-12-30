import connectDB from "./mongodb"
import User from "./models/User"
import Score from "./models/Score"
import type { GuestData } from "./guest-storage"

export interface BatchMigrationOptions {
  batchSize: number
  delayBetweenBatches: number
  onProgress?: (current: number, total: number) => void
}

const defaultOptions: BatchMigrationOptions = {
  batchSize: 100,
  delayBetweenBatches: 100,
}

// Migrate multiple guest scores in batches
export async function batchMigrateScores(
  userId: string,
  scores: GuestData["scores"],
  options: BatchMigrationOptions = defaultOptions,
) {
  await connectDB()

  const total = scores.length
  let migrated = 0
  const errors: string[] = []

  for (let i = 0; i < total; i += options.batchSize) {
    const batch = scores.slice(i, i + options.batchSize)

    try {
      const scoreDocs = batch.map((score) => ({
        userId,
        gameId: score.gameId,
        score: score.score,
        difficulty: score.difficulty,
        timeSpent: score.timeSpent,
        accuracy: score.accuracy,
        createdAt: new Date(score.createdAt),
      }))

      await Score.insertMany(scoreDocs)
      migrated += batch.length

      if (options.onProgress) {
        options.onProgress(migrated, total)
      }

      if (i + options.batchSize < total) {
        await new Promise((resolve) => setTimeout(resolve, options.delayBetweenBatches))
      }
    } catch (error) {
      errors.push(
        `Batch ${i / options.batchSize + 1} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  return {
    migrated,
    total,
    failed: total - migrated,
    errors,
  }
}

// Verify migration integrity
export async function verifyMigrationIntegrity(userId: string, expectedScoreCount: number) {
  await connectDB()

  const actualScoreCount = await Score.countDocuments({ userId })
  const user = await User.findById(userId)

  return {
    scoresMatch: actualScoreCount === expectedScoreCount,
    expectedScores: expectedScoreCount,
    actualScores: actualScoreCount,
    userExists: !!user,
    userStats: user
      ? {
          xp: user.xp,
          level: user.level,
          totalGamesPlayed: user.totalGamesPlayed,
          totalPoints: user.totalPoints,
        }
      : null,
  }
}
