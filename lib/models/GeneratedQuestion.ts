import mongoose from "mongoose"

const generatedQuestionSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
    },
    difficultyLevel: {
      type: Number,
      required: true,
    },
    questionData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  { timestamps: true },
)

export default mongoose.models.GeneratedQuestion || mongoose.model("GeneratedQuestion", generatedQuestionSchema)
