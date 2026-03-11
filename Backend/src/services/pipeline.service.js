const PIPELINES = {
  coding_only: [
    { name: 'applied',          label: 'Applied' },
    { name: 'resume_screening', label: 'Resume Screening' },
    { name: 'coding_test',      label: 'Coding Test' },
    { name: 'hr_review',        label: 'HR Review' },
    { name: 'interview',        label: 'Interview' },
    { name: 'final',            label: 'Selected' },
  ],
  task_only: [
    { name: 'applied',          label: 'Applied' },
    { name: 'resume_screening', label: 'Resume Screening' },
    { name: 'task_assessment',  label: 'Task Assessment' },
    { name: 'hr_review',        label: 'HR Review' },
    { name: 'interview',        label: 'Interview' },
    { name: 'final',            label: 'Selected' },
  ],
  coding_then_task: [
    { name: 'applied',          label: 'Applied' },
    { name: 'resume_screening', label: 'Resume Screening' },
    { name: 'coding_test',      label: 'Coding Test' },
    { name: 'task_assessment',  label: 'Task Assessment' },
    { name: 'hr_review',        label: 'HR Review' },
    { name: 'interview',        label: 'Interview' },
    { name: 'final',            label: 'Selected' },
  ],
  task_then_coding: [
    { name: 'applied',          label: 'Applied' },
    { name: 'resume_screening', label: 'Resume Screening' },
    { name: 'task_assessment',  label: 'Task Assessment' },
    { name: 'coding_test',      label: 'Coding Test' },
    { name: 'hr_review',        label: 'HR Review' },
    { name: 'interview',        label: 'Interview' },
    { name: 'final',            label: 'Selected' },
  ],
  none: [
    { name: 'applied',          label: 'Applied' },
    { name: 'resume_screening', label: 'Resume Screening' },
    { name: 'hr_review',        label: 'HR Review' },
    { name: 'interview',        label: 'Interview' },
    { name: 'final',            label: 'Selected' },
  ],
};

/**
 * Generate an ordered pipeline stage array for a given assessment strategy.
 * @param {string} strategy - One of the assessmentStrategy enum values.
 * @returns {{ name: string, label: string }[]}
 */
function generatePipeline(strategy) {
  return PIPELINES[strategy] || PIPELINES.coding_only;
}

module.exports = { generatePipeline };
