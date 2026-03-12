import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Loader2, ChevronDown, ChevronRight, Star, Zap, Target,
  Code2, MessageSquare, Brain, FileText, Award, TrendingUp, Shield,
  ArrowUp, ArrowDown, Layers, Compass, Clock, Sparkles, BarChart3,
  MapPin, Eye, Rocket, Heart,
} from 'lucide-react';
import API from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

/* ─── Animated ring indicator ─── */
const ScoreRing = ({ score, size = 80, label, color = '#6366f1', thickness = 5 }) => {
  const r = size / 2 - thickness - 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={thickness} className="text-surface-300" />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
            strokeLinecap="round" initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - score / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }} strokeDasharray={circ} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-text-primary">
          {Math.round(score)}
        </span>
      </div>
      {label && <p className="text-[10px] text-text-muted text-center font-medium">{label}</p>}
    </div>
  );
};

/* ─── FitBar ─── */
const FitBar = ({ label, value, color = 'bg-primary', icon: Icon }) => (
  <div className="flex items-center gap-3">
    {Icon && <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />}
    <span className="text-xs text-text-secondary w-28 shrink-0">{label}</span>
    <div className="flex-1 h-2.5 bg-surface-300 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`} />
    </div>
    <span className="text-xs font-bold text-text-primary w-8 text-right">{Math.round(value)}</span>
  </div>
);

