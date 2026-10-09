const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  message: String,
  upvotes: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("ChatSchema", ChatSchema);
module.exports = Chat;