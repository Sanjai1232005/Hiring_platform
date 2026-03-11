const mongoose = require("mongoose");

const proctoringRecordingSchema = new mongoose.Schema(
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
    },
    recordingUrl: {
      type: String,
      default: null,
    },
    analysis: {
      attentionScore: { type: Number },
      faceDetectionRate: { type: Number },
      tabSwitchCount: { type: Number },
      suspiciousActivities: [String],
      environmentScore: { type: String },
      overallVerdict: { type: String },
      analyzedAt: { type: Date },
    },
  },
  { timestamps: true }
);

proctoringRecordingSchema.index({ candidateId: 1, jobId: 1 });

module.exports = mongoose.model("ProctoringRecording", proctoringRecordingSchema);
