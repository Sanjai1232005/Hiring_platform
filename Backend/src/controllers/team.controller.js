const Team = require('../models/team.model');
const Job = require('../models/job.model');
const ApplicationProgress = require('../models/applicationProgress.model');
const StudentProfile = require('../models/studentProfile.model');
const ExplanationAnalysis = require('../models/explanationAnalysis.model');
const User = require('../models/user.model');

const mongoose = require('mongoose');

/* ─────────────────────────────────────────────
   Simulated candidate pool (used when < 4 real
   final-round candidates exist for the job)
   ───────────────────────────────────────────── */
const SIMULATED_CANDIDATES = [
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Mithilesh',
    email: 'mithilesh@smartrecruit.ai',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'AWS'],
    scores: { overall: 87, coding: 92, communication: 78, technicalDepth: 90, problemSolving: 85, resume: 82 },
    strengths: ['Exceptional coding ability', 'Strong system design thinking', 'Deep understanding of distributed systems'],
    improvements: ['Could improve presentation skills', 'Needs more experience with CI/CD pipelines'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Ganesan',
    email: 'ganesan@smartrecruit.ai',
    skills: ['Python', 'Django', 'PostgreSQL', 'Machine Learning', 'TensorFlow', 'Git'],
    scores: { overall: 82, coding: 80, communication: 88, technicalDepth: 78, problemSolving: 82, resume: 85 },
    strengths: ['Excellent team communicator', 'Strong analytical mindset', 'Good at translating business requirements'],
    improvements: ['Could deepen backend architecture knowledge', 'Needs more frontend experience'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Hemanth',
    email: 'hemanth@smartrecruit.ai',
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'React', 'Redis', 'Microservices'],
    scores: { overall: 79, coding: 85, communication: 70, technicalDepth: 82, problemSolving: 78, resume: 76 },
    strengths: ['Strong backend architecture skills', 'Quick problem solver', 'Good DevOps understanding'],
    improvements: ['Communication clarity needs work', 'Should practice system design interviews'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Sanjay',
    email: 'sanjay@smartrecruit.ai',
    skills: ['JavaScript', 'Vue.js', 'Express', 'GraphQL', 'Firebase', 'Tailwind CSS'],
    scores: { overall: 84, coding: 88, communication: 82, technicalDepth: 75, problemSolving: 90, resume: 80 },
    strengths: ['Creative problem solver', 'Excellent debugging skills', 'Fast learner with new technologies'],
    improvements: ['Could improve documentation habits', 'Needs deeper database optimization knowledge'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Arun Kumar',
    email: 'arun@smartrecruit.ai',
    skills: ['C++', 'Python', 'React', 'AWS', 'System Design', 'Data Structures'],
    scores: { overall: 91, coding: 95, communication: 75, technicalDepth: 93, problemSolving: 92, resume: 88 },
    strengths: ['Top-tier algorithmic skills', 'Deep system design expertise', 'Strong competitive programming background'],
    improvements: ['Team collaboration can be improved', 'Should work on soft skills'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Priya Sharma',
    email: 'priya@smartrecruit.ai',
    skills: ['React', 'Next.js', 'Figma', 'UI/UX', 'TypeScript', 'Storybook'],
    scores: { overall: 80, coding: 72, communication: 92, technicalDepth: 74, problemSolving: 80, resume: 86 },
    strengths: ['Outstanding UI/UX sensibility', 'Excellent collaboration and communication', 'Strong design-system knowledge'],
    improvements: ['Backend skills need strengthening', 'Could learn more about performance optimization'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Rahul Verma',
    email: 'rahul@smartrecruit.ai',
    skills: ['Go', 'Docker', 'Kubernetes', 'gRPC', 'PostgreSQL', 'CI/CD'],
    scores: { overall: 76, coding: 78, communication: 68, technicalDepth: 85, problemSolving: 74, resume: 72 },
    strengths: ['Strong DevOps and infrastructure skills', 'Good at building scalable systems', 'Solid cloud architecture knowledge'],
    improvements: ['Frontend skills are lacking', 'Needs to improve verbal communication'],
  },
  {
    userId: new mongoose.Types.ObjectId(),
    name: 'Deepika Nair',
    email: 'deepika@smartrecruit.ai',
    skills: ['Python', 'Flask', 'NLP', 'PyTorch', 'SQL', 'Data Analysis'],
    scores: { overall: 83, coding: 80, communication: 86, technicalDepth: 88, problemSolving: 76, resume: 84 },
    strengths: ['Strong ML/AI expertise', 'Great at presenting technical concepts', 'Solid research methodology'],
    improvements: ['Could improve web development skills', 'Needs more production deployment experience'],
  },
];

/* ─────────────────────────────────────────────
   Helper: gather enriched candidate data
   (Falls back to simulated data if < 4 real
    final-round candidates exist)
   ───────────────────────────────────────────── */
const gatherCandidateData = async (jobId) => {
  const apps = await ApplicationProgress.find({
    jobId,
    currentStage: 'final',
  }).lean();

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const [profile, analysis, user] = await Promise.all([
        StudentProfile.findOne({ userId: app.userId }).lean(),
        ExplanationAnalysis.findOne({ candidateId: app.userId, jobId }).lean(),
        User.findById(app.userId).select('name email').lean(),
      ]);

      const ar = analysis?.analysisResult || {};
      return {
        userId: app.userId,
        name: user?.name || app.name || 'Unknown',
        email: user?.email || app.email || '',
        skills: profile?.skills || [],
        scores: {
          overall: app.overallScore || 0,
          coding: app.score || 0,
          communication: ar.communication_score || 0,
          technicalDepth: ar.technical_depth || 0,
          problemSolving: ar.problem_solving || 0,
          resume: app.resumeScore || 0,
        },
        strengths: ar.strengths || [],
        improvements: ar.areas_for_improvement || [],
      };
    })
  );

  // If not enough real candidates, merge with simulated ones
  if (enriched.length < 4) {
    const needed = SIMULATED_CANDIDATES.length;
    const simulated = SIMULATED_CANDIDATES.slice(0, needed).map((c) => ({
      ...c,
      userId: c.userId.toString(),
      _simulated: true,
    }));
    return [...enriched, ...simulated];
  }

  return enriched;
};

