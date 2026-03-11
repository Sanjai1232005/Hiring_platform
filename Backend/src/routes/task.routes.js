const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  createTaskAssessment,
  getTaskAssessmentsByJob,
  deleteTaskAssessment,
  submitTaskAssessment,
  getMySubmission,
  getSubmissionsByJob,
  uploadRecording,
  uploadExplanation,
  analyzeExplanation,
  getExplanationAnalysis,
  getTaskResults,
} = require("../controllers/task.controller");

// Create a task assessment (HR only)
router.post("/create", authenticate, role("hr"), createTaskAssessment);

// Get task assessments by job
router.get("/job/:jobId", authenticate, getTaskAssessmentsByJob);

// Delete a task assessment
router.delete("/:id", authenticate, role("hr"), deleteTaskAssessment);

// Submit task assessment (Student)
router.post("/submit", authenticate, role("student"), submitTaskAssessment);

// Get my submission for an assessment
router.get("/submission/:assessmentId", authenticate, getMySubmission);

// Get all submissions for a job (HR)
router.get("/submissions/job/:jobId", authenticate, role("hr"), getSubmissionsByJob);

// Upload proctoring recording (Student)
router.post("/uploadRecording", authenticate, role("student"), uploadRecording);

// Upload explanation recording (Student)
router.post("/uploadExplanation", authenticate, role("student"), uploadExplanation);

// Analyze explanation video via ML service (HR)
router.post("/analyzeExplanation", authenticate, role("hr"), analyzeExplanation);

// Get explanation analysis for a candidate (HR)
router.get("/explanationAnalysis/:candidateId/:jobId", authenticate, role("hr"), getExplanationAnalysis);

// Get full task assessment results for a job (HR dashboard)
router.get("/results/:jobId", authenticate, role("hr"), getTaskResults);

module.exports = router;
