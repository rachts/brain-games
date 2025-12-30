// Guest/Anonymous user data management with localStorage

export interface GuestData {
  guestId: string
  scores: Array<{
    gameId: string
    score: number
    difficulty: string
    timeSpent: number
    accuracy: number
    createdAt: string
  }>
  xp: number
  level: number
  currentStreak: number
  bestStreak: number
  totalGamesPlayed: number
  totalPoints: number
  achievements: string[]
  settings: {
    difficulty: string
    theme: string
    soundEnabled: boolean
    voiceEnabled: boolean
  }
}

const GUEST_DATA_KEY = "brain_games_guest_data"
const GUEST_ID_KEY = "brain_games_guest_id"

// Generate unique guest ID
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create guest ID
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return ""

  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    guestId = generateGuestId()
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  return guestId
}

// Initialize guest data
export function initializeGuestData(): GuestData {
  return {
    guestId: getOrCreateGuestId(),
    scores: [],
    xp: 0,
    level: 1,
    currentStreak: 0,
    bestStreak: 0,
    totalGamesPlayed: 0,
    totalPoints: 0,
    achievements: [],
    settings: {
      difficulty: "medium",
      theme: "dark",
      soundEnabled: true,
      voiceEnabled: false,
    },
  }
}

// Get guest data from localStorage
export function getGuestData(): GuestData {
  if (typeof window === "undefined") return initializeGuestData()

  const data = localStorage.getItem(GUEST_DATA_KEY)
  return data ? JSON.parse(data) : initializeGuestData()
}

// Save guest data to localStorage
export function saveGuestData(data: GuestData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data))
}

// Add score to guest data
export function addGuestScore(
  gameId: string,
  score: number,
  difficulty: string,
  timeSpent: number,
  accuracy: number,
): void {
  const data = getGuestData()
  data.scores.push({
    gameId,
    score,
    difficulty,
    timeSpent,
    accuracy,
    createdAt: new Date().toISOString(),
  })

  // Update stats
  data.totalGamesPlayed += 1
  data.totalPoints += score

  // Update XP (10 XP per point)
  const xpGain = score * 10
  data.xp += xpGain

  // Level up every 1000 XP
  const newLevel = Math.floor(data.xp / 1000) + 1
  if (newLevel > data.level) {
    data.level = newLevel
  }

  saveGuestData(data)
}

// Update guest streak
export function updateGuestStreak(played: boolean): void {
  const data = getGuestData()
  if (played) {
    data.currentStreak += 1
    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak
    }
  } else {
    data.currentStreak = 0
  }
  saveGuestData(data)
}

// Add achievement to guest
export function addGuestAchievement(achievementId: string): void {
  const data = getGuestData()
  if (!data.achievements.includes(achievementId)) {
    data.achievements.push(achievementId)
    saveGuestData(data)
  }
}

// Clear guest data
export function clearGuestData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(GUEST_DATA_KEY)
  localStorage.removeItem(GUEST_ID_KEY)
}
