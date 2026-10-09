const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, index: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  bio: { type: String, default: "Write about you 🙂" },
  profileimg: {
    type: String,
    default: "https://drive.google.com/thumbnail?id=1SLzZbG7NxGTWc7hG30Me5dFlHD_QYBAL",
  },
  coverimg: { type: String, default: null },
  // 🆕 Campus-specific fields
  college: { type: String, default: "" },
  branch: { type: String, default: "" },
  year: { type: String, default: "" },
  // 🆕 Social links
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  // 🆕 Saved posts
  savedPosts: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
  uploads: { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
