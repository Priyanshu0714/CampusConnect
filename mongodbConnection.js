require("dotenv").config();
const mongoose = require("mongoose");

async function connection() {
  const uri = process.env.MONGO_URI;
  mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 20000,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

module.exports = connection;