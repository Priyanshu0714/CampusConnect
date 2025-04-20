const express = require("express");
const app = express();
// for the profile part
const profile=require("./profile.js")
const authentication=require("./authenticationB.js")
const anyonomousChat=require("./anyonomousChat.js")
const mongodb=require("./mongodbConnection.js")
const session=require("express-session")
const uploadRoute = require("./uploadRoute");
const Message=require("./messageBackend.js")
const comments=require("./commentBackend.js")
const User = require("./models/user.js");
const post = require("./models/posts.js");
const like= require("./models/postlikes.js");
const follow= require("./models/follow.js");
const Story=require("./models/stories.js")
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// for monogodb connection
mongodb();

// for the express session
app.use(
  session({
    secret: "d888c1dd6e2794aa5b3462cea9db1632c79eea4ea51d0025a94b85345161d0e8729e892a00ebd3d9c41c9cc7c6255b5a54217da303ffd92afd39eb33d241b7c4",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true if using HTTPS
  })
);



// FOR PROFILE ROUTING
app.use("/profile",profile)
// FOR AUTHENTICATION
app.use("/authentication",authentication)
// FOR UPLOADS ROUTE
app.use("/file", uploadRoute); 
// FOR ANYONOMUS CHATTING
app.use("/anyonomousChat",anyonomousChat);
// FOR MESSAGE 
app.use("/message",Message);
// FOR COMMENTS
app.use("/comment",comments)


app.get("/", async(req, res) => {
  if(req.session.username&&req.session.password){
    const user=await User.findOne({username:req.session.username})
    // console.log(user)
    const posts=await post.find().sort({timestamp:-1}).limit(4)

    // to get your followers list
    const yourfollowing=await follow.find({
      userID:req.session.username
    })
    const yourfollowingProfile=await Promise.all(
      yourfollowing.map(async(item)=>{
        return await User.findOne({username:item.followingID})
    }))
    // to create the users array
    const postOwnerUsername = await Promise.all(
      posts.map(async (item) => {
        return await User.findOne({ username: item.postOwner });
      })
    );
    const TotalLikes = await Promise.all(
      posts.map(async (item) => {
        return await like.find({postID:item.id}).countDocuments();
      })
    );
    const totalpostlikes = await Promise.all(
      posts.map(async (item) => {
        const liked = await like.find({ postID: item.id, userID: req.session.username });
        return liked.length > 0 ? 1 : 0;
      })
    );
    // to get stories according to your followings
    const stories = (await Promise.all(
      yourfollowing.map(el => Story.find({ OwnerID: el.followingID }))
    )).flat();
     
    res.render("index",{
      stories:stories,
      yourfollowingProfile,
      TotalLikes,
      user,
      posts:posts,
      currentuser:postOwnerUsername,
      like:totalpostlikes,
    })
  }
  else{
    res.render("authenticationLogin")
  }
});


app.post("/like/",async(req,res)=>{
  if(await like.findOne({postID:req.body.id,userID:req.session.username})){

      await like.findOneAndDelete(
        {postID:req.body.id,userID:req.session.username},
      )
      return res.status(200).send({success:false})
    }else{
    const Like=new like({
      postID:req.body.id,
      userID:req.session.username,
      postLikes:true
    })
    await Like.save()
    return res.status(200).send({success:true})
  }
})

app.post("/stories",async(req,res)=>{
  if(!req.session.username){
    return;
  }
  const userstory=await Story.findOne({
    OwnerID:req.session.username
  })
  console.log(userstory)
  return res.status(200).send(userstory)
})

app.listen(port, (req, res) => {
  console.log(`Server running at http://:${port}`);
});
