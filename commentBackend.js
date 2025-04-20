const express = require("express");
const router = express.Router();
const Comment=require("./models/comments")

router.post("/",async(req,res)=>{
    console.log(req.body)
    if(req.body.length==0){
        return res.status(200).send({success:false})
    }
    await new Comment({
        postID:req.body.postid,
        userName:req.session.username,
        comment:req.body.message,
    }).save();

    return res.status(200).send({success:true})
})

router.post("/getdata",async(req,res)=>{
    const postComments=await Comment.find({
        postID:req.body.postid,
    })
    const totalComment=postComments.length
    return res.status(200).send({postComments,totalComment,success:true})
})
module.exports=router;