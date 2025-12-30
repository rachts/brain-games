import mongoose from "mongoose"

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    timeSpent: Number,
    accuracy: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Score || mongoose.model("Score", scoreSchema)
