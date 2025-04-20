const mongoose=require("mongoose")

const messageschema=new mongoose.Schema({
    senderID:String,
    receiverID:String,
    message:String,
    timestamp:{type:Number,default:Date.now}
})
const Message=mongoose.model("message",messageschema)

module.exports=Message;