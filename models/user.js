const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  bio:{type:String,default:"Write about you 🙂"},
  profileimg:{type:String,default:null},
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
