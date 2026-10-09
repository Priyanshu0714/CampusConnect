const express = require("express");
const router = express.Router();
const Notification = require("./models/notification.js");

// ── Get all notifications for current user ────────────────────────────────────
router.get("/", async (req, res) => {
  if (!req.session.username) return res.redirect("/authentication");
  try {
    const notifications = await Notification.find({
      recipientID: req.session.username,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark all as read
    await Notification.updateMany(
      { recipientID: req.session.username, read: false },
      { $set: { read: true } }
    );

    return res.render("notifications", { notifications });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ── Get unread count (for badge) ──────────────────────────────────────────────
router.get("/count", async (req, res) => {
  if (!req.session.username) return res.json({ count: 0 });
  const count = await Notification.countDocuments({
    recipientID: req.session.username,
    read: false,
  });
  return res.json({ count });
});

module.exports = router;
