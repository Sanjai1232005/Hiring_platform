const InterviewRound = require('../models/interviewRound.model');
const ApplicationProgress = require('../models/applicationProgress.model');
const { advanceCandidateStage } = require('../services/stageTransition.service');

const VALID_ROUNDS = ['technical', 'system_design', 'behavioral', 'final'];

/**
 * POST /interview/schedule
 * Body: { candidateId, jobId, roundType, interviewer: { name, email }, date, meetingLink }
 */
const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, jobId, roundType, interviewer, date, meetingLink } = req.body;

    if (!candidateId || !jobId || !roundType || !interviewer?.name || !date || !meetingLink) {
      return res.status(400).json({ message: 'candidateId, jobId, roundType, interviewer.name, date, and meetingLink are required' });
    }

    if (!VALID_ROUNDS.includes(roundType)) {
      return res.status(400).json({ message: `roundType must be one of: ${VALID_ROUNDS.join(', ')}` });
    }

    const round = await InterviewRound.create({
      candidateId,
      jobId,
      roundType,
      interviewer,
      date,
      meetingLink,
    });

    res.status(201).json({ success: true, data: round });
  } catch (err) {
    console.error('Error scheduling interview:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /interview/submit-feedback
 * Body: { roundId, feedback, result: 'pass'|'fail' }
 */
const submitFeedback = async (req, res) => {
  try {
    const { roundId, feedback, result } = req.body;

    if (!roundId || !result) {
      return res.status(400).json({ message: 'roundId and result are required' });
    }

    if (!['pass', 'fail'].includes(result)) {
      return res.status(400).json({ message: 'result must be pass or fail' });
    }

    const round = await InterviewRound.findById(roundId);
    if (!round) {
      return res.status(404).json({ message: 'Interview round not found' });
    }

    round.feedback = feedback || '';
    round.result = result;
    await round.save();

    // If pass → advance candidate stage
    if (result === 'pass') {
      const app = await ApplicationProgress.findOne({
        userId: round.candidateId,
        jobId: round.jobId,
      });

      if (app) {
        await advanceCandidateStage(app._id);
      }
    }

    // Reload to return updated stage info
    const updatedApp = await ApplicationProgress.findOne({
      userId: round.candidateId,
      jobId: round.jobId,
    });

    res.json({
      success: true,
      data: {
        round,
        currentStage: updatedApp?.currentStage,
      },
    });
  } catch (err) {
    console.error('Error submitting interview feedback:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * GET /interview/my-interviews
 * Returns all interview rounds for the logged-in student
 */
const getMyInterviews = async (req, res) => {
  try {
    const userId = req.user.userId;

    const rounds = await InterviewRound.find({ candidateId: userId })
      .sort({ date: 1 })
      .populate('jobId', 'title company');

    res.json({ success: true, data: rounds });
  } catch (err) {
    console.error('Error fetching my interviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /interview/candidate/:candidateId
 * Optional query: ?jobId=xxx
 */
const getInterviewsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { jobId } = req.query;

    const filter = { candidateId };
    if (jobId) filter.jobId = jobId;

    const rounds = await InterviewRound.find(filter)
      .sort({ date: 1 })
      .populate('jobId', 'title company');

    res.json({ success: true, data: rounds });
  } catch (err) {
    console.error('Error fetching interviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /interview/job/:jobId
 * All interview rounds for a given job
 */
const getInterviewsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const rounds = await InterviewRound.find({ jobId })
      .sort({ date: 1 })
      .populate('candidateId', 'name email');

    res.json({ success: true, data: rounds });
  } catch (err) {
    console.error('Error fetching job interviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  scheduleInterview,
  submitFeedback,
  getInterviewsByCandidate,
  getInterviewsByJob,
  getMyInterviews,
};
