const mongoose = require("mongoose");

const explanationRecordingSchema = new mongoose.Schema(
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
    explanationVideoUrl: {
      type: String,
      default: null,
    },
    analysis: {
      communicationScore: { type: Number },
      clarity: { type: String },
      technicalDepth: { type: String },
      topicsCovered: [String],
      duration: { type: Number },
      overallAssessment: { type: String },
      analyzedAt: { type: Date },
    },
  },
  { timestamps: true }
);

explanationRecordingSchema.index({ candidateId: 1, jobId: 1 });

module.exports = mongoose.model("ExplanationRecording", explanationRecordingSchema);
