const mongoose = require("../../utils/database")

const VideoSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    coverUrl: { type: String, required: true },
    fileUrl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sharesExtras: { type: Number, default: 0 }
  },
  { timestamps: true }
)

VideoSchema.pre("save", async function (next) {
  // console.log(this.content, this.coverUrl)
  next()
})

VideoSchema.statics.findOneOrCreate = function findOneOrCreate(conditionalDoc) {
  const self = this
  const newDocument = conditionalDoc
  return new Promise((resolve, reject) =>
    self
      .findOne(conditionalDoc)
      .then((result) => {
        if (result) return resolve(result)
        return self
          .create(newDocument)
          .then((result) => resolve(result))
          .catch((error) => reject(error))
      })
      .catch((error) => reject(error))
  )
}

module.exports = mongoose.model("Video", VideoSchema)