/* ─── Priority badge ─── */
const PriorityBadge = ({ priority }) => {
  const cls = {
    high: 'bg-red-400/10 text-red-400 border-red-400/20',
    medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    low: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${cls[priority] || cls.low}`}>
      {priority}
    </span>
  );
};

/* ─── Role detail expandable card ─── */
const RoleDetailCard = ({ role, rank, expanded, onToggle }) => {
  const ringColor = rank === 0 ? '#6366f1' : rank === 1 ? '#34d399' : '#f59e0b';
  const borderCls = rank === 0 ? 'border-primary/40 bg-primary/5' : rank === 1 ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-amber-400/20 bg-amber-400/5';
  const badge = rank === 0 ? 'Best Fit' : rank === 1 ? '2nd Fit' : '3rd Fit';
  const badgeVariant = rank === 0 ? 'primary' : rank === 1 ? 'success' : 'warning';

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${borderCls}`}>
      <button onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-200/20 transition-colors">
        <span className="text-2xl">{role.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-text-primary">{role.title}</h3>
            <Badge variant={badgeVariant} dot>{badge}</Badge>
          </div>
          <p className="text-[11px] text-text-muted italic mt-0.5">{role.tagline}</p>
        </div>
        <ScoreRing score={role.fitScore} size={52} color={ringColor} thickness={3} />
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {/* Description */}
              <p className="text-xs text-text-secondary leading-relaxed">{role.description}</p>

              {/* Score breakdown */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-wider text-text-muted">How we calculated this</p>
                <FitBar label="Your Performance" value={role.breakdown.performanceScore} color="bg-indigo-400" icon={BarChart3} />
                <FitBar label="Skill Match" value={role.breakdown.skillMatch} color="bg-emerald-400" icon={Layers} />
                <FitBar label="Trait Alignment" value={role.breakdown.traitAlignment} color="bg-amber-400" icon={Compass} />
              </div>

              {/* Skills match */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-2">Your Matching Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.matchedSkills.length > 0 ? role.matchedSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">{s}</span>
                    )) : <span className="text-[10px] text-text-muted">None yet — a great opportunity to learn!</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-2">Skills to Develop</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.missingSkills.slice(0, 5).map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Career path */}
              <div className="bg-surface-200/50 border border-border rounded-xl p-4">
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                  <Rocket className="w-3 h-3" /> Career Trajectory
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">{role.careerPath?.[0]}</p>
              </div>

              {/* Day in the life */}
              <div className="bg-surface-200/50 border border-border rounded-xl p-4">
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> A Day in the Life
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">{role.dailyLife}</p>
              </div>

              {/* Industry fit */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-muted mb-2">Industries That Need This Role</p>
                <div className="flex flex-wrap gap-1.5">
                  {(role.industryFit || []).map((ind) => (
                    <span key={ind} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                      <MapPin className="w-2.5 h-2.5 inline mr-1" />{ind}
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

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const MyRoleDNA = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobSkills, setJobSkills] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  /* Fetch applied jobs */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(API + '/job/my-applications-stages', { headers });
        const apps = Array.isArray(res.data) ? res.data : (res.data?.applications || []);
        // Only jobs where student has progressed beyond resume
        const qualified = apps.filter((a) =>
          ['coding_test', 'coding', 'task_assessment', 'hr_review', 'interview', 'final'].includes(a.currentStage)
        );
        setJobs(qualified);
        if (qualified.length > 0) setSelectedJob(qualified[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  /* Fetch role fit for selected job */
  useEffect(() => {
    if (!selectedJob) { setProfile(null); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API + '/rolefit/me/' + (selectedJob.jobId || selectedJob._id), { headers });
        setProfile(res.data?.profile || null);
        setJobSkills(res.data?.jobSkills || []);
        setJobTitle(res.data?.jobTitle || '');
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedJob]);

  const dna = profile?.roleDNA;
  const primary = dna?.primaryRole;
  const readiness = dna?.readinessLevel;

  const readinessColors = {
    emerald: { border: 'border-emerald-400/30', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
    blue: { border: 'border-blue-400/30', bg: 'bg-blue-400/10', text: 'text-blue-400' },
    indigo: { border: 'border-indigo-400/30', bg: 'bg-indigo-400/10', text: 'text-indigo-400' },
    amber: { border: 'border-amber-400/30', bg: 'bg-amber-400/10', text: 'text-amber-400' },
    red: { border: 'border-red-400/30', bg: 'bg-red-400/10', text: 'text-red-400' },
  };
  const rc = readinessColors[readiness?.color] || readinessColors.indigo;

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
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">My Role DNA</h1>
            <p className="text-xs text-text-muted">Discover your ideal role based on your assessment performance</p>
          </div>
        </div>

        {/* Job selector (horizontal pills) */}
        {jobs.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {jobs.map((j) => (
              <button key={j._id || j.jobId} onClick={() => setSelectedJob(j)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  (selectedJob?._id || selectedJob?.jobId) === (j._id || j.jobId)
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface-100 border-border text-text-secondary hover:border-primary/20'
                }`}>
                <Briefcase className="w-3 h-3 inline mr-1.5" />
                {j.jobTitle || j.title || 'Job'}
              </button>
            ))}
          </div>
        )}

        {jobs.length === 0 ? (
          <EmptyState title="No assessments yet"
            description="Complete assessments in your applied jobs to unlock your Role DNA analysis."
            icon={Compass} />
        ) : loading ? (
          <div className="flex items-center gap-2 text-text-muted py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Analyzing your profile...
          </div>
        ) : !profile ? (
          <EmptyState title="Role DNA not available"
            description="We need your assessment data to generate role recommendations. Complete tasks and interviews first."
            icon={Compass} />
        ) : (
          <>
            {/* Hero card: Primary role recommendation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface-100 to-accent/5 border border-primary/20 rounded-3xl p-6">
              {/* Decorative */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/5 blur-3xl" />

              <div className="relative space-y-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-primary font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Your Ideal Role
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <span className="text-5xl">{primary?.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-text-primary">{primary?.title}</h2>
                    <p className="text-sm text-text-muted italic mt-0.5">{primary?.tagline}</p>
                    <p className="text-xs text-text-secondary leading-relaxed mt-2">{primary?.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ScoreRing score={primary?.fitScore || 0} size={90} color="#6366f1" thickness={5} label="Fit Score" />
                    <div className={`text-center px-4 py-3 rounded-xl border ${rc.border} ${rc.bg}`}>
                      <p className={`text-lg font-bold ${rc.text}`}>{readiness?.tier}</p>
                      <p className="text-[9px] text-text-muted uppercase">{readiness?.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Summary */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-primary flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI Profile Summary
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {dna?.profileSummary?.replace(/\*\*/g, '')}
              </p>
            </div>

            {/* Performance dimensions */}
            <div className="bg-surface-100 border border-border rounded-2xl p-5">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-4">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Your Performance Profile
              </h3>
              <div className="flex justify-center gap-5 flex-wrap">
                <ScoreRing score={profile.scores?.coding || 0} size={72} label="Coding" color="#818cf8" />
                <ScoreRing score={profile.scores?.communication || 0} size={72} label="Communication" color="#34d399" />
                <ScoreRing score={profile.scores?.technicalDepth || 0} size={72} label="Tech Depth" color="#f59e0b" />
                <ScoreRing score={profile.scores?.problemSolving || 0} size={72} label="Problem Solving" color="#f472b6" />
                <ScoreRing score={profile.scores?.resume || 0} size={72} label="Resume" color="#22d3ee" />
              </div>

              {/* Dominant traits */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-indigo-400/5 border border-indigo-400/10 rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Your Superpower</p>
                  <p className="text-sm font-bold text-indigo-400">{dna?.dominantTrait}</p>
                </div>
                <div className="bg-pink-400/5 border border-pink-400/10 rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1">Secondary Strength</p>
                  <p className="text-sm font-bold text-pink-400">{dna?.secondaryTrait}</p>
                </div>
              </div>
            </div>

            {/* Your skills */}
            <div className="bg-surface-100 border border-border rounded-2xl p-5">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-3">
                <Layers className="w-3.5 h-3.5 text-primary" /> Your Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map((s) => {
                  const isJobSkill = (jobSkills || []).some((js) => js.toLowerCase().trim() === s.toLowerCase().trim());
                  return (
                    <span key={s} className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${
                      isJobSkill ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-200 text-text-muted border-border'
                    }`}>{s}</span>
                  );
                })}
              </div>
            </div>

            {/* All 3 role recommendations (expanded cards) */}
            <div>
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-3">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Your Top Role Matches
              </h3>
              <div className="space-y-3">
                {[dna?.primaryRole, dna?.secondaryRole, dna?.tertiaryRole].filter(Boolean).map((role, i) => (
                  <RoleDetailCard key={role.archetype} role={role} rank={i}
                    expanded={expandedRole === role.archetype}
                    onToggle={() => setExpandedRole(expandedRole === role.archetype ? null : role.archetype)} />
                ))}
              </div>
            </div>

            {/* Personalized growth plan */}
            <div className="bg-surface-100 border border-border rounded-2xl p-5">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Your Growth Roadmap
              </h3>
              <div className="space-y-3">
                {(dna?.growthPlan || []).map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 bg-surface-200/50 border border-border rounded-xl px-4 py-3">
                    <div className="shrink-0 mt-0.5">
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-text-primary">{item.area}</p>
                        <span className="flex items-center gap-1 text-[9px] text-text-muted">
                          <Clock className="w-2.5 h-2.5" /> {item.timeframe}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{item.recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths & improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-2xl p-5">
                <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-2 mb-3">
                  <ArrowUp className="w-3.5 h-3.5" /> Your Strengths
                </h4>
                <ul className="space-y-2">
                  {(profile.strengths || []).map((s, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <Star className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-5">
                <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5" /> Areas to Level Up
                </h4>
                <ul className="space-y-2">
                  {(profile.improvements || []).map((s, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default MyRoleDNA;
