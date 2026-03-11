const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskAssessment",
      required: true,
    },
    submissions: [
      {
        taskIndex: { type: Number, required: true },
        taskTitle: { type: String },
        submissionFiles: [{ type: String }], // Cloudinary URLs
        githubLink: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    submissionTime: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

taskSubmissionSchema.index({ candidateId: 1, jobId: 1, assessmentId: 1 }, { unique: true });

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);
