const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postID: { type: String, index: true },
  userName: String,
  comment: String,
  timestamp: { type: Date, default: Date.now },
});

const Comment = mongoose.model("CommentSchema", CommentSchema);
module.exports = Comment;