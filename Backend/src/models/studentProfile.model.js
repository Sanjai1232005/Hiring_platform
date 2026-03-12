const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  phone: String,
  profilePhoto: String,
  about: String,

  college: String,
  degree: String,
  branch: String,
  graduationYear: Number,
  location: String,
  skills: [String],
  projects: [{ title: String, description: String, githubLink: String }],
  experience: [{ company: String, role: String, duration: String }],
  certifications: [{ title: String, issuer: String, year: String }],
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
  },
  resume: String,
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
