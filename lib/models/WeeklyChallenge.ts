import mongoose from "mongoose"

const weeklyChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challengeType: {
      type: String,
      required: true,
    },
    targetScore: {
      type: Number,
      required: true,
    },
    currentProgress: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    weekStart: {
      type: String,
      required: true,
    },
    weekEnd: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.WeeklyChallenge || mongoose.model("WeeklyChallenge", weeklyChallengeSchema)
