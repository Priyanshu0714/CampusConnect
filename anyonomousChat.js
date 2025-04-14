const express = require("express");
const router = express.Router();
const chat=require("./models/chat.js")

router.get("/", async (req, res) => {
    if(req.session.username && req.session.password){
        const chatarray=await chat.find().sort({timestamp:-1})
        return res.render("anyonomousConfession",{
            chatarray,
    });
    }
    else{
        return res.render("authenticationLogin")
    }
})

router.post("/",async(req,res)=>{
    // console.log(req.params)
    try {
        const chatting = new chat({
            message:req.body.message
        })
        await chatting.save();
        return res.status(200).json({"success":true})
    } catch (error) {
        return res.status(400).json({"success":false})
    }
})

module.exports=router;