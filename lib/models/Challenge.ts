import mongoose from "mongoose"

const challengeSchema = new mongoose.Schema(
  {
    challengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gameId: String,
    gameType: String,
    difficulty: String,
    targetScore: Number,
    challengerScore: Number,
    opponentScore: Number,
    shareToken: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "declined"],
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
