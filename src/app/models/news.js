const mongoose = require("../../utils/database")

const NewsSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model("News", NewsSchema)
