const { Router } = require("express")
const adminMiddleware = require("../middlewares/admin")
const asyncHandler = require("../middlewares/asyncHandler")

const routes = Router()
routes.use(adminMiddleware)

const cancelSubscriptionAdmin = require("../views/admin/cancelSubscription")
const refundSubscriptionAdmin = require("../views/admin/refundSubscription")
const reactivateSubscriptionAdmin = require("../views/admin/reactivateSubscription")
const syncUserFromStripe = require("../views/admin/syncUserFromStripe")

routes.post("/cancel-subscription", asyncHandler(cancelSubscriptionAdmin))
routes.post("/refund-subscription", asyncHandler(refundSubscriptionAdmin))
routes.post("/reactivate-subscription", asyncHandler(reactivateSubscriptionAdmin))
routes.post("/sync-subscription", asyncHandler(syncUserFromStripe))

const loadAdminRoutes = (app) => app.use("/admin", routes)

module.exports = loadAdminRoutes
