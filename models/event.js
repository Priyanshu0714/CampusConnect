const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  venue: { type: String, default: "" },
  eventDate: { type: Date, required: true },
  posterURL: { type: String, default: null },
  createdBy: { type: String, required: true },
  interested: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
