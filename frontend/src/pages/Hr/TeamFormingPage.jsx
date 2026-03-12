import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, Search, Loader2, Shuffle, ChevronDown,
  ChevronRight, Star, Code2, MessageSquare, Brain, FileText,
  Target, Sparkles, Shield, Zap, Award, TrendingUp, Minus, Plus,
  Trash2, Edit3, Check, X, AlertCircle, UserPlus, BarChart3,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

/* ─── Score ring SVG ─── */
const ScoreRing = ({ value, size = 48, stroke = 4, label, accent = '#6366f1' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * (value || 0)) / 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          strokeWidth={stroke} className="text-surface-300" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className="text-[10px] text-text-muted">{label}</span>
      <span className="text-xs font-bold text-text-primary">{Math.round(value || 0)}</span>
    </div>
  );
};

/* ─── Skill pill ─── */
const SkillPill = ({ skill, count, highlight }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
    highlight
      ? 'bg-primary/10 text-primary border-primary/20'
      : 'bg-surface-200 text-text-muted border-border'
  }`}>
    {skill}
    {count > 1 && <span className="bg-primary/20 text-primary rounded-full px-1 text-[9px] font-bold">{count}</span>}
  </span>
);

/* ─── Radar-like metric bar ─── */
const MetricBar = ({ label, value, icon: Icon, color = 'bg-primary' }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
    <span className="text-xs text-text-secondary w-24 shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-surface-300 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value || 0}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
    <span className="text-xs font-bold text-text-primary w-8 text-right">{Math.round(value || 0)}</span>
  </div>
);

/* ─── Member card ─── */
const MemberCard = ({ member, rank, jobSkills }) => {
  const [expanded, setExpanded] = useState(false);
  const jobSkillsLower = useMemo(() => (jobSkills || []).map((s) => s.toLowerCase().trim()), [jobSkills]);

  return (
    <motion.div
      layout
      className="bg-surface-100 border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-200/50 transition-colors"
      >
        {/* Rank */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          rank === 0 ? 'bg-amber-400/20 text-amber-400' :
          rank === 1 ? 'bg-slate-300/20 text-slate-300' :
          rank === 2 ? 'bg-amber-600/20 text-amber-600' :
          'bg-surface-300 text-text-muted'
        }`}>
          {rank + 1}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {member.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary truncate">{member.name}</p>
          <p className="text-[10px] text-text-muted">{member.role || 'Team Member'}</p>
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-primary">{Math.round(member.scores?.overall || 0)}</p>
          <p className="text-[9px] text-text-muted">Score</p>
        </div>

        <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {/* Score rings */}
              <div className="flex justify-around">
                <ScoreRing value={member.scores?.coding} size={42} label="Code" accent="#818cf8" />
                <ScoreRing value={member.scores?.communication} size={42} label="Comm" accent="#34d399" />
                <ScoreRing value={member.scores?.technicalDepth} size={42} label="Tech" accent="#f59e0b" />
                <ScoreRing value={member.scores?.problemSolving} size={42} label="PS" accent="#f472b6" />
              </div>

              {/* Skills */}
              {member.skills?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((s) => (
                      <SkillPill key={s} skill={s} highlight={jobSkillsLower.includes(s.toLowerCase().trim())} />
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {member.strengths?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1">Strengths</p>
                  <ul className="space-y-0.5">
                    {member.strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Team card ─── */
const TeamCard = ({ team, jobSkills, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const pm = team.performanceMetrics || {};
  const sortedMembers = useMemo(
    () => [...(team.members || [])].sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0)),
    [team.members]
  );
  const skillEntries = useMemo(() => {
    const map = team.skillCoverage instanceof Map ? Object.fromEntries(team.skillCoverage) : (team.skillCoverage || {});
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [team.skillCoverage]);
  const jobSkillsLower = useMemo(() => (jobSkills || []).map((s) => s.toLowerCase().trim()), [jobSkills]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-100 border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-200/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-text-primary">{team.name}</h3>
            <Badge variant="primary" dot>{team.members?.length || 0} members</Badge>
          </div>
          <p className="text-xs text-text-muted truncate">{team.description}</p>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{Math.round(team.teamScore || 0)}</p>
            <p className="text-[9px] text-text-muted uppercase">Team Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-accent">{team.skillDiversity || 0}%</p>
            <p className="text-[9px] text-text-muted uppercase">Skill Coverage</p>
          </div>
        </div>

        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {/* Performance metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <MetricBar label="Coding" value={pm.avgCoding} icon={Code2} color="bg-indigo-400" />
                <MetricBar label="Communication" value={pm.avgCommunication} icon={MessageSquare} color="bg-emerald-400" />
                <MetricBar label="Technical Depth" value={pm.avgTechnicalDepth} icon={Brain} color="bg-amber-400" />
                <MetricBar label="Problem Solving" value={pm.avgProblemSolving} icon={Target} color="bg-pink-400" />
                <MetricBar label="Resume" value={pm.avgResume} icon={FileText} color="bg-cyan-400" />
              </div>

              {/* Skill coverage */}
              {skillEntries.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Skill Coverage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillEntries.map(([skill, count]) => (
                      <SkillPill key={skill} skill={skill} count={count} highlight={jobSkillsLower.includes(skill)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Team Members</p>
                <div className="space-y-2">
                  {sortedMembers.map((m, i) => (
                    <MemberCard key={m.userId || i} member={m} rank={i} jobSkills={jobSkills} />
                  ))}
                </div>
              </div>

              {/* Delete */}
              <div className="flex justify-end">
                <button
                  onClick={() => onDelete(team._id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Team
                </button>
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
const TeamFormingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [forming, setForming] = useState(false);
  const [teamSize, setTeamSize] = useState(4);
  const [searchJob, setSearchJob] = useState('');
  const [view, setView] = useState('teams'); // teams | candidates

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

  /* Fetch candidates + teams for selected job */
  useEffect(() => {
    if (!selectedJob) { setCandidates([]); setTeams([]); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const [candRes, teamRes] = await Promise.all([
          axios.get(BASE_URL + '/teams/candidates/' + selectedJob._id, { headers }),
          axios.get(BASE_URL + '/teams/job/' + selectedJob._id, { headers }),
        ]);
        setCandidates(candRes.data?.candidates || []);
        setJobSkills(candRes.data?.jobSkills || []);
        setJobTitle(candRes.data?.jobTitle || selectedJob.title || '');
        setTeams(teamRes.data?.teams || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedJob]);

  /* Auto-form teams */
  const handleAutoForm = async () => {
    if (!selectedJob) return;
    setForming(true);
    try {
      const res = await axios.post(BASE_URL + '/teams/auto-form', {
        jobId: selectedJob._id,
        teamSize,
      }, { headers });
      setTeams(res.data?.teams || []);
      setView('teams');
    } catch (err) {
      console.error(err);
    } finally {
      setForming(false);
    }
  };

  /* Delete team */
  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(BASE_URL + '/teams/' + teamId, { headers });
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
    } catch (err) {
      console.error(err);
    }
  };

  /* Filtered jobs */
  const filteredJobs = useMemo(() => {
    const q = searchJob.toLowerCase();
    return jobs.filter((j) =>
      !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
    );
  }, [jobs, searchJob]);

  /* Stats */
  const totalMembers = teams.reduce((s, t) => s + (t.members?.length || 0), 0);
  const avgScore = teams.length > 0
    ? Math.round(teams.reduce((s, t) => s + (t.teamScore || 0), 0) / teams.length)
    : 0;
  const avgDiversity = teams.length > 0
    ? Math.round(teams.reduce((s, t) => s + (t.skillDiversity || 0), 0) / teams.length)
    : 0;

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
                  <Users className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-primary">Team Forming</h1>
                  <p className="text-[10px] text-text-muted">Skill-based team assignment</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  value={searchJob}
                  onChange={(e) => setSearchJob(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-200 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Job list */}
              <div className="max-h-[60vh] overflow-y-auto space-y-1 custom-scrollbar">
                {filteredJobs.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No jobs found</p>
                ) : (
                  filteredJobs.map((job) => (
                    <button
                      key={job._id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs ${
                        selectedJob?._id === job._id
                          ? 'bg-primary/10 border border-primary/20 text-primary'
                          : 'hover:bg-surface-200 text-text-secondary border border-transparent'
                      }`}
                    >
                      <p className="font-semibold truncate">{job.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                        <span>{job.company}</span>
                        <span>&middot;</span>
                        <span>{job.openPositions || 1} positions</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Main content ── */}
          <div className="space-y-5">
            {!selectedJob ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">Select a Job</h2>
                <p className="text-sm text-text-muted max-w-xs">
                  Choose a job from the sidebar to view final-round candidates and form skill-based teams.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-surface-100 border border-border rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{jobTitle}</h2>
                      <p className="text-sm text-text-muted mt-0.5">
                        {candidates.length} final-round candidate{candidates.length !== 1 ? 's' : ''} &middot; {teams.length} team{teams.length !== 1 ? 's' : ''} formed
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Team size stepper */}
                      <div className="flex items-center gap-1 bg-surface-200 border border-border rounded-xl px-2 py-1">
                        <button onClick={() => setTeamSize(Math.max(2, teamSize - 1))}
                          className="w-6 h-6 rounded-lg hover:bg-surface-300 flex items-center justify-center text-text-muted">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-text-primary w-4 text-center">{teamSize}</span>
                        <button onClick={() => setTeamSize(Math.min(8, teamSize + 1))}
                          className="w-6 h-6 rounded-lg hover:bg-surface-300 flex items-center justify-center text-text-muted">
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-text-muted ml-1">per team</span>
                      </div>

                      <Button onClick={handleAutoForm} disabled={forming || candidates.length < 2}>
                        {forming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
                        {forming ? 'Forming...' : 'Auto-Form Teams'}
                      </Button>
                    </div>
                  </div>

                  {/* Required skills row */}
                  {jobSkills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {jobSkills.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                            <Target className="w-2.5 h-2.5" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {teams.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Teams', value: teams.length, icon: Users, accent: 'text-primary' },
                      { label: 'Members', value: totalMembers, icon: UserPlus, accent: 'text-cyan-400' },
                      { label: 'Avg Score', value: avgScore, icon: TrendingUp, accent: 'text-amber-400' },
                      { label: 'Avg Coverage', value: avgDiversity + '%', icon: BarChart3, accent: 'text-emerald-400' },
                    ].map((s) => (
                      <div key={s.label} className="bg-surface-100 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.accent}`}
                          style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
                          <s.icon className={`w-4 h-4 ${s.accent}`} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-text-primary">{s.value}</p>
                          <p className="text-[9px] text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View toggle */}
                <div className="flex items-center gap-2">
                  {[
                    { key: 'teams', label: 'Teams', icon: Users },
                    { key: 'candidates', label: 'Candidates', icon: UserPlus },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setView(v.key)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                        view === v.key
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface-100 text-text-muted border border-border hover:text-text-secondary'
                      }`}
                    >
                      <v.icon className="w-3.5 h-3.5" /> {v.label}
                    </button>
                  ))}
                </div>

                {/* Content area */}
                {loading ? (
                  <div className="flex items-center gap-2 text-text-muted py-12 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading data...
                  </div>
                ) : view === 'teams' ? (
                  teams.length === 0 ? (
                    <EmptyState
                      title="No teams formed yet"
                      description={
                        candidates.length < 2
                          ? 'Need at least 2 final-round candidates to form teams.'
                          : 'Click "Auto-Form Teams" to create skill-balanced teams.'
                      }
                      icon={Users}
                    />
                  ) : (
                    <StaggerList className="space-y-4">
                      {teams.map((team) => (
                        <StaggerItem key={team._id}>
                          <TeamCard team={team} jobSkills={jobSkills} onDelete={handleDeleteTeam} />
                        </StaggerItem>
                      ))}
                    </StaggerList>
                  )
                ) : (
                  /* Candidates view */
                  candidates.length === 0 ? (
                    <EmptyState
                      title="No final-round candidates"
                      description="Candidates must reach the 'final' stage to be eligible for team forming."
                      icon={AlertCircle}
                    />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-text-muted">{candidates.length} candidates at final round</p>
                      <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[...candidates]
                          .sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0))
                          .map((c, i) => (
                          <StaggerItem key={c.userId}>
                            <motion.div className="bg-surface-100 border border-border rounded-xl p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                  i === 0 ? 'bg-amber-400/20 text-amber-400' :
                                  i === 1 ? 'bg-slate-300/20 text-slate-300' :
                                  i === 2 ? 'bg-amber-600/20 text-amber-600' :
                                  'bg-surface-300 text-text-muted'
                                }`}>
                                  {i + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-text-primary truncate">{c.name}</p>
                                  <p className="text-[10px] text-text-muted">{c.email}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">{Math.round(c.scores?.overall || 0)}</p>
                                  <p className="text-[9px] text-text-muted">Overall</p>
                                </div>
                              </div>

                              {/* Mini scores */}
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { label: 'Code', val: c.scores?.coding, color: '#818cf8' },
                                  { label: 'Comm', val: c.scores?.communication, color: '#34d399' },
                                  { label: 'Tech', val: c.scores?.technicalDepth, color: '#f59e0b' },
                                  { label: 'PS', val: c.scores?.problemSolving, color: '#f472b6' },
                                ].map((d) => (
                                  <div key={d.label} className="text-center">
                                    <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden mb-1">
                                      <div className="h-full rounded-full" style={{ width: `${d.val || 0}%`, backgroundColor: d.color }} />
                                    </div>
                                    <p className="text-[9px] text-text-muted">{d.label}</p>
                                    <p className="text-[10px] font-bold text-text-primary">{Math.round(d.val || 0)}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Skills */}
                              {c.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {c.skills.slice(0, 8).map((s) => (
                                    <SkillPill key={s} skill={s}
                                      highlight={jobSkills.map((sk) => sk.toLowerCase().trim()).includes(s.toLowerCase().trim())}
                                    />
                                  ))}
                                  {c.skills.length > 8 && (
                                    <span className="text-[10px] text-text-muted">+{c.skills.length - 8} more</span>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          </StaggerItem>
                        ))}
                      </StaggerList>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TeamFormingPage;
