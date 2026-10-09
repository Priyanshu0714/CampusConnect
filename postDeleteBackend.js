const express = require("express");
const router = express.Router();
const post = require("./models/posts.js");
const like = require("./models/postlikes.js");
const Comment = require("./models/comments.js");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Delete a post (owner only) ────────────────────────────────────────────────
router.delete("/delete/:id", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const targetPost = await post.findById(req.params.id);
    if (!targetPost) return res.status(404).json({ success: false, message: "Post not found." });
    if (targetPost.postOwner !== req.session.username) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // Delete image from Cloudinary (extract public_id from URL)
    if (targetPost.postURL) {
      try {
        const parts = targetPost.postURL.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        const folder = parts.slice(-3, -1).join("/");
        await cloudinary.uploader.destroy(`${folder}/${filename}`);
      } catch (e) {
        console.warn("Cloudinary delete warning:", e.message);
      }
    }

    // Cascade delete likes and comments
    await Promise.all([
      like.deleteMany({ postID: req.params.id }),
      Comment.deleteMany({ postID: req.params.id }),
      post.findByIdAndDelete(req.params.id),
    ]);

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ success: false });
  }
});

// ── Save / Unsave a post ──────────────────────────────────────────────────────
router.post("/save/:id", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const User = require("./models/user.js");
    const user = await User.findOne({ username: req.session.username });
    const savedIdx = user.savedPosts.indexOf(req.params.id);
    if (savedIdx > -1) {
      user.savedPosts.splice(savedIdx, 1);
      await user.save();
      return res.json({ success: true, saved: false });
    } else {
      user.savedPosts.push(req.params.id);
      await user.save();
      return res.json({ success: true, saved: true });
    }
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ── View single post ──────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  if (!req.session.username) return res.redirect("/authentication");
  try {
    const User = require("./models/user.js");
    const targetPost = await post.findById(req.params.id);
    if (!targetPost) {
      return res.status(404).redirect("/");
    }

    const [currentUser, postOwner, totalLikes, userLiked, comments] = await Promise.all([
      User.findOne({ username: req.session.username }),
      User.findOne({ username: targetPost.postOwner }),
      like.countDocuments({ postID: targetPost.id }),
      like.findOne({ postID: targetPost.id, userID: req.session.username }),
      Comment.find({ postID: targetPost.id }).sort({ timestamp: 1 }),
    ]);

    const isSaved = currentUser && currentUser.savedPosts && currentUser.savedPosts.includes(targetPost.id);

    return res.render("postView", {
      user: currentUser,
      post: targetPost,
      postOwner: postOwner || { username: targetPost.postOwner, name: targetPost.postOwner, profileimg: "/images/profileicon.svg" },
      totalLikes,
      isLiked: !!userLiked,
      isSaved: !!isSaved,
      comments,
    });
  } catch (err) {
    console.error("View post error:", err);
    return res.redirect("/");
  }
});

module.exports = router;
