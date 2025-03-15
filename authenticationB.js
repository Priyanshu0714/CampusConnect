// svdp paoh ijej hhyi
const express=require("express");
const { default: mongoose } = require("mongoose");
const router=express.Router();
const user=require("./models/user.js")


router.get("/",(req,res)=>{
    res.render("authenticationLogin")
})
router.get("/signup",(req,res)=>{
    res.render("authenticationSignUp")
})

router.post("/",async(req,res)=>{
    // return res.status(200).send({success:true})
    let {username,password}=req.body;
    username=username.toLowerCase();
    try {
        const searchUser=await user.findOne({
            username:username,
            password:password,
        })
        if(!searchUser){
            return res.status(400).send({success:false})
        }else{
            req.session.username=username;
            req.session.password=password;
            return res.status(200).send({success:true})
        }
    } catch (error) {
        return res.status(400).send({success:false})
    }
})

router.post("/signup",async(req,res)=>{
    let {username,name,email,password}=req.body
    username=username.toLowerCase();
    console.log(username,name,email,password);
    // first check the account is created or not
    try {
        const status=await user.findOne({
            email:email
        })
        if(status){
            return res.status(400).send({success:false})
        }else{
            const newuser=new user({
                username:username,
                name:name,
                email:email,
                password:password,
            })
            newuser.save()
            return res.status(200).send({success:true})
        }
    } catch (error) {
        return res.status(400).send({success:false})
    }
})
module.exports=router