const mongoose = require("../../utils/database")

const AcquisitionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType" },
    itemType: { type: String, required: true, enum: ["Agent", "Tool"] }
  },
  { timestamps: true }
)

AcquisitionSchema.index({ user: 1, item: 1 }, { unique: true })

module.exports = mongoose.model("Acquisition", AcquisitionSchema)
