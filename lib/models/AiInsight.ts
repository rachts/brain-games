import mongoose from "mongoose"

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    insightText: {
      type: String,
      required: true,
    },
    insightType: {
      type: String,
      default: "general",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.AiInsight || mongoose.model("AiInsight", aiInsightSchema)
