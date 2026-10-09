require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Route modules
const profile = require("./profile.js");
const authentication = require("./authenticationB.js");
const anyonomousChat = require("./anyonomousChat.js");
const mongodb = require("./mongodbConnection.js");
const uploadRoute = require("./uploadRoute");
const Message = require("./messageBackend.js");
const comments = require("./commentBackend.js");
const notifications = require("./notificationBackend.js");
const events = require("./eventsBackend.js");
const postDelete = require("./postDeleteBackend.js");

// Models
const User = require("./models/user.js");
const post = require("./models/posts.js");
const like = require("./models/postlikes.js");
const follow = require("./models/follow.js");
const Story = require("./models/stories.js");

const port = process.env.PORT || 3000;

// ── View engine & static ────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── HTTP logging ─────────────────────────────────────────────────────────────
app.use(morgan("dev"));

// ── MongoDB connection ────────────────────────────────────────────────────────
mongodb();

// ── Trust Proxy (Required for Render, Heroku & HTTPS reverse proxies) ─────
app.set("trust proxy", 1);

// ── Rate limiting on auth routes ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Sessions stored in MongoDB (survives server restarts) ─────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/profile", profile);
app.use("/authentication", authLimiter, authentication);
app.use("/file", uploadRoute);
app.use("/anyonomousChat", anyonomousChat);
app.use("/message", Message);
app.use("/comment", comments);
app.use("/notifications", notifications);
app.use("/events", events);
app.use("/post", postDelete);

// ── Home feed ────────────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
  if (req.session.username && req.session.userId) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;

      const user = await User.findOne({ username: req.session.username });

      // Get people the user follows
      const yourfollowing = await follow.find({ userID: req.session.username });
      const followingIDs = yourfollowing.map((f) => f.followingID);

      // Build feed: posts from people you follow + your own
      const feedOwners = [...followingIDs, req.session.username];
      const totalPosts = await post.countDocuments({ postOwner: { $in: feedOwners } });
      const posts = await post
        .find({ postOwner: { $in: feedOwners } })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const yourfollowingProfile = await Promise.all(
        yourfollowing.map((item) => User.findOne({ username: item.followingID }))
      );

      const postOwnerUsername = await Promise.all(
        posts.map((item) => User.findOne({ username: item.postOwner }))
      );

      const TotalLikes = await Promise.all(
        posts.map((item) => like.countDocuments({ postID: item.id }))
      );

      const totalpostlikes = await Promise.all(
        posts.map(async (item) => {
          const liked = await like.findOne({ postID: item.id, userID: req.session.username });
          return liked ? 1 : 0;
        })
      );

      // Stories from people you follow
      const stories = (
        await Promise.all(yourfollowing.map((el) => Story.find({ OwnerID: el.followingID })))
      ).flat();

      // Unread notifications count
      const Notification = require("./models/notification.js");
      const unreadCount = await Notification.countDocuments({
        recipientID: req.session.username,
        read: false,
      });

      return res.render("index", {
        stories,
        yourfollowingProfile,
        TotalLikes,
        user,
        posts,
        currentuser: postOwnerUsername,
        like: totalpostlikes,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: skip + posts.length < totalPosts,
        unreadCount,
      });
    } catch (err) {
      console.error("Home feed error:", err);
      return res.status(500).send("Something went wrong.");
    }
  } else {
    return res.render("authenticationLogin");
  }
});

// ── Load more posts (AJAX infinite scroll) ────────────────────────────────────
app.get("/api/posts", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });

  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  const yourfollowing = await follow.find({ userID: req.session.username });
  const feedOwners = [...yourfollowing.map((f) => f.followingID), req.session.username];

  const posts = await post
    .find({ postOwner: { $in: feedOwners } })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

  const postOwnerUsername = await Promise.all(
    posts.map((item) => User.findOne({ username: item.postOwner }))
  );
  const TotalLikes = await Promise.all(
    posts.map((item) => like.countDocuments({ postID: item.id }))
  );
  const totalpostlikes = await Promise.all(
    posts.map(async (item) => {
      const liked = await like.findOne({ postID: item.id, userID: req.session.username });
      return liked ? 1 : 0;
    })
  );

  const totalPosts = await post.countDocuments({ postOwner: { $in: feedOwners } });
  const hasMore = skip + posts.length < totalPosts;

  return res.json({
    success: true,
    posts,
    postOwners: postOwnerUsername,
    TotalLikes,
    likedByUser: totalpostlikes,
    hasMore,
    sessionUsername: req.session.username,
  });
});

// ── Like toggle ───────────────────────────────────────────────────────────────
app.post("/like/", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  try {
    const existing = await like.findOne({ postID: req.body.id, userID: req.session.username });
    const targetPost = await post.findById(req.body.id);

    if (existing) {
      await like.findOneAndDelete({ postID: req.body.id, userID: req.session.username });
      return res.status(200).send({ success: false });
    } else {
      await new like({ postID: req.body.id, userID: req.session.username, postLikes: true }).save();

      // Create like notification for post owner (if not liking own post)
      if (targetPost && targetPost.postOwner !== req.session.username) {
        const Notification = require("./models/notification.js");
        await new Notification({
          recipientID: targetPost.postOwner,
          senderID: req.session.username,
          type: "like",
          postID: req.body.id,
          message: `${req.session.username} liked your post`,
        }).save();
      }
      return res.status(200).send({ success: true });
    }
  } catch (err) {
    return res.status(500).send({ success: false });
  }
});

// ── Stories (your own) ────────────────────────────────────────────────────────
app.post("/stories", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ success: false });
  const userstory = await Story.findOne({ OwnerID: req.session.username });
  return res.status(200).send(userstory);
});

// ── Logout ────────────────────────────────────────────────────────────────────
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.redirect("/authentication");
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Socket.io for real-time messaging ─────────────────────────────────────────
io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", (data) => {
    // Broadcast to everyone in the room except sender
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("anonymous_message", (data) => {
    io.emit("new_anonymous_message", data);
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
server.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
