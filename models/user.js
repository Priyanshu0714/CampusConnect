const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  bio:{type:String,default:"Write about you 🙂"},
  profileimg:{type:String,default:"https://drive.google.com/thumbnail?id=1SLzZbG7NxGTWc7hG30Me5dFlHD_QYBAL"},
  coverimg:{type:String,default:null},
  date: { type: Date, default: Date.now },

  uploads: {
    type: [String],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
