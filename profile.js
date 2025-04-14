const express = require("express");
const router = express.Router();
const user = require("./models/user.js");
const follow = require("./models/follow.js");
const post = require("./models/posts.js");

router.get("/", async (req, res) => {
  if (req.session.username && req.session.password) {
    // to find the userdetails, followers& follwing and posts
    const [finduser, followingusers, followersuser, totalpost] =
      await Promise.all([
        user.findOne({
          username: req.session.username,
          password: req.session.password,
        }),
        follow.find({ userID: req.session.username }),
        follow.find({ followingID: req.session.username }),
        post.find({ postOwner: req.session.username }).sort({timestamp:-1}),
      ]);


    const following = followingusers.length;
    const followers = followersuser.length;
    const postNum = totalpost.length;
    let totalposturl=[]
    // for getting the array of posts
    totalpost.forEach(a=>{
      totalposturl.push(a);
    })
    // for the likes part
    let likesCount = 0;
    if (totalpost.length == 0) {
      likesCount = 0;
    } else {
      totalpost.map((e) => {
        likesCount = likesCount + e.likes;
      });
    }
    return res.render("profile", {
      profileImg:finduser.profileimg,
      totalposturl:totalposturl,
      name: finduser.name,
      username: finduser.username,
      bio: finduser.bio,
      followers: followers,
      following: following,
      post: postNum,
      likes: likesCount,
    });
  }
  return res.render("authenticationLogin");
});

router.post("/searchuser", async (req, res) => {
  try {
    const prefix = req.body.searchkeyword;
    const finduser = await user
      .find({
        username: { $regex: `^${prefix}`, $options: "i" },
      })
      .limit(10);
    if (finduser.length > 0) {
      return res.status(200).send({ data: finduser });
    }
  } catch (error) {
    return res.status(400);
  }
});

router.get("/userprofile/:id", async (req, res) => {
  const userid = req.params.id;
  const finduser=await user.findById(userid)
  const [followingusers, followersuser, totalpost] =
      await Promise.all([
        follow.find({ userID: finduser.username }),
        follow.find({ followingID: finduser.username }),
        post.find({ postOwner: finduser.username}),
      ]);

    const following = followingusers.length;
    const followers = followersuser.length;
    const postNum = totalpost.length;
    const statusCheck=await follow.findOne({
        userID:req.session.username,
        followingID:finduser.username
    })
    let status;
    // for the likes part
    let likesCount = 0;
    if (totalpost.length == 0) {
      likesCount = 0;
    } else {
      totalpost.map((e) => {
        likesCount = likesCount + e.likes;
      });
    }
    if(statusCheck){
        status=true;
    }
    else{
        status=false;
    }
    console.log(finduser)
  return res.render("searchuserprofile", {
    finduser:finduser,
    totalpost,
    followstatus: status,
    userid: userid,
    post:postNum,
    followers:followers,
    followings:following,
    likes:likesCount
  });
});


router.post("/followuser", async (req, res) => {
  const followerid = req.body.userid;
  const username = await user.findById(followerid);
  const following = new follow({
    userID: req.session.username,
    followingID: username.username,
  });
  following.save();
  return res.status(200).send({ success: true });
});

router.post("/editprofile",async(req,res)=>{
  const data=req.body
  if(req.session.username&&req.session.password){
    const editprofile=await user.updateOne({username:req.session.username},{$set:{name:data.newname,bio:data.newbio}})
    return res.status(200).send({success:true})
  }
  return res.status(400).send({success:false})
})
module.exports = router;
