const mongoose = require("../../utils/database")
const { hash } = require("bcryptjs")

const UserSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      unique: true,
      sparse: true // Permite múltiplos documentos com valor nulo, mas garante unicidade para os que têm valor.
    },
    githubAccessToken: { type: String, select: false },
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
      // required: true,
      required: function() { return !this.githubId },
      sparse: true, // Essencial para permitir usuários do GitHub sem e-mail
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      // required: true,
      required: function() { return!this.githubId }, // Torna a senha opcional se o usuário estiver logando com o GitHub
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
    plan: {
      type: String,
      default: "free"
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true
    },
    stripeSubscriptionStatus: {
      type: String
    },
    subscriptionStartDate: {
      type: Date
    }
  },
  { timestamps: true }
)

UserSchema.pre("save", async function (next) {
  // if (!this.isModified("password")) return next()
  if (!this.isModified("password") || !this.password) return next() // Apenas faz o hash se a senha for modificada e existir
  const encriptedPassword = await hash(this.password, 10)
  this.password = encriptedPassword
  next()
})

module.exports = mongoose.model("User", UserSchema)
