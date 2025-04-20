const mongoose=require("mongoose")

const CommentSchema=new mongoose.Schema({
    postID:String,
    userName:String,
    comment:String,
    timestamp:{type:String,default:Date.now}
})
const Comment=mongoose.model("CommentSchema",CommentSchema)

module.exports=Comment;