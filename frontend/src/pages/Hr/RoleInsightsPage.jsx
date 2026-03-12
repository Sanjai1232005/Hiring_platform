import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, Loader2, Search, ChevronDown, ChevronRight,
  Star, Zap, Target, Code2, MessageSquare, Brain, FileText,
  Award, TrendingUp, Shield, ArrowUp, ArrowDown, Layers, Compass,
  MapPin, Clock, Sparkles, BarChart3, Eye,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

/* ─── Hex ring score indicator ─── */
const HexScore = ({ score, size = 72, label, color = '#6366f1' }) => {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-surface-300" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
          {Math.round(score)}
        </span>
      </div>
      {label && <p className="text-[9px] text-text-muted text-center uppercase tracking-wider">{label}</p>}
    </div>
  );
};

/* ─── Fit bar ─── */
const FitBar = ({ label, value, color = 'bg-primary', icon: Icon, maxVal = 100 }) => (
  <div className="flex items-center gap-3">
    {Icon && <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />}
    <span className="text-xs text-text-secondary w-28 shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-surface-300 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / maxVal) * 100}%` }}
        transition={{ duration: 0.6 }} className={`h-full rounded-full ${color}`} />
    </div>
    <span className="text-[10px] font-bold text-text-primary w-8 text-right">{Math.round(value)}</span>
  </div>
);

