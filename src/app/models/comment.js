const mongoose = require("../../utils/database")

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //ID do Usúario que publicou este comentário
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null }, //ID do video em que este comentário foi publicado
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, //ID do comentário respondido
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] //IDs das respostas deste comentário
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)
