const mongoose=require("mongoose")

const storyschema=new mongoose.Schema({
    OwnerID:String,
    StoryLink:String,
    Ownerimg:String,
    timestamp:{type:Number,default:Date.now}
})
const Story=mongoose.model("story",storyschema)

module.exports=Story;