const mongoose = require("mongoose");

const storyschema = new mongoose.Schema({
  OwnerID: { type: String, index: true },
  StoryLink: String,
  Ownerimg: String,
  timestamp: { type: Number, default: Date.now },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

const Story = mongoose.model("story", storyschema);
module.exports = Story;