const mongoose = require('mongoose');

const applicationProgressSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  name: String,
  email: String,
  resumeLink: String,

  resumeScore: Number,

  testLink: { type: String },
  testToken: { type: String },
  testCompleted: { type: Boolean, default: false },         

  score: { type: Number, default: 0 },   
  correct: { type: Number, default: 0 }, 
  total: { type: Number, default: 0 },  

  testScore: Number,             

  pipelineStages: [
    {
      name:  { type: String, required: true },
      label: { type: String, required: true },
    }
  ],

  currentStage: {
    type: String,
    enum: ['applied', 'resume_screening', 'resume', 'coding_test', 'coding', 'task_assessment', 'hr_review', 'interview', 'final', 'rejected'],
    default: 'applied'
  },

  isShortlisted: { type: Boolean, default: false },

  overallScore: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ApplicationProgress', applicationProgressSchema);
