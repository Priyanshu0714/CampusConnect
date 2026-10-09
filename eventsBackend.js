const express = require("express");
const router = express.Router();
const Event = require("./models/event.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── View all events ───────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  if (!req.session.username) return res.redirect("/authentication");
  try {
    const now = new Date();
    const upcomingEvents = await Event.find({ eventDate: { $gte: now } }).sort({ eventDate: 1 });
    const pastEvents = await Event.find({ eventDate: { $lt: now } }).sort({ eventDate: -1 }).limit(10);
    return res.render("events", {
      upcomingEvents,
      pastEvents,
      username: req.session.username,
    });
  } catch (err) {
    return res.status(500).send("Error loading events.");
  }
});

// ── Create event ──────────────────────────────────────────────────────────────
router.post("/create", upload.single("poster"), async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    let posterURL = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "campusconnect/events" });
      fs.unlinkSync(req.file.path);
      posterURL = result.secure_url;
    }
    const { title, description, venue, eventDate } = req.body;
    await new Event({
      title,
      description,
      venue,
      eventDate: new Date(eventDate),
      posterURL,
      createdBy: req.session.username,
    }).save();
    return res.redirect("/events");
  } catch (err) {
    console.error("Event create error:", err);
    return res.status(500).json({ success: false });
  }
});

// ── Toggle interested ─────────────────────────────────────────────────────────
router.post("/interested/:id", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false });

    const idx = event.interested.indexOf(req.session.username);
    if (idx > -1) {
      event.interested.splice(idx, 1);
    } else {
      event.interested.push(req.session.username);
    }
    await event.save();
    return res.json({ success: true, count: event.interested.length, interested: idx === -1 });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
