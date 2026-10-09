const mongoose=require("mongoose")

const postschema=new mongoose.Schema({
    postOwner:{type:String,default:null},
    postURL:{type:String,default:null},
    caption:{type:String,default:"Here comes the caption Part."},
    likes:{type:Number,default:0},
    Comment:{type:Number,default:0},
    timestamp:{type:Number,default:Date.now}
})
const post=mongoose.model("post",postschema)
module.exports=post;