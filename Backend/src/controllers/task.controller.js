const TaskAssessment = require("../models/taskAssessment.model");
const TaskSubmission = require("../models/taskSubmission.model");
const ProctoringRecording = require("../models/proctoringRecording.model");
const ExplanationRecording = require("../models/explanationRecording.model");
const ExplanationAnalysis = require("../models/explanationAnalysis.model");
const ApplicationProgress = require("../models/applicationProgress.model");
const { advanceCandidateStage } = require("../services/stageTransition.service");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Create a new task assessment for a job
 */
exports.createTaskAssessment = async (req, res, next) => {
  try {
    const { jobId, tasks, timeLimit } = req.body;

    if (!jobId || !tasks || !Array.isArray(tasks) || tasks.length < 1 || tasks.length > 3) {
      return res.status(400).json({
        success: false,
        message: "jobId and 1-3 tasks are required.",
      });
    }

    for (const task of tasks) {
      if (!task.title || !task.description || !task.expectedDeliverable || !task.timeLimit) {
        return res.status(400).json({
          success: false,
          message: "Each task must have title, description, expectedDeliverable, and timeLimit.",
        });
      }
    }

    const assessment = await TaskAssessment.create({
      jobId,
      tasks,
      timeLimit: timeLimit || tasks.reduce((sum, t) => sum + t.timeLimit, 0),
      createdBy: req.user.userId,
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task assessments by jobId
 */
exports.getTaskAssessmentsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const assessments = await TaskAssessment.find({ jobId }).sort({ createdAt: -1 });

    res.json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task assessment
 */
exports.deleteTaskAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assessment = await TaskAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Task assessment not found." });
    }

    if (assessment.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await TaskAssessment.findByIdAndDelete(id);
    res.json({ success: true, message: "Task assessment deleted." });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit task assessment (Student)
 */
exports.submitTaskAssessment = async (req, res, next) => {
  try {
    const { jobId, assessmentId, submissions } = req.body;
    const candidateId = req.user.userId;

    if (!jobId || !assessmentId || !submissions || !Array.isArray(submissions)) {
      return res.status(400).json({
        success: false,
        message: "jobId, assessmentId, and submissions array are required.",
      });
    }

    const assessment = await TaskAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Task assessment not found." });
    }

    // Upsert — allow re-submission
    const submission = await TaskSubmission.findOneAndUpdate(
      { candidateId, jobId, assessmentId },
      {
        candidateId,
        jobId,
        assessmentId,
        submissions,
        submissionTime: new Date(),
        completed: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Advance candidate past the task_assessment stage
    const progress = await ApplicationProgress.findOne({ userId: candidateId, jobId });
    if (progress) {
      try { await advanceCandidateStage(progress._id); } catch (_) { /* already advanced */ }
    }

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate's submission for a specific assessment
 */
exports.getMySubmission = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const candidateId = req.user.userId;

    const submission = await TaskSubmission.findOne({ candidateId, assessmentId });

    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions for a job (HR view)
 */
exports.getSubmissionsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const submissions = await TaskSubmission.find({ jobId })
      .populate("candidateId", "name email")
      .sort({ submissionTime: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload proctoring recording / generate simulated analysis (Student)
 */
exports.uploadRecording = async (req, res, next) => {
  try {
    const { jobId, assessmentId } = req.body;
    const candidateId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required.",
      });
    }

    // Generate simulated proctoring analysis
    const analysis = {
      attentionScore: Math.floor(Math.random() * 13) + 85,
      faceDetectionRate: +(Math.random() * 0.08 + 0.91).toFixed(2),
      tabSwitchCount: Math.floor(Math.random() * 3),
      suspiciousActivities: [],
      environmentScore: ["Good", "Very Good", "Excellent"][Math.floor(Math.random() * 3)],
      overallVerdict:
        "No suspicious activity detected during the assessment session. Candidate maintained consistent focus throughout.",
      analyzedAt: new Date(),
    };

    const recording = await ProctoringRecording.findOneAndUpdate(
      { candidateId, jobId },
      { candidateId, jobId, assessmentId, analysis },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: recording });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload explanation recording / generate simulated analysis (Student)
 */
exports.uploadExplanation = async (req, res, next) => {
  try {
    const { jobId, assessmentId } = req.body;
    const candidateId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required.",
      });
    }

    // Generate simulated explanation analysis
    const analysis = {
      communicationScore: Math.floor(Math.random() * 16) + 80,
      clarity: ["Good", "Very Good", "Excellent"][Math.floor(Math.random() * 3)],
      technicalDepth: ["Adequate", "Good", "Thorough"][Math.floor(Math.random() * 3)],
      topicsCovered: [
        "Problem approach & methodology",
        "Tools & technologies used",
        "Implementation decisions",
        "Challenges faced & solutions",
      ],
      duration: Math.floor(Math.random() * 120) + 180,
      overallAssessment:
        "Candidate provided a clear and structured explanation of their work, demonstrating solid understanding of the task requirements and their implementation approach.",
      analyzedAt: new Date(),
    };

    const recording = await ExplanationRecording.findOneAndUpdate(
      { candidateId, jobId },
      { candidateId, jobId, assessmentId, analysis },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: recording });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze explanation video via ML service (HR triggers after submission)
 */
exports.analyzeExplanation = async (req, res, next) => {
  try {
    const { candidateId, jobId, assessmentId } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "candidateId and jobId are required.",
      });
    }

    // Look up the explanation recording to get the video URL (if any)
    const explanationRec = await ExplanationRecording.findOne({ candidateId, jobId });
    const videoUrl = explanationRec?.explanationVideoUrl || null;

    // Call FastAPI ML service
    const mlResponse = await fetch(`${ML_SERVICE_URL}/explanation/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
        video_url: videoUrl,
      }),
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      return res.status(502).json({
        success: false,
        message: "ML service error: " + errText,
      });
    }

    const mlResult = await mlResponse.json();

    // Store in MongoDB
    const analysis = await ExplanationAnalysis.findOneAndUpdate(
      { candidateId, jobId },
      {
        candidateId,
        jobId,
        assessmentId: assessmentId || null,
        analysisResult: {
          communication_score: mlResult.communication_score,
          technical_depth: mlResult.technical_depth,
          confidence_level: mlResult.confidence_level,
          problem_solving: mlResult.problem_solving,
          overall_score: mlResult.overall_score,
          strengths: mlResult.strengths,
          areas_for_improvement: mlResult.areas_for_improvement,
          transcript_stats: mlResult.transcript_stats,
          pipeline: mlResult.pipeline,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * Get explanation analysis for a candidate (HR view)
 */
exports.getExplanationAnalysis = async (req, res, next) => {
  try {
    const { candidateId, jobId } = req.params;

    const analysis = await ExplanationAnalysis.findOne({ candidateId, jobId });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No explanation analysis found for this candidate.",
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full task assessment results for a job (HR dashboard)
 * Aggregates: submissions, proctoring, explanation recordings, AI analysis
 */
exports.getTaskResults = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Fetch all data in parallel
    const [assessments, submissions, proctoring, explanations, analyses] =
      await Promise.all([
        TaskAssessment.find({ jobId }),
        TaskSubmission.find({ jobId }).populate("candidateId", "name email"),
        ProctoringRecording.find({ jobId }),
        ExplanationRecording.find({ jobId }),
        ExplanationAnalysis.find({ jobId }),
      ]);

    // Index by candidateId for quick lookup
    const proctoringMap = {};
    proctoring.forEach((p) => {
      proctoringMap[p.candidateId.toString()] = p;
    });
    const explanationMap = {};
    explanations.forEach((e) => {
      explanationMap[e.candidateId.toString()] = e;
    });
    const analysisMap = {};
    analyses.forEach((a) => {
      analysisMap[a.candidateId.toString()] = a;
    });

    // Build per-candidate results
    const candidates = submissions.map((sub) => {
      const cid = sub.candidateId?._id?.toString();
      const analysis = analysisMap[cid] || null;
      const procRec = proctoringMap[cid] || null;
      const expRec = explanationMap[cid] || null;

      // Calculate task completion score from submissions
      const assessment = assessments.find(
        (a) => a._id.toString() === sub.assessmentId?.toString()
      );
      const totalTasks = assessment?.tasks?.length || 1;
      const completedTasks = sub.submissions?.filter(
        (s) => (s.submissionFiles?.length > 0 || s.githubLink)
      ).length || 0;
      const taskCompletionScore = Math.round((completedTasks / totalTasks) * 100);

      // Use stored analysis or generate simulated scores
      const aiAnalysis = analysis
        ? analysis.analysisResult
        : {
            communication_score: Math.floor(Math.random() * 16) + 78,
            technical_depth: Math.floor(Math.random() * 18) + 72,
            confidence_level: Math.floor(Math.random() * 16) + 75,
            problem_solving: Math.floor(Math.random() * 18) + 74,
            overall_score: Math.floor(Math.random() * 14) + 78,
            strengths: [
              "Clear explanation of approach",
              "Strong debugging skills",
              "Good architectural thinking",
              "Structured problem decomposition",
            ].slice(0, Math.floor(Math.random() * 2) + 3),
            areas_for_improvement: [
              "Could elaborate more on trade-offs",
              "Limited mention of alternative approaches",
            ].slice(0, Math.floor(Math.random() * 2) + 1),
          };

      // Use stored proctoring or generate simulated data
      const proctoringAnalysis = procRec?.analysis || {
        attentionScore: Math.floor(Math.random() * 10) + 88,
        faceDetectionRate: +(Math.random() * 0.06 + 0.92).toFixed(2),
        tabSwitchCount: Math.floor(Math.random() * 3),
        suspiciousActivities: [],
        environmentScore: ["Good", "Very Good", "Excellent"][
          Math.floor(Math.random() * 3)
        ],
        overallVerdict:
          "No suspicious activity detected. Candidate maintained consistent focus.",
      };

      return {
        candidateId: cid,
        candidateName: sub.candidateId?.name || "Unknown",
        candidateEmail: sub.candidateId?.email || "",
        assessmentId: sub.assessmentId,
        submissions: sub.submissions,
        submissionTime: sub.submissionTime,
        completed: sub.completed,
        taskCompletionScore,
        proctoring: { analysis: proctoringAnalysis },
        explanation: expRec
          ? { videoUrl: expRec.explanationVideoUrl, analysis: expRec.analysis }
          : null,
        aiAnalysis,
      };
    });

    res.json({ success: true, data: { assessments, candidates } });
  } catch (error) {
    next(error);
  }
};
