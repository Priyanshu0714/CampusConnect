const mongoose=require("mongoose")

const postschema=new mongoose.Schema({
    postOwner:{type:String,default:null},
    postURL:{type:String,default:null},
    likes:{type:Number,default:0},
    Comment:{type:Number,default:0},
})
const post=mongoose.model("post",postschema)
module.exports=post;