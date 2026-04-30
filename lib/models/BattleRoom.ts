import mongoose from "mongoose"

const battleRoomSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    maxPlayers: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ["waiting", "playing", "completed"],
      default: "waiting",
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.BattleRoom || mongoose.model("BattleRoom", battleRoomSchema)
