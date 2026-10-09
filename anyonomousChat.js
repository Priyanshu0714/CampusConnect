const express = require("express");
const router = express.Router();
const chat = require("./models/chat.js");

router.get("/", async (req, res) => {
  if (req.session.username && req.session.userId) {
    const chatarray = await chat.find().sort({ timestamp: -1 }).limit(100);
    return res.render("anyonomousConfession", { chatarray: chatarray.reverse() });
  }
  return res.render("authenticationLogin");
});

router.post("/", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  const { message } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false });
  }
  try {
    const chatting = new chat({ message: message.trim() });
    await chatting.save();
    return res.status(200).json({ success: true, id: chatting._id });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

// ── Upvote an anonymous message ───────────────────────────────────────────────
router.post("/upvote/:id", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const msg = await chat.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false });
    msg.upvotes = (msg.upvotes || 0) + 1;
    await msg.save();
    return res.json({ success: true, upvotes: msg.upvotes });
  } catch {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;