/* ─── Priority pill ─── */
const PriorityPill = ({ priority }) => {
  const map = {
    high: 'bg-red-400/10 text-red-400 border-red-400/20',
    medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    low: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${map[priority] || map.low}`}>
      {priority}
    </span>
  );
};

/* ─── Archetype card (compact) ─── */
const ArchetypeChip = ({ role, rank, expanded, onToggle }) => {
  const borderColor = rank === 0 ? 'border-primary/40 bg-primary/5' : rank === 1 ? 'border-accent/30 bg-accent/5' : 'border-border';
  const badge = rank === 0 ? 'Best Fit' : rank === 1 ? '2nd Fit' : '3rd Fit';
  const badgeVariant = rank === 0 ? 'primary' : rank === 1 ? 'success' : 'warning';

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${borderColor}`}>
      <button onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-200/30 transition-colors">
        <span className="text-xl">{role.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-text-primary">{role.title}</h4>
            <Badge variant={badgeVariant} dot>{badge}</Badge>
          </div>
          <p className="text-[10px] text-text-muted italic">{role.tagline}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{role.fitScore}%</p>
          <p className="text-[8px] text-text-muted uppercase">Fit</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <p className="text-xs text-text-secondary leading-relaxed">{role.description}</p>

              {/* Breakdown */}
              <div className="space-y-1.5">
                <FitBar label="Performance" value={role.breakdown.performanceScore} color="bg-indigo-400" icon={BarChart3} />
                <FitBar label="Skill Match" value={role.breakdown.skillMatch} color="bg-emerald-400" icon={Layers} />
                <FitBar label="Trait Alignment" value={role.breakdown.traitAlignment} color="bg-amber-400" icon={Compass} />
              </div>

              {/* Matched & missing skills */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5">Matched Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {role.matchedSkills.length > 0 ? role.matchedSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">{s}</span>
                    )) : <span className="text-[10px] text-text-muted">None</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5">Skills to Gain</p>
                  <div className="flex flex-wrap gap-1">
                    {role.missingSkills.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Career path */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Career Trajectory</p>
                <p className="text-[10px] text-text-secondary">{role.careerPath?.[0]}</p>
              </div>

              {/* Day in the life */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Day in the Life</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">{role.dailyLife}</p>
              </div>

              {/* Industry fit */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5">Industry Fit</p>
                <div className="flex flex-wrap gap-1">
                  {(role.industryFit || []).map((ind) => (
                    <span key={ind} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Candidate Role Card ─── */
const CandidateRoleCard = ({ profile, jobSkills }) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const dna = profile.roleDNA;
  const primary = dna.primaryRole;
  const readiness = dna.readinessLevel;

  const readinessColors = {
    emerald: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    indigo: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
    amber: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    red: 'bg-red-400/10 text-red-400 border-red-400/20',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface-100 border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-200/30 transition-colors">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/20 flex items-center justify-center text-base font-bold text-primary shrink-0">
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-text-primary">{profile.name}</h3>
            {profile._simulated && <Badge variant="warning">Simulated</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl">{primary.icon}</span>
            <span className="text-xs font-semibold text-primary">{primary.title}</span>
            <span className="text-[10px] text-text-muted">•</span>
            <span className="text-[10px] text-text-muted italic">{primary.tagline}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{primary.fitScore}%</p>
            <p className="text-[8px] text-text-muted uppercase">Role Fit</p>
          </div>
          <div className={`text-center px-2.5 py-1 rounded-lg border ${readinessColors[readiness.color]}`}>
            <p className="text-[10px] font-bold">{readiness.level}</p>
            <p className="text-[8px] uppercase">Readiness</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">

              {/* Profile summary */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Profile Summary
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {dna.profileSummary?.replace(/\*\*/g, '')}
                </p>
              </div>

              {/* Score dimensions */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3">Performance Dimensions</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <HexScore score={profile.scores?.coding || 0} label="Coding" color="#818cf8" />
                  <HexScore score={profile.scores?.communication || 0} label="Communication" color="#34d399" />
                  <HexScore score={profile.scores?.technicalDepth || 0} label="Tech Depth" color="#f59e0b" />
                  <HexScore score={profile.scores?.problemSolving || 0} label="Problem Solving" color="#f472b6" />
                  <HexScore score={profile.scores?.resume || 0} label="Resume" color="#22d3ee" />
                </div>
              </div>

              {/* Dominant traits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-400/5 border border-indigo-400/10 rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Dominant Trait</p>
                  <p className="text-sm font-bold text-indigo-400">{dna.dominantTrait}</p>
                </div>
                <div className="bg-pink-400/5 border border-pink-400/10 rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Secondary Trait</p>
                  <p className="text-sm font-bold text-pink-400">{dna.secondaryTrait}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.skills || []).map((s) => {
                    const isJobSkill = (jobSkills || []).some((js) => js.toLowerCase().trim() === s.toLowerCase().trim());
                    return (
                      <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        isJobSkill ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-200 text-text-muted border-border'
                      }`}>{s}</span>
                    );
                  })}
                </div>
              </div>

              {/* Top 3 role fits */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Role Recommendations</p>
                <div className="space-y-2">
                  {[dna.primaryRole, dna.secondaryRole, dna.tertiaryRole].filter(Boolean).map((role, i) => (
                    <ArchetypeChip key={role.archetype} role={role} rank={i}
                      expanded={expandedRole === role.archetype}
                      onToggle={() => setExpandedRole(expandedRole === role.archetype ? null : role.archetype)} />
                  ))}
                </div>
              </div>

              {/* Growth plan */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Personalized Growth Plan</p>
                <div className="space-y-2">
                  {(dna.growthPlan || []).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-200/50 border border-border rounded-xl px-4 py-3">
                      <div className="shrink-0 mt-0.5">
                        <PriorityPill priority={item.priority} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-semibold text-text-primary">{item.area}</p>
                          <span className="flex items-center gap-1 text-[9px] text-text-muted">
                            <Clock className="w-2.5 h-2.5" /> {item.timeframe}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">{item.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <ArrowUp className="w-3 h-3" /> Strengths
                  </h4>
                  <ul className="space-y-1">
                    {(profile.strengths || []).map((s, i) => (
                      <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-400/5 border border-red-400/10 rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-red-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <ArrowDown className="w-3 h-3" /> Areas to Improve
                  </h4>
                  <ul className="space-y-1">
                    {(profile.improvements || []).map((s, i) => (
                      <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const RoleInsightsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchJob, setSearchJob] = useState('');
  const [searchCandidate, setSearchCandidate] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  /* Fetch jobs */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.post(BASE_URL + '/hr/getjob', {}, { headers });
        setJobs(res.data?.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  /* Fetch role fits for selected job */
  useEffect(() => {
    if (!selectedJob) { setCandidates([]); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(BASE_URL + '/rolefit/job/' + selectedJob._id, { headers });
        setCandidates(res.data?.candidates || []);
        setJobSkills(res.data?.jobSkills || []);
        setJobTitle(res.data?.jobTitle || selectedJob.title || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedJob]);

  const filteredJobs = useMemo(() => {
    const q = searchJob.toLowerCase();
    return jobs.filter((j) =>
      !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
    );
  }, [jobs, searchJob]);

  const filteredCandidates = useMemo(() => {
    const q = searchCandidate.toLowerCase();
    return candidates.filter((c) =>
      !q || c.name?.toLowerCase().includes(q) ||
      c.roleDNA?.primaryRole?.title?.toLowerCase().includes(q)
    );
  }, [candidates, searchCandidate]);

  /* Aggregate stats */
  const stats = useMemo(() => {
    if (candidates.length === 0) return null;
    const roleDistribution = {};
    let totalFit = 0;
    candidates.forEach((c) => {
      const role = c.roleDNA?.primaryRole?.title || 'Unknown';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      totalFit += c.roleDNA?.primaryRole?.fitScore || 0;
    });
    return {
      total: candidates.length,
      avgFit: Math.round(totalFit / candidates.length),
      roleDistribution: Object.entries(roleDistribution).sort((a, b) => b[1] - a[1]),
      topCandidate: candidates[0],
    };
  }, [candidates]);

  if (loading && jobs.length === 0) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted py-20 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* ── Left: Job selector ── */}
          <div className="space-y-4">
            <div className="bg-surface-100 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
                  <Compass className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-primary">Role Insights</h1>
                  <p className="text-[10px] text-text-muted">AI-powered role recommendations</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input value={searchJob} onChange={(e) => setSearchJob(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-200 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors" />
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-1 custom-scrollbar">
                {filteredJobs.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No jobs found</p>
                ) : (
                  filteredJobs.map((job) => (
                    <button key={job._id} onClick={() => setSelectedJob(job)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs ${
                        selectedJob?._id === job._id
                          ? 'bg-primary/10 border border-primary/20 text-primary'
                          : 'hover:bg-surface-200 text-text-secondary border border-transparent'
                      }`}>
                      <p className="font-semibold truncate">{job.title}</p>
                      <p className="text-[10px] text-text-muted">{job.company}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Role insights ── */}
          <div className="space-y-5">
            {!selectedJob ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
                  <Compass className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">Select a Job</h2>
                <p className="text-sm text-text-muted max-w-xs">
                  Choose a job to see AI-powered role recommendations for each candidate.
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2 text-text-muted py-20 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing candidates...
              </div>
            ) : candidates.length === 0 ? (
              <EmptyState title="No candidates analyzed"
                description="No final-round candidates found for this job."
                icon={Users} />
            ) : (
              <>
                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{jobTitle}</h2>
                  <p className="text-sm text-text-muted">
                    Role DNA analysis for {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Aggregate stats */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-surface-100 border border-border rounded-xl p-3 text-center">
                      <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-text-primary">{stats.total}</p>
                      <p className="text-[9px] text-text-muted uppercase">Candidates</p>
                    </div>
                    <div className="bg-surface-100 border border-border rounded-xl p-3 text-center">
                      <Target className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-lg font-bold text-text-primary">{stats.avgFit}%</p>
                      <p className="text-[9px] text-text-muted uppercase">Avg Fit Score</p>
                    </div>
                    <div className="bg-surface-100 border border-border rounded-xl p-3 text-center">
                      <Layers className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-text-primary">{stats.roleDistribution.length}</p>
                      <p className="text-[9px] text-text-muted uppercase">Unique Roles</p>
                    </div>
                    <div className="bg-surface-100 border border-border rounded-xl p-3 text-center">
                      <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-text-primary truncate">{stats.topCandidate?.name}</p>
                      <p className="text-[9px] text-text-muted uppercase">Top Candidate</p>
                    </div>
                  </div>
                )}

                {/* Role distribution */}
                {stats && stats.roleDistribution.length > 1 && (
                  <div className="bg-surface-100 border border-border rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-primary" /> Role Distribution
                    </h3>
                    <div className="space-y-2">
                      {stats.roleDistribution.map(([role, count]) => (
                        <div key={role} className="flex items-center gap-3">
                          <span className="text-xs text-text-secondary w-44 truncate">{role}</span>
                          <div className="flex-1 h-2 bg-surface-300 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }}
                              animate={{ width: `${(count / stats.total) * 100}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full rounded-full bg-primary" />
                          </div>
                          <span className="text-[10px] font-bold text-text-primary w-6 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search candidates */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input value={searchCandidate} onChange={(e) => setSearchCandidate(e.target.value)}
                    placeholder="Search candidates or roles..."
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors" />
                </div>

                {/* Candidate cards */}
                <StaggerList className="space-y-3">
                  {filteredCandidates.map((profile) => (
                    <StaggerItem key={profile.candidateId}>
                      <CandidateRoleCard profile={profile} jobSkills={jobSkills} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default RoleInsightsPage;
