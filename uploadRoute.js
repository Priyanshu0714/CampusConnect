require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const User = require("./models/user");
const post = require("./models/posts.js");
const Story = require("./models/stories.js");

// ── Cloudinary config from env ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// ── Multer: temp storage, max 10MB ────────────────────────────────────────────
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG and WebP images are allowed."));
    }
    cb(null, true);
  },
});

// ── Helper: upload to Cloudinary and clean up local temp file ────────────────
async function uploadToCloudinary(filePath, folder = "campusconnect") {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  fs.unlinkSync(filePath);
  return result.secure_url;
}

// ── Upload a post ─────────────────────────────────────────────────────────────
router.post("/upload/post", upload.single("file"), async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const imageURL = await uploadToCloudinary(req.file.path, "campusconnect/posts");
    const newpost = new post({
      postOwner: req.session.username,
      postURL: imageURL,
      caption: req.body.postcaption || "",
    });
    await newpost.save();
    return res.redirect("/");
  } catch (err) {
    console.error("Post upload error:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Upload failed" });
  }
});

// ── Upload profile picture ────────────────────────────────────────────────────
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const imageURL = await uploadToCloudinary(req.file.path, "campusconnect/profiles");
    await User.findOneAndUpdate(
      { username: req.session.username },
      { profileimg: imageURL }
    );
    return res.redirect("/profile");
  } catch (error) {
    console.error("Profile image upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Upload failed" });
  }
});

// ── Upload cover image ────────────────────────────────────────────────────────
router.post("/upload/cover", upload.single("file"), async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const imageURL = await uploadToCloudinary(req.file.path, "campusconnect/covers");
    await User.findOneAndUpdate(
      { username: req.session.username },
      { coverimg: imageURL }
    );
    return res.redirect("/profile");
  } catch (error) {
    console.error("Cover image upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Upload failed" });
  }
});

// ── Upload a story ────────────────────────────────────────────────────────────
router.post("/upload/stories", upload.single("file"), async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const imageURL = await uploadToCloudinary(req.file.path, "campusconnect/stories");
    const userDoc = await User.findOne({ username: req.session.username });

    // Replace existing story (one story per user at a time)
    await Story.findOneAndDelete({ OwnerID: req.session.username });
    await new Story({
      OwnerID: req.session.username,
      StoryLink: imageURL,
      Ownerimg: userDoc.profileimg,
      createdAt: new Date(),
    }).save();

    return res.redirect("/");
  } catch (error) {
    console.error("Story upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Upload failed" });
  }
});

// ── Multer error handler ──────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
  }
  return res.status(400).json({ message: err.message });
});

module.exports = router;
