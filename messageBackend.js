const express = require("express");
const router = express.Router();
const Follow = require("./models/follow");
const User = require("./models/user");
const Message = require("./models/message");

// ── Messages inbox ────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  if (!req.session.username || !req.session.userId) {
    return res.render("authenticationLogin");
  }
  try {
    // Show people who follow you (mutual follow preferred, but show all followers)
    const UserFollowers = await Follow.find({ followingID: req.session.username });
    const userDetails = await Promise.all(
      UserFollowers.map((f) => User.findOne({ username: f.userID }))
    );
    // Also add people you follow (so you can DM anyone mutual)
    const UserFollowing = await Follow.find({ userID: req.session.username });
    const followingDetails = await Promise.all(
      UserFollowing.map((f) => User.findOne({ username: f.followingID }))
    );

    // Merge and dedupe
    const allMap = new Map();
    [...userDetails, ...followingDetails].forEach((u) => {
      if (u) allMap.set(u.username, u);
    });
    const contacts = [...allMap.values()].filter((u) => u.username !== req.session.username);

    return res.render("message", { userDetails: contacts, sessionUsername: req.session.username });
  } catch (err) {
    console.error("Message inbox error:", err);
    return res.render("authenticationLogin");
  }
});

// ── Send a message ────────────────────────────────────────────────────────────
router.post("/m", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const receiver = await User.findById(req.body.receiverID);
    if (!receiver) return res.status(404).json({ success: false });
    await new Message({
      senderID: req.session.username,
      receiverID: receiver.username,
      message: req.body.message,
    }).save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Message send error:", error);
    return res.status(500).json({ success: false });
  }
});

// ── Load conversation ─────────────────────────────────────────────────────────
router.post("/load", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const receiver = await User.findById(req.body.id);
    if (!receiver) return res.status(404).json({ success: false });
    const messagesList = await Message.find({
      $or: [
        { senderID: receiver.username, receiverID: req.session.username },
        { receiverID: receiver.username, senderID: req.session.username },
      ],
    }).sort({ timestamp: 1 });
    return res.status(200).json({ success: true, messagesList, sessionID: req.session.username });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;