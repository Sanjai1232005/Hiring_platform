const ApplicationProgress = require('../models/applicationProgress.model');
const Job = require('../models/job.model');
const { generatePipeline } = require('./pipeline.service');

/**
 * Advance a candidate to the next pipeline stage.
 *
 * 1. Loads the ApplicationProgress (with its stored pipelineStages).
 * 2. Falls back to regenerating the pipeline from the Job's assessmentStrategy
 *    when pipelineStages is empty (legacy applications created before the pipeline feature).
 * 3. Finds the current stage index, moves to the next one.
 *
 * @param {string|ObjectId} applicationId - ApplicationProgress document _id
 * @returns {{ application, previousStage, newStage, isLastStage }}
 */
async function advanceCandidateStage(applicationId) {
  const application = await ApplicationProgress.findById(applicationId);
  if (!application) throw new Error('Application not found');

  // Build / retrieve the ordered pipeline
  let stages = application.pipelineStages;
  if (!stages || stages.length === 0) {
    const job = await Job.findById(application.jobId);
    if (!job) throw new Error('Job not found');
    stages = generatePipeline(job.assessmentStrategy || 'coding_only');
    application.pipelineStages = stages;
  }

  // Patch legacy pipelines that are missing the 'final' stage
  const hasFinal = stages.some((s) => s.name === 'final');
  if (!hasFinal) {
    stages.push({ name: 'final', label: 'Selected' });
    application.pipelineStages = stages;
  }

  const currentName = application.currentStage;
  const currentIndex = stages.findIndex((s) => s.name === currentName);

  // If already at the last stage or stage not found, nothing to advance
  if (currentIndex === -1) {
    throw new Error(`Current stage "${currentName}" not found in pipeline`);
  }
  if (currentIndex >= stages.length - 1) {
    return {
      application,
      previousStage: currentName,
      newStage: currentName,
      isLastStage: true,
    };
  }

  const nextStage = stages[currentIndex + 1].name;
  const previousStage = currentName;

  application.currentStage = nextStage;
  application.markModified('currentStage');
  application.markModified('pipelineStages');
  await application.save();

  return {
    application,
    previousStage,
    newStage: nextStage,
    isLastStage: currentIndex + 1 >= stages.length - 1,
  };
}

/**
 * Move a candidate to a specific named stage (e.g. 'rejected').
 * Validates the target exists in the candidate's pipeline before setting it
 * (rejected / final are always allowed even if not in pipeline).
 *
 * @param {string|ObjectId} applicationId
 * @param {string} targetStage
 */
async function moveCandidateToStage(applicationId, targetStage) {
  const application = await ApplicationProgress.findById(applicationId);
  if (!application) throw new Error('Application not found');

  const specialStages = ['rejected', 'final'];
  if (!specialStages.includes(targetStage)) {
    const stages = application.pipelineStages || [];
    const found = stages.some((s) => s.name === targetStage);
    if (!found) throw new Error(`Stage "${targetStage}" is not in this candidate's pipeline`);
  }

  const previousStage = application.currentStage;
  application.currentStage = targetStage;
  application.markModified('currentStage');
  await application.save();

  return { application, previousStage, newStage: targetStage };
}

/**
 * Bulk-advance multiple candidates (by userId) for a given job to the next stage.
 *
 * @param {string} jobId
 * @param {string[]} userIds
 * @returns {Object[]} results per candidate
 */
async function bulkAdvanceCandidates(jobId, userIds) {
  const applications = await ApplicationProgress.find({
    jobId,
    userId: { $in: userIds },
  });

  const results = [];
  for (const app of applications) {
    try {
      const result = await advanceCandidateStage(app._id);
      results.push({ userId: app.userId, success: true, ...result });
    } catch (err) {
      results.push({ userId: app.userId, success: false, error: err.message });
    }
  }
  return results;
}

module.exports = {
  advanceCandidateStage,
  moveCandidateToStage,
  bulkAdvanceCandidates,
};
