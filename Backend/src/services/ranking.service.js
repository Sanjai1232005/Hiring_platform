const ApplicationProgress = require('../models/applicationProgress.model');
const ProctoringRecording = require('../models/proctoringRecording.model');
const ExplanationAnalysis = require('../models/explanationAnalysis.model');

const WEIGHTS = {
  resume: 0.30,
  coding: 0.30,
  task: 0.20,
  explanation: 0.10,
  proctoring: 0.10,
};

/**
 * Calculate a weighted overall score for a single candidate on a job.
 * Missing components are excluded and weights re-normalised across available ones.
 *
 * @param {string} candidateId  - User _id
 * @param {string} jobId        - Job _id
 * @returns {number|null}       - Score 0-100, or null if no component available
 */
const calculateCandidateScore = async (candidateId, jobId) => {
  const [app, analysis, proctor] = await Promise.all([
    ApplicationProgress.findOne({ userId: candidateId, jobId }),
    ExplanationAnalysis.findOne({ candidateId, jobId }),
    ProctoringRecording.findOne({ candidateId, jobId }),
  ]);

  if (!app) return null;

  const components = [];

  // Resume score (0-100)
  if (app.resumeScore != null) {
    components.push({ weight: WEIGHTS.resume, value: app.resumeScore });
  }

  // Coding score (0-100)
  if (app.score != null && app.score > 0) {
    components.push({ weight: WEIGHTS.coding, value: app.score });
  }

  // Task / explanation scores come from ExplanationAnalysis
  const ar = analysis?.analysisResult;
  if (ar) {
    // Task score = overall_score from AI analysis
    if (ar.overall_score != null) {
      components.push({ weight: WEIGHTS.task, value: ar.overall_score });
    }

    // Explanation score = average of the four sub-scores
    const subScores = [ar.communication_score, ar.technical_depth, ar.confidence_level, ar.problem_solving]
      .filter((v) => v != null);
    if (subScores.length > 0) {
      const avg = subScores.reduce((a, b) => a + b, 0) / subScores.length;
      components.push({ weight: WEIGHTS.explanation, value: avg });
    }
  }

  // Proctoring score = attentionScore (0-100)
  if (proctor?.analysis?.attentionScore != null) {
    components.push({ weight: WEIGHTS.proctoring, value: proctor.analysis.attentionScore });
  }

  if (components.length === 0) return null;

  // Re-normalise weights so they sum to 1
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const score = components.reduce((s, c) => s + (c.value * c.weight / totalWeight), 0);
  const rounded = Math.round(score * 100) / 100;

  // Persist
  app.overallScore = rounded;
  await app.save();

  return rounded;
};

/**
 * Batch-calculate scores for every applicant on a given job.
 * Returns candidates sorted descending by overallScore.
 */
const rankCandidatesForJob = async (jobId) => {
  const apps = await ApplicationProgress.find({ jobId });

  await Promise.all(
    apps.map((a) => calculateCandidateScore(a.userId.toString(), jobId))
  );

  // Return freshly-loaded, sorted list
  const ranked = await ApplicationProgress.find({ jobId })
    .populate('userId', 'name email')
    .sort({ overallScore: -1 });

  return ranked;
};

module.exports = { calculateCandidateScore, rankCandidatesForJob, WEIGHTS };
