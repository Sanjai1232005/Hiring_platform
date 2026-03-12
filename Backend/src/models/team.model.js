const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String },
  skills: [String],
  role: { type: String, default: '' },        // assigned team role (e.g. "Frontend Lead")
  scores: {
    overall: { type: Number, default: 0 },
    coding: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    technicalDepth: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    resume: { type: Number, default: 0 },
  },
  strengths: [String],
  improvements: [String],
}, { _id: false });

const teamSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  members: {
    type: [memberSchema],
    validate: {
      validator: (v) => v.length >= 2 && v.length <= 8,
      message: 'A team must have between 2 and 8 members.',
    },
  },
  skillCoverage: { type: mongoose.Schema.Types.Mixed, default: {} },   // skill → count
  teamScore: { type: Number, default: 0 },                  // avg of members' overall scores
  skillDiversity: { type: Number, default: 0 },              // 0-100 — how well skills are spread
  performanceMetrics: {
    avgCoding: { type: Number, default: 0 },
    avgCommunication: { type: Number, default: 0 },
    avgTechnicalDepth: { type: Number, default: 0 },
    avgProblemSolving: { type: Number, default: 0 },
    avgResume: { type: Number, default: 0 },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

teamSchema.index({ jobId: 1 });
teamSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Team', teamSchema);
