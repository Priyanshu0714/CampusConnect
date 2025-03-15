const mongoose=require("mongoose")

const followschema=new mongoose.Schema({
    userID:String,
    followingID:String
})
const follow=mongoose.model("follow",followschema)

module.exports=follow;