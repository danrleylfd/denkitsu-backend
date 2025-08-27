const mongoose = require("../../utils/database")

const ToolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    title: {
      type: String,
      trim: true
    },
    Icon: {
      type: String,
      required: true,
      default: "PocketKnife"
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {
        type: "object",
        properties: {}
      }
    },
    httpConfig: {
      method: {
        type: String,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      queryParams: {
        type: mongoose.Schema.Types.Mixed
      },
      headers: {
        type: mongoose.Schema.Types.Mixed
      },
      body: {
        type: mongoose.Schema.Types.Mixed
      }
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    published: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
)

ToolSchema.index({ author: 1, name: 1 }, { unique: true })

const Tool = mongoose.model("Tool", ToolSchema)

module.exports = Tool
