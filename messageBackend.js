const express=require("express");
const { default: mongoose } = require("mongoose");
const router=express.Router();
const Follow=require("./models/follow")
const User=require("./models/user")
const Message=require("./models/message")

router.get("/",async(req,res)=>{
    if(req.session.username && req.session.password){
        // fetch his follower list
        const UserFollowers= await Follow.find({
            followingID:req.session.username
        })
        // to fetch the details of my followers
        const userDetails = await Promise.all(
            UserFollowers.map(user =>
                User.findOne({ username: user.userID })
            )
        );
        

        return res.render("message",{
            userDetails,
        });

    }
    return res.render("authenticationLogin")
})

router.post("/m",async(req,res)=>{
    if(req.body){
        try {
            const username=await User.findById(req.body.receiverID)
            await new Message({
                senderID:req.session.username,
                receiverID:username.username,
                message:req.body.message
            }).save()
            return res.status(200).send({success:true})
        } catch (error) {
            console.log("error saving the message!!")
            return res.status(500).send({success:false})
        }
        
    }
    else{
        return res.status(400).send({success:false})
    }
})

// to fetch the messages from the database
router.post("/load",async(req,res)=>{
    // console.log(req.body.id)
    if(req.body){
        try {
            const username=await User.findById(req.body.id)
            const messagesList = await Message.find({
                $or: [
                  { senderID: username.username , receiverID:req.session.username },
                  { receiverID: username.username ,senderID:req.session.username},
                ]
              });
            return res.status(200).send({success:true,messagesList,sessionID:req.session.username})              
        } catch (error) {
            return res.status(500).send({success:false})
        }
    }else{
        return res.status(400).send({success:false})
    }
})

module.exports=router