/* ─────────────────────────────────────────────
   Skill-balanced team assignment algorithm
   ───────────────────────────────────────────── */
const formBalancedTeams = (candidates, teamSize) => {
  if (candidates.length < 2) return [];

  const size = Math.max(2, Math.min(teamSize, 8));
  const numTeams = Math.max(1, Math.ceil(candidates.length / size));

  // Sort by overall score descending — distribute best candidates evenly
  const sorted = [...candidates].sort((a, b) => b.scores.overall - a.scores.overall);

  // Build a global skill map for demand analysis
  const globalSkills = {};
  sorted.forEach((c) => {
    c.skills.forEach((s) => {
      const sk = s.toLowerCase().trim();
      globalSkills[sk] = (globalSkills[sk] || 0) + 1;
    });
  });

  // Initialize empty teams
  const teams = Array.from({ length: numTeams }, () => ({
    members: [],
    skillSet: new Set(),
    totalScore: 0,
  }));

  // Round-robin + skill gap filling
  // Phase 1: serpentine draft — evenly distribute talent by score
  sorted.forEach((candidate, i) => {
    // Serpentine: 0,1,2,...,n-1,n-1,...,2,1,0,0,1,...
    const round = Math.floor(i / numTeams);
    const pos = i % numTeams;
    const teamIdx = round % 2 === 0 ? pos : numTeams - 1 - pos;
    teams[teamIdx].members.push(candidate);
    candidate.skills.forEach((s) => teams[teamIdx].skillSet.add(s.toLowerCase().trim()));
    teams[teamIdx].totalScore += candidate.scores.overall;
  });

  return teams;
};

/* ─────────────────────────────────────────────
   Compute team metrics
   ───────────────────────────────────────────── */
