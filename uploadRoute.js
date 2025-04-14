// uploadRoute.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const User = require("./models/user");
const post = require("./models/posts.js");

const upload = multer({ dest: "uploads/" });
const cloudinary = require("cloudinary").v2;

router.post("/upload/post", upload.single("file"), async (req, res) => {
  let CurrentTime=Date.now();
  if (!req.session.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const file = req.file;
    const path = file.path;
    console.log(req.params)
    console.log(req.body.postcaption)
    console.log(req.file)
    // Configuration
    cloudinary.config({
      cloud_name: "dbjfhrfly",
      api_key: "595925724355149",
      api_secret: "qwfGU3SeKp3HLoi-uwiTyszNx1Y",
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(`${path}`, {
        public_id: CurrentTime,
      })
      .catch((error) => {
        console.log(error);
      });

    // Clean up local upload
    await fs.unlinkSync(file.path);

    // Save single URL as a string in profileimg
    newpost = new post({
      postOwner: req.session.username,
      postURL: uploadResult.secure_url,
      caption: req.body.postcaption,
    });
    await newpost.save();
    return res.redirect("http://localhost:3000/");
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

// for the image and cover picture upload
router.post("/upload", upload.single("file"), async (req, res) => {
  let CurrentTime=Date.now();
  if (!req.session.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // for the cloudinary image upload
  try {
    const file = req.file;
    // console.log(file);
    const path = file.path;
    // console.log(path);
    // Configuration
    cloudinary.config({
      cloud_name: "dbjfhrfly",
      api_key: "595925724355149",
      api_secret: "qwfGU3SeKp3HLoi-uwiTyszNx1Y",
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(`${path}`, {
        public_id: CurrentTime,
      })
      .catch((error) => {
        console.log(error);
      });

    // console.log(uploadResult);
    await User.findOneAndUpdate(
      { username: req.session.username },
      { profileimg: uploadResult.secure_url }
    );
    await fs.unlinkSync(file.path);
    res.render("http://localhost:3000/");

  } catch (error) {
    return res.status(400);
  }
});

module.exports = router;
