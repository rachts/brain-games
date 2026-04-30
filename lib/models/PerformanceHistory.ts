import mongoose from "mongoose"

const performanceHistorySchema = new mongoose.Schema(
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
    score: Number,
    difficultyLevel: Number,
    responseTime: Number,
    correctAnswers: Number,
    totalQuestions: Number,
  },
  { timestamps: true },
)

export default mongoose.models.PerformanceHistory || mongoose.model("PerformanceHistory", performanceHistorySchema)