const computeTeamMetrics = (members, jobSkills) => {
  const n = members.length || 1;

  const avg = (key) =>
    Math.round((members.reduce((s, m) => s + (m.scores[key] || 0), 0) / n) * 100) / 100;

  const teamScore = avg('overall');

  // Skill coverage
  const skillCoverage = {};
  members.forEach((m) => {
    (m.skills || []).forEach((s) => {
      const sk = s.toLowerCase().trim();
      skillCoverage[sk] = (skillCoverage[sk] || 0) + 1;
    });
  });

  // Skill diversity = unique skills / max possible (job skills union member skills)
  const allSkillsSet = new Set([
    ...Object.keys(skillCoverage),
    ...(jobSkills || []).map((s) => s.toLowerCase().trim()),
  ]);
  const coveredCount = Object.keys(skillCoverage).length;
  const skillDiversity = allSkillsSet.size > 0
    ? Math.round((coveredCount / allSkillsSet.size) * 100)
    : 0;

  return {
    teamScore,
    skillDiversity,
    skillCoverage,
    performanceMetrics: {
      avgCoding: avg('coding'),
      avgCommunication: avg('communication'),
      avgTechnicalDepth: avg('technicalDepth'),
      avgProblemSolving: avg('problemSolving'),
      avgResume: avg('resume'),
    },
  };
};

/* ─────────────────────────────────────────────
   Suggest role for each member based on top skill dimension
   ───────────────────────────────────────────── */
const suggestRole = (member) => {
  const { coding, communication, technicalDepth, problemSolving } = member.scores;
  const dims = [
    { label: 'Tech Lead', val: technicalDepth },
    { label: 'Code Specialist', val: coding },
    { label: 'Problem Solver', val: problemSolving },
    { label: 'Communicator', val: communication },
  ];
  dims.sort((a, b) => b.val - a.val);
  return dims[0]?.label || 'Team Member';
};

/* ═══════════════════════════════════════════════
   CONTROLLERS
   ═══════════════════════════════════════════════ */

/**
 * GET /teams/candidates/:jobId
 * Return enriched final-round candidates for a job.
 */
exports.getFinalCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidates = await gatherCandidateData(jobId);
    const job = await Job.findById(jobId).select('skills title').lean();
    res.json({ candidates, jobSkills: job?.skills || [], jobTitle: job?.title || '' });
  } catch (err) {
    console.error('getFinalCandidates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /teams/auto-form
 * Auto-form balanced teams for a job.
 * Body: { jobId, teamSize }
 */
exports.autoFormTeams = async (req, res) => {
  try {
    const { jobId, teamSize = 4 } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const candidates = await gatherCandidateData(jobId);
    if (candidates.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 final-round candidates to form teams' });
    }

    const job = await Job.findById(jobId).select('skills title').lean();
    const jobSkills = job?.skills || [];

    const rawTeams = formBalancedTeams(candidates, teamSize);

    // Delete previous auto-formed teams for this job by this HR
    await Team.deleteMany({ jobId, createdBy: req.user.userId });

    const savedTeams = await Promise.all(
      rawTeams.map(async (t, i) => {
        const membersWithRoles = t.members.map((m) => ({
          ...m,
          role: suggestRole(m),
        }));

        const metrics = computeTeamMetrics(membersWithRoles, jobSkills);

        const team = await Team.create({
          jobId,
          name: `Team ${String.fromCharCode(65 + i)}`,   // Team A, B, C…
          description: `Auto-formed skill-balanced team for ${job?.title || 'this role'}`,
          members: membersWithRoles,
          createdBy: req.user.userId,
          ...metrics,
        });

        return team;
      })
    );

    res.status(201).json({ teams: savedTeams });
  } catch (err) {
    console.error('autoFormTeams error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /teams/job/:jobId
 * Get all teams for a job.
 */
exports.getTeamsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const teams = await Team.find({ jobId }).sort({ createdAt: -1 }).lean();
    const job = await Job.findById(jobId).select('skills title').lean();
    res.json({ teams, jobSkills: job?.skills || [], jobTitle: job?.title || '' });
  } catch (err) {
    console.error('getTeamsByJob error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /teams/:teamId
 * Update a team (rename, change description, reassign roles).
 */
exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, members } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (name) team.name = name;
    if (description) team.description = description;
    if (members) {
      team.members = members;
      const job = await Job.findById(team.jobId).select('skills').lean();
      const metrics = computeTeamMetrics(members, job?.skills || []);
      team.teamScore = metrics.teamScore;
      team.skillDiversity = metrics.skillDiversity;
      team.skillCoverage = metrics.skillCoverage;
      team.performanceMetrics = metrics.performanceMetrics;
    }

    await team.save();
    res.json({ team });
  } catch (err) {
    console.error('updateTeam error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /teams/:teamId
 */
exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    await Team.findByIdAndDelete(teamId);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    console.error('deleteTeam error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
