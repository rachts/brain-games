import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: String,
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "pro", "elite"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "inactive",
    },
    lastPlayedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model("User", userSchema)
