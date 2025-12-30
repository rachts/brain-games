import mongoose from "mongoose"

const challengeSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    gameId: String,
    difficulty: String,
    targetScore: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Challenge || mongoose.model("Challenge", challengeSchema)
