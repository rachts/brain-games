import { type GuestData, clearGuestData } from "./guest-storage"

export interface MergeStrategy {
  keepHigherScore: boolean
  sumXP: boolean
  keepBestStreak: boolean
}

const defaultMergeStrategy: MergeStrategy = {
  keepHigherScore: true,
  sumXP: true,
  keepBestStreak: true,
}

// Merge guest data with user data when logging in
export async function mergeGuestDataWithUser(
  userId: string,
  guestData: GuestData,
  strategy: MergeStrategy = defaultMergeStrategy,
) {
  try {
    const response = await fetch("/api/auth/merge-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        guestData,
        strategy,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to merge data")
    }

    const result = await response.json()

    // Clear guest data after successful merge
    clearGuestData()

    return result
  } catch (error) {
    console.error("Error merging guest data:", error)
    throw error
  }
}

// Calculate merged stats
export function calculateMergedStats(existingUserData: any, guestData: GuestData, strategy: MergeStrategy) {
  const mergedData = { ...existingUserData }

  // Merge scores
  if (guestData.scores && guestData.scores.length > 0) {
    mergedData.scores = [...(existingUserData.scores || []), ...guestData.scores]
  }

  // Merge XP
  if (strategy.sumXP) {
    mergedData.xp = (existingUserData.xp || 0) + guestData.xp
  }

  // Merge streaks
  if (strategy.keepBestStreak) {
    mergedData.bestStreak = Math.max(existingUserData.bestStreak || 0, guestData.bestStreak)
  }

  // Merge total points
  mergedData.totalPoints = (existingUserData.totalPoints || 0) + guestData.totalPoints
  mergedData.totalGamesPlayed = (existingUserData.totalGamesPlayed || 0) + guestData.totalGamesPlayed

  // Merge achievements
  const existingAchievements = new Set(existingUserData.achievements || [])
  guestData.achievements.forEach((ach) => existingAchievements.add(ach))
  mergedData.achievements = Array.from(existingAchievements)

  // Recalculate level based on merged XP
  mergedData.level = Math.floor(mergedData.xp / 1000) + 1

  return mergedData
}

// Sync guest scores to database
export async function syncGuestScoresToDB(userId: string, scores: GuestData["scores"]) {
  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        scores,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to sync scores")
    }

    return await response.json()
  } catch (error) {
    console.error("Error syncing scores:", error)
    throw error
  }
}
