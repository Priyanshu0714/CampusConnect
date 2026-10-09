const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientID: { type: String, required: true, index: true },
  senderID: { type: String, required: true },
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  postID: { type: String, default: null },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
