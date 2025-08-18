const mongoose = require("../../utils/database")

const ToolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      default: "Wrench",
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {
        type: "object",
        properties: {},
      },
    },
    httpConfig: {
      method: {
        type: String,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      queryParams: {
        type: mongoose.Schema.Types.Mixed,
      },
      headers: {
        type: mongoose.Schema.Types.Mixed,
      },
      body: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

ToolSchema.index({ user: 1, name: 1 }, { unique: true })

const Tool = mongoose.model("Tool", ToolSchema)

module.exports = Tool
