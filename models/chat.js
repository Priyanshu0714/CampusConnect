const mongoose=require("mongoose")

const ChatSchema=new mongoose.Schema({
    message:String,
    timestamp:{type:String,default:Date.now}
})
const Chat=mongoose.model("ChatSchema",ChatSchema)

module.exports=Chat;