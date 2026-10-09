require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const user = require("./models/user.js");

const SALT_ROUNDS = 12;

router.get("/", (req, res) => {
  res.render("authenticationLogin");
});

router.get("/signup", (req, res) => {
  res.render("authenticationSignup");
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ success: false, message: "Missing credentials." });
  }
  username = username.toLowerCase().trim();

  try {
    const foundUser = await user.findOne({ username });
    if (!foundUser) {
      return res.status(400).send({ success: false, message: "Invalid username or password." });
    }

    // Support legacy plaintext passwords during migration: compare, then re-hash
    let passwordValid = false;
    if (foundUser.password.startsWith("$2b$") || foundUser.password.startsWith("$2a$")) {
      // Already hashed
      passwordValid = await bcrypt.compare(password, foundUser.password);
    } else {
      // Legacy plaintext — compare then upgrade
      passwordValid = foundUser.password === password;
      if (passwordValid) {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        await user.updateOne({ username }, { $set: { password: hashed } });
      }
    }

    if (!passwordValid) {
      return res.status(400).send({ success: false, message: "Invalid username or password." });
    }

    req.session.username = username;
    req.session.userId = foundUser._id.toString();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send({ success: false, message: "Server error." });
  }
});

// ── Signup ────────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  let { username, name, email, password, college, branch, year } = req.body;
  if (!username || !name || !email || !password) {
    return res.status(400).send({ success: false, message: "All required fields must be filled." });
  }
  if (password.length < 6) {
    return res.status(400).send({ success: false, message: "Password must be at least 6 characters." });
  }
  username = username.toLowerCase().trim();

  try {
    const existingEmail = await user.findOne({ email });
    if (existingEmail) {
      return res.status(400).send({ success: false, message: "Email already registered." });
    }
    const existingUsername = await user.findOne({ username });
    if (existingUsername) {
      return res.status(400).send({ success: false, message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new user({
      username,
      name,
      email,
      password: hashedPassword,
      college: college || "",
      branch: branch || "",
      year: year || "",
    });
    await newUser.save();
    req.session.username = username;
    req.session.userId = newUser._id.toString();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).send({ success: false, message: "Server error." });
  }
});

module.exports = router;