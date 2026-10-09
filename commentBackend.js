const express = require("express");
const router = express.Router();
const Comment = require("./models/comments.js");
const post = require("./models/posts.js");
const Notification = require("./models/notification.js");

// ── Post a comment ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false, message: "Unauthorized" });
  const { postid, message } = req.body;
  if (!postid || !message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Comment message and postid are required." });
  }
  try {
    const comment = await new Comment({
      postID: postid,
      userName: req.session.username,
      comment: message.trim(),
      timestamp: new Date(),
    }).save();

    // Update comment count on post
    await post.findByIdAndUpdate(postid, { $inc: { Comment: 1 } });

    // Notify post owner
    const targetPost = await post.findById(postid);
    if (targetPost && targetPost.postOwner !== req.session.username) {
      await new Notification({
        recipientID: targetPost.postOwner,
        senderID: req.session.username,
        type: "comment",
        postID: postid,
        message: `${req.session.username} commented on your post`,
      }).save();
    }

    return res.status(200).json({ success: true, comment });
  } catch (err) {
    console.error("Comment submit error:", err);
    return res.status(500).json({ success: false, message: "Failed to post comment." });
  }
});

// ── Get comments for a post ───────────────────────────────────────────────────
router.post("/getdata", async (req, res) => {
  try {
    const postComments = await Comment.find({ postID: req.body.postid }).sort({ timestamp: 1 });
    return res.status(200).json({ postComments, totalComment: postComments.length, success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ── Delete own comment ────────────────────────────────────────────────────────
router.delete("/delete/:id", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false });
    if (comment.userName !== req.session.username) {
      return res.status(403).json({ success: false });
    }
    await comment.deleteOne();
    await post.findByIdAndUpdate(comment.postID, { $inc: { Comment: -1 } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;