const mongoose = require("../../utils/database");

const LinkerSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Linker", LinkerSchema);
