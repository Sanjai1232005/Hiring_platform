const mongoose = require("mongoose");

const hrProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  companyName: String,
  position: String,
  department: String,
  contact: String,
  location: String,
  bio: String,
  linkedin: String,
  avatar: String,
  skills: [String],
}, { timestamps: true });

module.exports = mongoose.model("HrProfile", hrProfileSchema);
