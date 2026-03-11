const mongoose = require("mongoose");

const explanationAnalysisSchema = new mongoose.Schema(
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
    analysisResult: {
      communication_score: { type: Number },
      technical_depth: { type: Number },
      confidence_level: { type: Number },
      problem_solving: { type: Number },
      overall_score: { type: Number },
      strengths: [String],
      areas_for_improvement: [String],
      transcript_stats: {
        word_count: Number,
        language: String,
        speech_confidence: Number,
      },
      pipeline: {
        audio_extraction: {
          status: String,
          duration_seconds: Number,
          sample_rate: Number,
          channels: Number,
        },
        transcription: {
          status: String,
          word_count: Number,
          language: String,
          confidence: Number,
        },
      },
    },
  },
  { timestamps: true }
);

explanationAnalysisSchema.index({ candidateId: 1, jobId: 1 });

module.exports = mongoose.model("ExplanationAnalysis", explanationAnalysisSchema);
