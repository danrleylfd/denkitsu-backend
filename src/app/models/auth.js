const mongoose = require("../../utils/database")
const { hash } = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
}, { timestamps: true })

UserSchema.pre("save", async function (next) {
  const encriptedPassword = await hash(this.password, 14)
  this.password = encriptedPassword
  next()
})

module.exports = mongoose.model("User", UserSchema)
