import type { GuestData } from "./guest-storage"

export interface MigrationReport {
  success: boolean
  scoresImported: number
  achievementsImported: number
  xpMerged: number
  streakMerged: boolean
  timestamp: string
  errors: string[]
}

// Validate guest data before migration
export function validateGuestData(data: GuestData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.guestId) {
    errors.push("Missing guest ID")
  }

  if (!Array.isArray(data.scores)) {
    errors.push("Scores is not an array")
  }

  if (typeof data.xp !== "number" || data.xp < 0) {
    errors.push("Invalid XP value")
  }

  if (typeof data.level !== "number" || data.level < 1) {
    errors.push("Invalid level value")
  }

  if (typeof data.totalGamesPlayed !== "number" || data.totalGamesPlayed < 0) {
    errors.push("Invalid total games played")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Generate migration report
export function generateMigrationReport(guestData: GuestData, mergedData: any, errors: string[] = []): MigrationReport {
  return {
    success: errors.length === 0,
    scoresImported: guestData.scores?.length || 0,
    achievementsImported: guestData.achievements?.length || 0,
    xpMerged: mergedData.xp || 0,
    streakMerged: mergedData.bestStreak > 0,
    timestamp: new Date().toISOString(),
    errors,
  }
}

// Backup guest data before migration
export function backupGuestData(data: GuestData): string {
  return JSON.stringify(data, null, 2)
}

// Restore guest data from backup
export function restoreGuestDataFromBackup(backup: string): GuestData | null {
  try {
    return JSON.parse(backup) as GuestData
  } catch (error) {
    console.error("Failed to restore backup:", error)
    return null
  }
}

// Calculate migration statistics
export function calculateMigrationStats(guestData: GuestData) {
  const totalPlayTime = guestData.scores.reduce((sum, score) => sum + (score.timeSpent || 0), 0)
  const averageScore = guestData.scores.length > 0 ? guestData.totalPoints / guestData.scores.length : 0
  const averageAccuracy =
    guestData.scores.length > 0
      ? guestData.scores.reduce((sum, score) => sum + (score.accuracy || 0), 0) / guestData.scores.length
      : 0

  return {
    totalScores: guestData.scores.length,
    totalPlayTime,
    averageScore: Math.round(averageScore),
    averageAccuracy: Math.round(averageAccuracy),
    totalXP: guestData.xp,
    currentLevel: guestData.level,
    bestStreak: guestData.bestStreak,
  }
}

// Export guest data as JSON
export function exportGuestDataAsJSON(data: GuestData): Blob {
  const json = JSON.stringify(data, null, 2)
  return new Blob([json], { type: "application/json" })
}

// Import guest data from JSON
export async function importGuestDataFromJSON(file: File): Promise<GuestData | null> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as GuestData
    const validation = validateGuestData(data)
    if (!validation.valid) {
      throw new Error(`Invalid data: ${validation.errors.join(", ")}`)
    }
    return data
  } catch (error) {
    console.error("Failed to import data:", error)
    return null
  }
}
