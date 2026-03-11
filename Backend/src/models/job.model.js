// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true, 
    },
    company: {
      type: String,
    },
    location: {
      type: String,
      default: "Remote", 
    },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid-Level", "Senior", "Lead"],
      default: "Fresher",
    },
    description: {
      type: String, 
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
      },
    ],
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" }, 
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
    deadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    testSection :{
      type: Boolean,
      default: false,
    },
     CurrentStep: {
    type: Number,
    default: 0, 
    },
    title: String,
    testSection:{
      type:Boolean,
      default:false,
    },
    stage: { type: String, enum: ["resume", "profile", "coding", "evaluation", "interview"], default: "resume" },
    assessmentStrategy: {
      type: String,
      enum: ["coding_only", "task_only", "coding_then_task", "task_then_coding", "none"],
      default: "coding_only",
    },
  },
  { timestamps: true }
);




module.exports = mongoose.model("Job", jobSchema);
