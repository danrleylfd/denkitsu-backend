const User = require("../models/auth")
const createAppError = require("../../utils/errors")

const proOnly = async (req, res, next) => {
  const user = await User.findById(req.userID)
  if (user && user.plan === "pro" && user.stripeSubscriptionStatus === "active") return next()
  throw createAppError("Acesso negado. Funcionalidade exclusiva do Plano Pro.", 403, "PRO_PLAN_REQUIRED")
}

const fn = proOnly

module.exports = fn
