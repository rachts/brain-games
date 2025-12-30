// Mock database using localStorage
interface UserData {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
  createdAt: string
  scores: GameScore[]
  achievements: Achievement[]
  totalPoints: number
}

interface GameScore {
  id: string
  gameType: string
  score: number
  difficulty: string
  timestamp: string
  duration: number
}

interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: string
}

const USERS_KEY = "brain_games_users"
const SCORES_KEY = "brain_games_scores"

export const storage = {
  // User operations
  getAllUsers: (): UserData[] => {
    const data = localStorage.getItem(USERS_KEY)
    return data ? JSON.parse(data) : []
  },

  getUserByEmail: (email: string): UserData | undefined => {
    const users = storage.getAllUsers()
    return users.find((u) => u.email === email)
  },

  getUserById: (id: string): UserData | undefined => {
    const users = storage.getAllUsers()
    return users.find((u) => u.id === id)
  },

  createUser: (user: UserData): UserData => {
    const users = storage.getAllUsers()
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return user
  },

  updateUser: (id: string, updates: Partial<UserData>): UserData => {
    const users = storage.getAllUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error("User not found")
    users[index] = { ...users[index], ...updates }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return users[index]
  },

  // Score operations
  addScore: (userId: string, score: GameScore): GameScore => {
    const user = storage.getUserById(userId)
    if (!user) throw new Error("User not found")

    user.scores.push(score)
    user.totalPoints += score.score
    storage.updateUser(userId, user)
    return score
  },

  getUserScores: (userId: string): GameScore[] => {
    const user = storage.getUserById(userId)
    return user?.scores || []
  },

  getLeaderboard: (limit = 10) => {
    const users = storage.getAllUsers()
    return users
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((u) => ({
        id: u.id,
        name: u.name,
        totalPoints: u.totalPoints,
        gamesPlayed: u.scores.length,
      }))
  },

  // Achievement operations
  addAchievement: (userId: string, achievement: Achievement): void => {
    const user = storage.getUserById(userId)
    if (!user) throw new Error("User not found")

    if (!user.achievements.find((a) => a.id === achievement.id)) {
      user.achievements.push(achievement)
      storage.updateUser(userId, user)
    }
  },

  getUserAchievements: (userId: string): Achievement[] => {
    const user = storage.getUserById(userId)
    return user?.achievements || []
  },
}
