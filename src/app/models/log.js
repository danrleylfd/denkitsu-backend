const mongoose = require("../../utils/database")

const LogSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true
    },
    os: {
      type: String,
      required: true
    },
    browser: {
      type: String,
      required: true
    },
    route: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Log", LogSchema)
