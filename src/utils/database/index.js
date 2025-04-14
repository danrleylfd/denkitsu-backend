const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_HOST)

mongoose.Promise = global.Promise

module.exports = mongoose
