const express = require("express");
const router = express.Router();
const user = require("./models/user.js");
const follow = require("./models/follow.js");
const post = require("./models/posts.js");
const like = require("./models/postlikes.js");
const Notification = require("./models/notification.js");

// ── Own profile ───────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  if (req.session.username && req.session.userId) {
    try {
      const [finduser, followingusers, followersuser, totalpost] = await Promise.all([
        user.findOne({ username: req.session.username }),
        follow.find({ userID: req.session.username }),
        follow.find({ followingID: req.session.username }),
        post.find({ postOwner: req.session.username }).sort({ timestamp: -1 }),
      ]);

      const following = followingusers.length;
      const followers = followersuser.length;
      const postNum = totalpost.length;

      // Count likes using the postlikes collection (correct source of truth)
      const likesCounts = await Promise.all(
        totalpost.map((p) => like.countDocuments({ postID: p.id }))
      );
      const likesCount = likesCounts.reduce((a, b) => a + b, 0);

      const postsWithDetails = totalpost.map((p, idx) => ({
        ...p.toObject(),
        likeCount: likesCounts[idx],
      }));

      return res.render("profile", {
        finduser,
        profileImg: finduser.profileimg,
        coverImg: finduser.coverimg || "/images/tempcover.png",
        totalposturl: postsWithDetails,
        name: finduser.name,
        username: finduser.username,
        bio: finduser.bio,
        college: finduser.college || "",
        branch: finduser.branch || "",
        year: finduser.year || "",
        linkedin: finduser.linkedin || "",
        github: finduser.github || "",
        followers,
        following,
        post: postNum,
        likes: likesCount,
      });
    } catch (err) {
      console.error("Profile error:", err);
      return res.redirect("/authentication");
    }
  }
  return res.render("authenticationLogin");
});

// Search users
router.post("/searchuser", async (req, res) => {
  try {
    const prefix = req.body.searchkeyword;
    if (!prefix || prefix.trim() === "") return res.status(200).json({ data: [] });
    const finduser = await user
      .find({
        $or: [
          { username: { $regex: `^${prefix}`, $options: "i" } },
          { name: { $regex: prefix, $options: "i" } },
        ],
      })
      .limit(10)
      .select("username name profileimg _id");
    return res.status(200).send({ data: finduser });
  } catch (error) {
    return res.status(400).json({ data: [] });
  }
});

// View another user's profile
router.get("/userprofile/:id", async (req, res) => {
  const userid = req.params.id;
  try {
    const finduser = await user.findById(userid);
    if (!finduser) return res.status(404).send("User not found.");

    if (finduser.username === req.session.username) {
      return res.redirect("/profile");
    }

    const [followingusers, followersuser, totalpost] = await Promise.all([
      follow.find({ userID: finduser.username }),
      follow.find({ followingID: finduser.username }),
      post.find({ postOwner: finduser.username }),
    ]);

    const likesCounts = await Promise.all(
      totalpost.map((p) => like.countDocuments({ postID: p.id }))
    );
    const likesCount = likesCounts.reduce((a, b) => a + b, 0);

    const postsWithDetails = totalpost.map((p, idx) => ({
      ...p.toObject(),
      likeCount: likesCounts[idx],
    }));

    const statusCheck = await follow.findOne({
      userID: req.session.username,
      followingID: finduser.username,
    });

    return res.render("searchuserprofile", {
      finduser,
      totalpost: postsWithDetails,
      followstatus: !!statusCheck,
      userid,
      post: totalpost.length,
      followers: followersuser.length,
      followings: followingusers.length,
      likes: likesCount,
    });
  } catch (err) {
    console.error("User profile error:", err);
    return res.status(500).send("Error loading profile.");
  }
});

// Follow / Unfollow 
router.post("/followuser", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const followerid = req.body.userid;
    const targetUser = await user.findById(followerid);
    if (!targetUser) return res.status(404).json({ success: false });

    const existing = await follow.findOne({
      userID: req.session.username,
      followingID: targetUser.username,
    });

    if (existing) {
      await follow.findOneAndDelete({
        userID: req.session.username,
        followingID: targetUser.username,
      });
      return res.status(200).send({ success: true, following: false });
    }

    await new follow({
      userID: req.session.username,
      followingID: targetUser.username,
    }).save();

    // Notify the followed user
    await new Notification({
      recipientID: targetUser.username,
      senderID: req.session.username,
      type: "follow",
      message: `${req.session.username} started following you`,
    }).save();

    return res.status(200).send({ success: true, following: true });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ success: false });
  }
});

// Edit profile 
router.post("/editprofile", async (req, res) => {
  if (!req.session.username || !req.session.userId) {
    return res.status(401).json({ success: false });
  }
  try {
    const { newname, newbio, college, branch, year, linkedin, github } = req.body;
    await user.updateOne(
      { username: req.session.username },
      {
        $set: {
          name: newname,
          bio: newbio,
          college: college || "",
          branch: branch || "",
          year: year || "",
          linkedin: linkedin || "",
          github: github || "",
        },
      }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// Explore: suggested users
router.get("/explore", async (req, res) => {
  if (!req.session.username) return res.redirect("/authentication");
  try {
    const following = await follow.find({ userID: req.session.username });
    const followingIDs = following.map((f) => f.followingID);
    followingIDs.push(req.session.username);

    const suggested = await user.find({ username: { $nin: followingIDs } })
      .select("username name profileimg bio college branch")
      .limit(20);

    // Trending posts (most liked in last 48h)
    const post = require("./models/posts.js");
    const recent = await post.find({
      timestamp: { $gte: Date.now() - 48 * 60 * 60 * 1000 },
    }).limit(30);

    const withLikes = await Promise.all(
      recent.map(async (p) => ({
        post: p,
        likeCount: await like.countDocuments({ postID: p.id }),
        owner: await user.findOne({ username: p.postOwner }).select("username name profileimg"),
      }))
    );
    const trending = withLikes.sort((a, b) => b.likeCount - a.likeCount).slice(0, 9);

    return res.render("explore", { suggested, trending, username: req.session.username });
  } catch (err) {
    console.error("Explore error:", err);
    return res.status(500).send("Error loading explore.");
  }
});

module.exports = router;
