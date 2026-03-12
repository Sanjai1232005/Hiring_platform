const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  context: { type: String, default: '' },                    // Business context / background
  requirements: [{ type: String }],                           // Bullet-point requirements
  evaluationCriteria: [{ type: String }],                     // What the candidate is graded on
  techStack: [{ type: String }],                              // e.g. ["React", "Node.js", "PostgreSQL"]
  difficulty: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'staff'],
    default: 'mid',
  },
  resources: [{ label: String, url: String }],                // Reference links / docs
  expectedDeliverable: { type: String, required: true },
  timeLimit: { type: Number, required: true },                // in minutes
});

const taskAssessmentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    tasks: {
      type: [taskSchema],
      validate: {
        validator: (v) => v.length >= 1 && v.length <= 3,
        message: "A task assessment must have between 1 and 3 tasks.",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeLimit: {
      type: Number, // overall time limit in minutes (optional, defaults to sum of tasks)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskAssessment", taskAssessmentSchema);
