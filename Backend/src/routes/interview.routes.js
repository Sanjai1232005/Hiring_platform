const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/auth.middleware');
const {
  scheduleInterview,
  submitFeedback,
  getInterviewsByCandidate,
  getInterviewsByJob,
  getMyInterviews,
} = require('../controllers/interview.controller');

router.get('/my-interviews', authenticate, getMyInterviews);
router.post('/schedule', authenticate, scheduleInterview);
router.post('/submit-feedback', authenticate, submitFeedback);
router.get('/candidate/:candidateId', authenticate, getInterviewsByCandidate);
router.get('/job/:jobId', authenticate, getInterviewsByJob);

module.exports = router;
