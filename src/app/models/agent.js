const mongoose = require("../../utils/database")

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    Icon: {
      type: String,
      required: true,
      default: "Bot",
    },
    description: {
      type: String,
      required: true,
    },
    prompt: {
      goal: { type: String, required: true },
      returnFormat: { type: String, required: true },
      warning: { type: String, required: true },
      contextDump: { type: String, required: true },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

AgentSchema.index({ user: 1, name: 1 }, { unique: true })

const Agent = mongoose.model("Agent", AgentSchema)

module.exports = Agent
