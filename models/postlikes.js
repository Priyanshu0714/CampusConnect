const mongoose=require("mongoose")

const postlikeSchema=new mongoose.Schema({
    postID:String,
    userID:String,
    postLikes:{type:Boolean,default:false}
})
const PostLike=mongoose.model("postlike",postlikeSchema)

module.exports=PostLike;