const Job = require('../models/job.model');
const ApplicationProgress = require('../models/applicationProgress.model');
const StudentProfile = require('../models/studentProfile.model');
const ExplanationAnalysis = require('../models/explanationAnalysis.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/* ═══════════════════════════════════════════════════════
   ROLE ARCHETYPES
   Each archetype has weighted scoring criteria,
   personality traits, growth paths, and industry mapping.
   ═══════════════════════════════════════════════════════ */
const ROLE_ARCHETYPES = [
  {
    id: 'architect',
    title: 'System Architect',
    tagline: 'The Visionary Builder',
    icon: '🏗️',
    description: 'Sees beyond code to design resilient, scalable systems. You think in distributed components, data flows, and failure modes before writing a single line.',
    weights: { coding: 0.2, technicalDepth: 0.35, problemSolving: 0.25, communication: 0.1, resume: 0.1 },
    requiredTraits: ['system design', 'architecture', 'microservices', 'distributed', 'scalable'],
    skillSignals: ['System Design', 'Microservices', 'Kubernetes', 'Docker', 'AWS', 'gRPC', 'Redis', 'Kafka'],
    careerPath: ['Junior Developer → Backend Engineer → System Architect → Principal Architect → CTO'],
    dailyLife: 'Design system architectures, conduct architecture reviews, define technical standards, mentor teams on scalability patterns, evaluate build-vs-buy decisions.',
    industryFit: ['Cloud Infrastructure', 'FinTech', 'Enterprise SaaS', 'E-Commerce at Scale'],
  },
  {
    id: 'fullstack_engineer',
    title: 'Full-Stack Engineer',
    tagline: 'The Bridge Builder',
    icon: '🌉',
    description: 'Equally comfortable with pixel-perfect UIs and optimized database queries. You connect the frontend experience to backend logic seamlessly.',
    weights: { coding: 0.3, technicalDepth: 0.2, problemSolving: 0.2, communication: 0.15, resume: 0.15 },
    requiredTraits: ['frontend', 'backend', 'full stack', 'fullstack', 'api'],
    skillSignals: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Next.js', 'Vue.js', 'PostgreSQL'],
    careerPath: ['Intern → Full-Stack Developer → Senior Full-Stack Engineer → Tech Lead → Engineering Manager'],
    dailyLife: 'Build end-to-end features, collaborate with design and product teams, write APIs and UI components, participate in code reviews, debug across the stack.',
    industryFit: ['Startups', 'Product Companies', 'Digital Agencies', 'SaaS Platforms'],
  },
  {
    id: 'frontend_specialist',
    title: 'Frontend / UI Engineer',
    tagline: 'The Experience Crafter',
    icon: '🎨',
    description: 'Obsessed with user experience, pixel precision, and interaction design. You turn wireframes into delightful, accessible interfaces.',
    weights: { coding: 0.25, communication: 0.25, technicalDepth: 0.15, problemSolving: 0.2, resume: 0.15 },
    requiredTraits: ['ui', 'ux', 'frontend', 'design', 'accessibility'],
    skillSignals: ['React', 'Next.js', 'Figma', 'UI/UX', 'Tailwind CSS', 'Storybook', 'TypeScript', 'CSS', 'Vue.js'],
    careerPath: ['UI Developer → Frontend Engineer → Senior Frontend Engineer → Design Engineer → Frontend Architect'],
    dailyLife: 'Implement responsive interfaces, build design systems, optimize rendering performance, conduct accessibility audits, collaborate with UX designers.',
    industryFit: ['Consumer Tech', 'Media & Entertainment', 'E-Commerce', 'Design Studios'],
  },
  {
    id: 'backend_engineer',
    title: 'Backend Engineer',
    tagline: 'The Engine Room Captain',
    icon: '⚙️',
    description: 'You build the invisible backbone — APIs, databases, security layers, and background jobs that keep products running.',
    weights: { coding: 0.3, technicalDepth: 0.3, problemSolving: 0.2, communication: 0.1, resume: 0.1 },
    requiredTraits: ['backend', 'api', 'database', 'server', 'infrastructure'],
    skillSignals: ['Java', 'Spring Boot', 'Python', 'Django', 'Go', 'PostgreSQL', 'Redis', 'Express', 'Flask', 'C++'],
    careerPath: ['Junior Backend Dev → Backend Engineer → Senior Backend Engineer → Staff Engineer → System Architect'],
    dailyLife: 'Design and build RESTful/GraphQL APIs, optimize database queries, implement authentication, handle concurrency challenges, set up monitoring.',
    industryFit: ['FinTech', 'HealthTech', 'Enterprise Software', 'Cloud Platforms'],
  },
  {
    id: 'ml_engineer',
    title: 'ML / Data Engineer',
    tagline: 'The Pattern Decoder',
    icon: '🧠',
    description: 'You find meaning in data where others see noise. ML models, data pipelines, and statistical analysis are your tools of trade.',
    weights: { technicalDepth: 0.3, problemSolving: 0.3, coding: 0.2, communication: 0.1, resume: 0.1 },
    requiredTraits: ['machine learning', 'ml', 'data', 'ai', 'analytics', 'nlp'],
    skillSignals: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Machine Learning', 'Data Analysis', 'SQL', 'Pandas', 'Scikit-learn'],
    careerPath: ['Data Analyst → ML Engineer → Senior ML Engineer → ML Architect → Head of AI/ML'],
    dailyLife: 'Train and evaluate models, build data pipelines, conduct experiments, analyze results, deploy ML models to production, research new techniques.',
    industryFit: ['AI Startups', 'HealthTech', 'FinTech', 'Research Labs', 'AdTech'],
  },
  {
    id: 'devops_engineer',
    title: 'DevOps / Platform Engineer',
    tagline: 'The Automation Maestro',
    icon: '🚀',
    description: 'You believe in infrastructure as code, zero-downtime deployments, and observable systems. Automation is your second nature.',
    weights: { technicalDepth: 0.3, problemSolving: 0.25, coding: 0.2, communication: 0.1, resume: 0.15 },
    requiredTraits: ['devops', 'infrastructure', 'deploy', 'ci/cd', 'cloud'],
    skillSignals: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Jenkins', 'Go', 'Linux', 'Prometheus'],
    careerPath: ['Junior DevOps → DevOps Engineer → Senior Platform Engineer → SRE Lead → VP of Infrastructure'],
    dailyLife: 'Build CI/CD pipelines, manage cloud infrastructure, implement monitoring/alerting, automate deployments, optimize costs, ensure reliability.',
    industryFit: ['Cloud Providers', 'SaaS', 'FinTech', 'Large-Scale Platforms'],
  },
  {
    id: 'problem_solver',
    title: 'Algorithm & Problem-Solving Specialist',
    tagline: 'The Logic Ninja',
    icon: '🧩',
    description: 'Your mind naturally gravitates towards elegant solutions. Competitive programming and algorithmic thinking set you apart.',
    weights: { problemSolving: 0.35, coding: 0.3, technicalDepth: 0.2, communication: 0.05, resume: 0.1 },
    requiredTraits: ['algorithm', 'competitive', 'data structure', 'optimization'],
    skillSignals: ['C++', 'Data Structures', 'Algorithms', 'Python', 'Java', 'System Design'],
    careerPath: ['Software Engineer → Senior Engineer → Staff Engineer (Performance) → Distinguished Engineer'],
    dailyLife: 'Optimize critical code paths, solve complex algorithmic challenges, conduct technical interviews, contribute to open-source libraries, mentor on DSA.',
    industryFit: ['Big Tech (FAANG)', 'Trading Firms', 'Gaming', 'Security'],
  },
  {
    id: 'tech_lead',
    title: 'Technical Project Lead',
    tagline: 'The Orchestrator',
    icon: '🎯',
    description: 'You combine technical depth with exceptional communication. Leading teams, driving decisions, and shipping products is where you thrive.',
    weights: { communication: 0.3, technicalDepth: 0.2, problemSolving: 0.2, coding: 0.15, resume: 0.15 },
    requiredTraits: ['lead', 'team', 'communication', 'management', 'collaboration'],
    skillSignals: ['System Design', 'React', 'Node.js', 'TypeScript', 'Git', 'Agile', 'Microservices'],
    careerPath: ['Developer → Senior Developer → Tech Lead → Engineering Manager → VP Engineering → CTO'],
    dailyLife: 'Lead sprint planning, make architecture decisions, conduct code reviews, mentor junior devs, communicate with stakeholders, resolve blockers.',
    industryFit: ['Product Companies', 'Consulting', 'Startups', 'Enterprise'],
  },
];

/* ═══════════════════════════════════════════════════════
   SCORING ENGINE
   ═══════════════════════════════════════════════════════ */

/**
 * Compute how well a candidate's skills match an archetype's signals.
 */
const computeSkillAffinity = (candidateSkills, archetype) => {
  const cSet = new Set((candidateSkills || []).map((s) => s.toLowerCase().trim()));
  const signals = archetype.skillSignals.map((s) => s.toLowerCase().trim());
  let hits = 0;
  const matched = [];
  const missing = [];
  signals.forEach((s) => {
    if (cSet.has(s)) { hits++; matched.push(s); }
    else missing.push(s);
  });
  return {
    score: signals.length > 0 ? Math.round((hits / signals.length) * 100) : 0,
    matched,
    missing,
  };
};

/**
 * Compute how well strength/improvement text aligns with an archetype.
 */
const computeTraitAffinity = (strengths, improvements, archetype) => {
  const allText = [...(strengths || []), ...(improvements || [])].join(' ').toLowerCase();
  const traitHits = archetype.requiredTraits.filter((t) => allText.includes(t));
  return {
    score: archetype.requiredTraits.length > 0
      ? Math.round((traitHits.length / archetype.requiredTraits.length) * 100)
      : 0,
    matchedTraits: traitHits,
  };
};

/**
 * Build a full role-fit profile for one candidate.
 */
const buildRoleFitProfile = (candidate) => {
  const { skills, scores, strengths, improvements } = candidate;
  const s = scores || {};

  const fits = ROLE_ARCHETYPES.map((arch) => {
    // Weighted score fit
    const weightedScore =
      (s.coding || 0) * arch.weights.coding +
      (s.technicalDepth || 0) * arch.weights.technicalDepth +
      (s.problemSolving || 0) * arch.weights.problemSolving +
      (s.communication || 0) * arch.weights.communication +
      (s.resume || 0) * arch.weights.resume;

    const skillAffinity = computeSkillAffinity(skills, arch);
    const traitAffinity = computeTraitAffinity(strengths, improvements, arch);

    // Composite fit: 50% weighted score, 30% skill affinity, 20% trait affinity
    const fitScore = Math.round(
      weightedScore * 0.50 +
      skillAffinity.score * 0.30 +
      traitAffinity.score * 0.20
    );

    return {
      archetype: arch.id,
      title: arch.title,
      tagline: arch.tagline,
      icon: arch.icon,
      description: arch.description,
      fitScore,
      breakdown: {
        performanceScore: Math.round(weightedScore),
        skillMatch: skillAffinity.score,
        traitAlignment: traitAffinity.score,
      },
      matchedSkills: skillAffinity.matched,
      missingSkills: skillAffinity.missing,
      matchedTraits: traitAffinity.matchedTraits,
      careerPath: arch.careerPath,
      dailyLife: arch.dailyLife,
      industryFit: arch.industryFit,
    };
  });

  // Sort by fitScore descending
  fits.sort((a, b) => b.fitScore - a.fitScore);

  const primary = fits[0];
  const secondary = fits[1];
  const tertiary = fits[2];

  // Compute candidate "DNA" — a profile summary
  const topDimension = Object.entries(s)
    .filter(([k]) => k !== 'overall' && k !== 'resume')
    .sort(([, a], [, b]) => b - a);
  const dominantTrait = topDimension[0]?.[0] || 'coding';
  const secondaryTrait = topDimension[1]?.[0] || 'problemSolving';

  // Generate personalized growth plan
  const growthPlan = generateGrowthPlan(candidate, primary, secondary);

  return {
    candidateId: candidate.userId,
    name: candidate.name,
    email: candidate.email,
    skills: candidate.skills,
    scores: candidate.scores,
    strengths: candidate.strengths,
    improvements: candidate.improvements,
    _simulated: candidate._simulated || false,

    // Role DNA
    roleDNA: {
      primaryRole: primary,
      secondaryRole: secondary,
      tertiaryRole: tertiary,
      allFits: fits,
      dominantTrait: formatTraitLabel(dominantTrait),
      secondaryTrait: formatTraitLabel(secondaryTrait),
      profileSummary: generateProfileSummary(candidate, primary, secondary),
      growthPlan,
      readinessLevel: computeReadiness(primary.fitScore),
    },
  };
};

const formatTraitLabel = (trait) => {
  const map = {
    coding: 'Coding Excellence',
    technicalDepth: 'Technical Depth',
    problemSolving: 'Problem Solving',
    communication: 'Communication',
    resume: 'Professional Profile',
  };
  return map[trait] || trait;
};

const computeReadiness = (fitScore) => {
  if (fitScore >= 80) return { level: 'Industry Ready', tier: 5, color: 'emerald' };
  if (fitScore >= 70) return { level: 'Near Ready', tier: 4, color: 'blue' };
  if (fitScore >= 60) return { level: 'Progressing Well', tier: 3, color: 'indigo' };
  if (fitScore >= 45) return { level: 'Building Foundation', tier: 2, color: 'amber' };
  return { level: 'Early Stage', tier: 1, color: 'red' };
};

const generateProfileSummary = (candidate, primary, secondary) => {
  const name = candidate.name || 'This candidate';
  const topSkills = (candidate.skills || []).slice(0, 3).join(', ');
  return `${name} demonstrates a strong fit as a **${primary.title}** (${primary.fitScore}% match) ` +
    `with a secondary affinity for **${secondary.title}** (${secondary.fitScore}%). ` +
    `Core competencies in ${topSkills} combined with ` +
    `${candidate.strengths?.[0]?.toLowerCase() || 'solid analytical skills'} ` +
    `make them well-positioned for roles requiring ${primary.tagline.toLowerCase()} qualities.`;
};

const generateGrowthPlan = (candidate, primary, secondary) => {
  const plan = [];

  // Skill gaps from primary role
  if (primary.missingSkills.length > 0) {
    plan.push({
      area: 'Skill Acquisition',
      priority: 'high',
      recommendation: `Learn ${primary.missingSkills.slice(0, 3).join(', ')} to strengthen your ${primary.title} profile.`,
      timeframe: '1-3 months',
    });
  }

  // Communication gap
  if ((candidate.scores?.communication || 0) < 70) {
    plan.push({
      area: 'Communication',
      priority: 'medium',
      recommendation: 'Practice technical presentations and written documentation. Join code review discussions actively.',
      timeframe: '2-4 months',
    });
  }

  // Secondary role cross-skilling
  if (secondary) {
    plan.push({
      area: 'Cross-Functional Growth',
      priority: 'medium',
      recommendation: `Explore ${secondary.title} skills to become a more versatile engineer. Focus on ${secondary.missingSkills.slice(0, 2).join(' and ') || 'broadening scope'}.`,
      timeframe: '3-6 months',
    });
  }

  // Improvements from analysis
  (candidate.improvements || []).slice(0, 2).forEach((imp) => {
    plan.push({
      area: 'Self-Improvement',
      priority: 'medium',
      recommendation: imp,
      timeframe: '1-3 months',
    });
  });

  // Generic high-level advice
  plan.push({
    area: 'Industry Readiness',
    priority: 'low',
    recommendation: `Build portfolio projects aligned with ${primary.industryFit?.[0] || 'target industry'} and contribute to open-source in your domain.`,
    timeframe: '3-6 months',
  });

  return plan;
};

/* ═══════════════════════════════════════════════════════
   SIMULATED CANDIDATES (reuse same pool as teams)
   ═══════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════
   DETERMINISTIC JOB-SEEDED VARIATION
   Uses jobId to create per-job score offsets so each job
   produces a different candidate ranking.
   ═══════════════════════════════════════════════════════ */
const hashCode = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

/**
 * Seeded pseudo-random (Mulberry32) — deterministic per seed.
 */
const seededRandom = (seed) => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Create job-specific variations of the simulated candidates.
 * Strategy:
 *  1. Normalize all candidates to a common baseline (75) so no one
 *     dominates by default.
 *  2. Apply a large deterministic per-job random offset (±18).
 *  3. Reward skill overlap with the job (+5 per matching skill, max +25).
 *  4. Penalize low skill overlap (-8 if zero match, -4 if only 1 match)
 *     so candidates irrelevant to the job drop significantly.
 */
const varySimulatedForJob = (jobId, jobSkills) => {
  const jobHash = hashCode(jobId.toString());
  const jobSkillSet = new Set((jobSkills || []).map((s) => s.toLowerCase().trim()));

  return SIMULATED_CANDIDATES.map((base, idx) => {
    // Unique seed per candidate-job pair
    const seed = jobHash * 31 + idx * 7;

    // Step 1: Normalize scores toward baseline 75 (shrink advantage of high-scorers)
    const normalize = (v) => Math.round(75 + (v - 75) * 0.4);

    const norm = {
      coding:         normalize(base.scores.coding),
      communication:  normalize(base.scores.communication),
      technicalDepth: normalize(base.scores.technicalDepth),
      problemSolving: normalize(base.scores.problemSolving),
      resume:         normalize(base.scores.resume),
    };

    // Step 2: Large deterministic offsets per dimension: -18 to +18
    const offsets = {
      coding:         Math.round(seededRandom(seed)       * 36 - 18),
      communication:  Math.round(seededRandom(seed + 1)   * 36 - 18),
      technicalDepth: Math.round(seededRandom(seed + 2)   * 36 - 18),
      problemSolving: Math.round(seededRandom(seed + 3)   * 36 - 18),
      resume:         Math.round(seededRandom(seed + 4)   * 36 - 18),
    };

    // Step 3: Skill overlap boost/penalty
    const candidateSkillsLower = (base.skills || []).map((s) => s.toLowerCase().trim());
    const skillOverlap = candidateSkillsLower.filter((s) => jobSkillSet.has(s)).length;
    const maxJobSkills = Math.max(jobSkillSet.size, 1);
    // +5 per match (capped at +25), but penalize if very low overlap
    const skillBoost = Math.min(skillOverlap * 5, 25);
    const skillPenalty = skillOverlap === 0 ? -10 : skillOverlap === 1 ? -5 : 0;
    const netSkillEffect = skillBoost + skillPenalty;

    // Step 4: Combine and clamp
    const cl = (v) => Math.max(30, Math.min(99, v));

    const newScores = {
      overall:        cl(norm.coding + offsets.coding + netSkillEffect),
      coding:         cl(norm.coding + offsets.coding + Math.round(netSkillEffect * 0.7)),
      communication:  cl(norm.communication + offsets.communication),
      technicalDepth: cl(norm.technicalDepth + offsets.technicalDepth + Math.round(netSkillEffect * 0.5)),
      problemSolving: cl(norm.problemSolving + offsets.problemSolving + Math.round(netSkillEffect * 0.3)),
      resume:         cl(norm.resume + offsets.resume),
    };

    return {
      ...base,
      userId: base.userId.toString(),
      scores: newScores,
      _simulated: true,
    };
  });
};

/* ═══════════════════════════════════════════════════════
   GATHER CANDIDATES (same pattern as team controller)
   ═══════════════════════════════════════════════════════ */
const gatherCandidates = async (jobId) => {
  const apps = await ApplicationProgress.find({ jobId, currentStage: 'final' }).lean();
  const job = await Job.findById(jobId).select('skills').lean();
  const jobSkills = job?.skills || [];

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

  if (enriched.length < 4) {
    return [...enriched, ...varySimulatedForJob(jobId, jobSkills)];
  }
  return enriched;
};

/* ═══════════════════════════════════════════════════════
   CONTROLLERS
   ═══════════════════════════════════════════════════════ */

/**
 * GET /rolefit/job/:jobId
 * HR: Get role-fit profiles for all final-round candidates in a job.
 */
exports.getRoleFitByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).select('title company skills').lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const candidates = await gatherCandidates(jobId);
    const profiles = candidates.map(buildRoleFitProfile);

    // Sort by primary fit score descending
    profiles.sort((a, b) => b.roleDNA.primaryRole.fitScore - a.roleDNA.primaryRole.fitScore);

    res.json({
      jobTitle: job.title,
      company: job.company,
      jobSkills: job.skills || [],
      candidates: profiles,
    });
  } catch (err) {
    console.error('getRoleFitByJob error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /rolefit/me/:jobId
 * Student: Get own role-fit profile for a specific job they applied to.
 */
exports.getMyRoleFit = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    const [app, profile, analysis, user, job] = await Promise.all([
      ApplicationProgress.findOne({ jobId, userId }).lean(),
      StudentProfile.findOne({ userId }).lean(),
      ExplanationAnalysis.findOne({ candidateId: userId, jobId }).lean(),
      User.findById(userId).select('name email').lean(),
      Job.findById(jobId).select('title company skills').lean(),
    ]);

    if (!app) return res.status(404).json({ message: 'No application found for this job' });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const ar = analysis?.analysisResult || {};
    const candidate = {
      userId,
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

    const roleFit = buildRoleFitProfile(candidate);

    res.json({
      jobTitle: job.title,
      company: job.company,
      jobSkills: job.skills || [],
      profile: roleFit,
    });
  } catch (err) {
    console.error('getMyRoleFit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /rolefit/archetypes
 * Public: Return all role archetypes for reference.
 */
exports.getArchetypes = async (req, res) => {
  res.json({ archetypes: ROLE_ARCHETYPES });
};
