const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },

  roundType: {
    type: String,
    enum: ['technical', 'system_design', 'behavioral', 'final'],
    required: true,
  },

  interviewer: {
    name: { type: String, required: true },
    email: { type: String },
  },

  date: { type: Date, required: true },
  meetingLink: { type: String, required: true },

  feedback: { type: String, default: '' },
  result: {
    type: String,
    enum: ['pending', 'pass', 'fail'],
    default: 'pending',
  },
}, { timestamps: true });

interviewRoundSchema.index({ candidateId: 1, jobId: 1 });

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
