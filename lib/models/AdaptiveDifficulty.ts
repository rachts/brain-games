import mongoose from "mongoose"

const adaptiveDifficultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    currentDifficulty: {
      type: Number,
      default: 1,
    },
    performanceScore: {
      type: Number,
      default: 0.5,
    },
    streakCorrect: {
      type: Number,
      default: 0,
    },
    streakIncorrect: {
      type: Number,
      default: 0,
    },
    avgResponseTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

export default mongoose.models.AdaptiveDifficulty || mongoose.model("AdaptiveDifficulty", adaptiveDifficultySchema)
