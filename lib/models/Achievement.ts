import mongoose from "mongoose"

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    achievementId: String,
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.UserAchievement || mongoose.model("UserAchievement", userAchievementSchema)
