import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, Loader2, TrendingUp, Award, Target,
  Code2, MessageSquare, Brain, FileText, Search, BarChart3,
  ChevronDown, ChevronRight, Shield, Zap, Star, ArrowUp,
  ArrowDown, Minus as MinusIcon,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

/* ─── Pentagon / radar chart ─── */
const RadarChart = ({ data, size = 200 }) => {
  const center = size / 2;
  const r = size / 2 - 20;
  const dims = [
    { key: 'coding', label: 'Coding', color: '#818cf8' },
    { key: 'communication', label: 'Comm.', color: '#34d399' },
    { key: 'technicalDepth', label: 'Tech', color: '#f59e0b' },
    { key: 'problemSolving', label: 'P.Solv', color: '#f472b6' },
    { key: 'resume', label: 'Resume', color: '#22d3ee' },
  ];
  const n = dims.length;
  const angle = (2 * Math.PI) / n;

  const pointAt = (i, pct) => ({
    x: center + r * (pct / 100) * Math.sin(i * angle),
    y: center - r * (pct / 100) * Math.cos(i * angle),
  });

  // Grid rings
  const rings = [20, 40, 60, 80, 100];
  const gridPaths = rings.map((pct) => {
    const pts = dims.map((_, i) => pointAt(i, pct));
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  // Data polygon
  const dataPoints = dims.map((d, i) => pointAt(i, data[d.key] || 0));
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Axis labels
  const labelPts = dims.map((_, i) => pointAt(i, 115));

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid */}
      {gridPaths.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="currentColor"
          strokeWidth={0.5} className="text-border" />
      ))}
      {/* Axes */}
      {dims.map((_, i) => {
        const p = pointAt(i, 100);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y}
          stroke="currentColor" strokeWidth={0.5} className="text-border" />;
      })}
      {/* Data */}
      <polygon points={dataPoly} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={2} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={dims[i].color} />
      ))}
      {/* Labels */}
      {dims.map((d, i) => (
        <text key={d.key} x={labelPts[i].x} y={labelPts[i].y}
          textAnchor="middle" dominantBaseline="middle"
          className="text-[9px] fill-text-muted font-medium">
          {d.label}
        </text>
      ))}
    </svg>
  );
};

/* ─── Comparison bar ─── */
const CompareBar = ({ label, values, colors, icon: Icon }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="space-y-1">
        {values.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] text-text-muted w-14 truncate">Team {String.fromCharCode(65 + i)}</span>
            <div className="flex-1 h-2 bg-surface-300 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(val / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
            </div>
            <span className="text-[10px] font-bold text-text-primary w-6 text-right">{Math.round(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Industry readiness score breakdown ─── */
const ReadinessGauge = ({ score, label }) => {
  const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Developing' : 'Needs Work';
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-blue-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';
  const bg = score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-blue-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="bg-surface-100 border border-border rounded-xl p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">{label}</p>
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg width={64} height={64} className="-rotate-90">
          <circle cx={32} cy={32} r={28} fill="none" stroke="currentColor" strokeWidth={4} className="text-surface-300" />
          <circle cx={32} cy={32} r={28} fill="none" stroke="currentColor" strokeWidth={4}
            className={color}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 28}
            strokeDashoffset={2 * Math.PI * 28 * (1 - score / 100)}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
          {Math.round(score)}
        </span>
      </div>
      <Badge variant={score >= 60 ? 'success' : score >= 40 ? 'warning' : 'danger'}>{level}</Badge>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const TeamPerformancePage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [teams, setTeams] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchJob, setSearchJob] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

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

  useEffect(() => {
    if (!selectedJob) { setTeams([]); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(BASE_URL + '/teams/job/' + selectedJob._id, { headers });
        setTeams(res.data?.teams || []);
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

  // Compute industry readiness per team
  const teamsWithReadiness = useMemo(() => {
    return teams.map((t) => {
      const pm = t.performanceMetrics || {};
      const memberCount = t.members?.length || 1;

      // Technical readiness: avg of coding + tech depth
      const technical = ((pm.avgCoding || 0) + (pm.avgTechnicalDepth || 0)) / 2;
      // Collaboration: communication score
      const collaboration = pm.avgCommunication || 0;
      // Problem solving
      const problemSolving = pm.avgProblemSolving || 0;
      // Skill coverage
      const skillCoverage = t.skillDiversity || 0;
      // Overall readiness
      const readiness = Math.round(
        technical * 0.30 + collaboration * 0.25 + problemSolving * 0.25 + skillCoverage * 0.20
      );

      return {
        ...t,
        readiness: {
          overall: readiness,
          technical: Math.round(technical),
          collaboration: Math.round(collaboration),
          problemSolving: Math.round(problemSolving),
          skillCoverage: Math.round(skillCoverage),
        },
      };
    });
  }, [teams]);

  // Find best & weakest team
  const bestTeam = useMemo(
    () => teamsWithReadiness.reduce((best, t) => (!best || t.readiness.overall > best.readiness.overall ? t : best), null),
    [teamsWithReadiness]
  );
  const weakTeam = useMemo(
    () => teamsWithReadiness.reduce((weak, t) => (!weak || t.readiness.overall < weak.readiness.overall ? t : weak), null),
    [teamsWithReadiness]
  );

  const TEAM_COLORS = ['#6366f1', '#34d399', '#f59e0b', '#f472b6', '#22d3ee', '#a78bfa', '#fb923c', '#4ade80'];

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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20 flex items-center justify-center">
                  <BarChart3 className="w-4.5 h-4.5 text-accent" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-primary">Team Performance</h1>
                  <p className="text-[10px] text-text-muted">Industry readiness analysis</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  value={searchJob}
                  onChange={(e) => setSearchJob(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-200 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

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
                          ? 'bg-accent/10 border border-accent/20 text-accent'
                          : 'hover:bg-surface-200 text-text-secondary border border-transparent'
                      }`}
                    >
                      <p className="font-semibold truncate">{job.title}</p>
                      <p className="text-[10px] text-text-muted">{job.company}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Performance analysis ── */}
          <div className="space-y-5">
            {!selectedJob ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">Select a Job</h2>
                <p className="text-sm text-text-muted max-w-xs">
                  Choose a job to analyze team performance and industry readiness.
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2 text-text-muted py-20 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading teams...
              </div>
            ) : teamsWithReadiness.length === 0 ? (
              <EmptyState
                title="No teams formed"
                description="Form teams first in the Team Forming page before analyzing performance."
                icon={Users}
              />
            ) : (
              <>
                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{jobTitle}</h2>
                  <p className="text-sm text-text-muted">
                    {teamsWithReadiness.length} team{teamsWithReadiness.length !== 1 ? 's' : ''} analyzed for industry readiness
                  </p>
                </div>

                {/* Industry readiness overview */}
                <div className="bg-surface-100 border border-border rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Industry Readiness Overview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {teamsWithReadiness.map((t) => (
                      <div key={t._id} className="text-center">
                        <p className="text-xs font-semibold text-text-secondary mb-2">{t.name}</p>
                        <div className="relative w-14 h-14 mx-auto">
                          <svg width={56} height={56} className="-rotate-90">
                            <circle cx={28} cy={28} r={24} fill="none" stroke="currentColor" strokeWidth={4} className="text-surface-300" />
                            <circle cx={28} cy={28} r={24} fill="none" strokeWidth={4} strokeLinecap="round"
                              stroke={t.readiness.overall >= 70 ? '#34d399' : t.readiness.overall >= 50 ? '#f59e0b' : '#ef4444'}
                              strokeDasharray={2 * Math.PI * 24}
                              strokeDashoffset={2 * Math.PI * 24 * (1 - t.readiness.overall / 100)}
                              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
                            {t.readiness.overall}
                          </span>
                        </div>
                        <p className="text-[9px] text-text-muted mt-1">
                          {t.readiness.overall >= 70 ? 'Ready' : t.readiness.overall >= 50 ? 'Progressing' : 'Developing'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparison chart */}
                {teamsWithReadiness.length > 1 && (
                  <div className="bg-surface-100 border border-border rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Cross-Team Comparison
                    </h3>
                    <div className="space-y-4">
                      <CompareBar
                        label="Coding" icon={Code2}
                        values={teamsWithReadiness.map((t) => t.performanceMetrics?.avgCoding || 0)}
                        colors={TEAM_COLORS}
                      />
                      <CompareBar
                        label="Communication" icon={MessageSquare}
                        values={teamsWithReadiness.map((t) => t.performanceMetrics?.avgCommunication || 0)}
                        colors={TEAM_COLORS}
                      />
                      <CompareBar
                        label="Technical Depth" icon={Brain}
                        values={teamsWithReadiness.map((t) => t.performanceMetrics?.avgTechnicalDepth || 0)}
                        colors={TEAM_COLORS}
                      />
                      <CompareBar
                        label="Problem Solving" icon={Target}
                        values={teamsWithReadiness.map((t) => t.performanceMetrics?.avgProblemSolving || 0)}
                        colors={TEAM_COLORS}
                      />
                      <CompareBar
                        label="Skill Coverage" icon={Shield}
                        values={teamsWithReadiness.map((t) => t.skillDiversity || 0)}
                        colors={TEAM_COLORS}
                      />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
                      {teamsWithReadiness.map((t, i) => (
                        <div key={t._id} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAM_COLORS[i % TEAM_COLORS.length] }} />
                          <span className="text-[10px] text-text-muted">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-team deep analysis */}
                <StaggerList className="space-y-4">
                  {teamsWithReadiness.map((t) => (
                    <StaggerItem key={t._id}>
                      <TeamDeepAnalysis team={t} jobSkills={jobSkills} />
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

/* ─── Per-team deep analysis card ─── */
const TeamDeepAnalysis = ({ team, jobSkills }) => {
  const [expanded, setExpanded] = useState(false);
  const pm = team.performanceMetrics || {};
  const rd = team.readiness || {};

  const radarData = {
    coding: pm.avgCoding || 0,
    communication: pm.avgCommunication || 0,
    technicalDepth: pm.avgTechnicalDepth || 0,
    problemSolving: pm.avgProblemSolving || 0,
    resume: pm.avgResume || 0,
  };

  // Determine strengths & weaknesses
  const dims = [
    { key: 'coding', label: 'Coding', val: pm.avgCoding || 0 },
    { key: 'communication', label: 'Communication', val: pm.avgCommunication || 0 },
    { key: 'technicalDepth', label: 'Technical Depth', val: pm.avgTechnicalDepth || 0 },
    { key: 'problemSolving', label: 'Problem Solving', val: pm.avgProblemSolving || 0 },
    { key: 'resume', label: 'Resume Quality', val: pm.avgResume || 0 },
  ].sort((a, b) => b.val - a.val);

  const teamStrengths = dims.filter((d) => d.val >= 60).slice(0, 3);
  const teamWeaknesses = dims.filter((d) => d.val < 60).sort((a, b) => a.val - b.val).slice(0, 3);

  // Skill gap analysis
  const coveredSkills = new Set(Object.keys(
    team.skillCoverage instanceof Map ? Object.fromEntries(team.skillCoverage) : (team.skillCoverage || {})
  ));
  const missingSkills = (jobSkills || []).filter((s) => !coveredSkills.has(s.toLowerCase().trim()));

  // Recommendations
  const recommendations = [];
  if (teamWeaknesses.length > 0) {
    recommendations.push(`Focus on improving ${teamWeaknesses.map((w) => w.label).join(', ')} through targeted training.`);
  }
  if (missingSkills.length > 0) {
    recommendations.push(`Skill gap detected: consider upskilling in ${missingSkills.join(', ')}.`);
  }
  if (rd.collaboration < 60) {
    recommendations.push('Collaboration score is low — introduce pair programming and code reviews.');
  }
  if (rd.overall >= 70) {
    recommendations.push('Team shows strong industry readiness. Consider assigning complex, real-world projects.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Team is performing well across all dimensions.');
  }

  return (
    <div className="bg-surface-100 border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-200/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary">{team.name}</h3>
          <p className="text-xs text-text-muted">{team.members?.length} members &middot; Score: {Math.round(team.teamScore || 0)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-center px-3 py-1 rounded-lg ${
            rd.overall >= 70 ? 'bg-emerald-400/10 text-emerald-400' :
            rd.overall >= 50 ? 'bg-amber-400/10 text-amber-400' :
            'bg-red-400/10 text-red-400'
          }`}>
            <p className="text-lg font-bold">{rd.overall}</p>
            <p className="text-[9px] uppercase">Readiness</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Radar chart */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-text-secondary mb-2">Performance Radar</p>
              <RadarChart data={radarData} size={180} />
            </div>

            {/* Readiness breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <ReadinessGauge score={rd.technical || 0} label="Technical" />
              <ReadinessGauge score={rd.collaboration || 0} label="Collaboration" />
              <ReadinessGauge score={rd.problemSolving || 0} label="Problem Solving" />
              <ReadinessGauge score={rd.skillCoverage || 0} label="Skill Coverage" />
            </div>
          </div>

          {/* Strengths & weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                <ArrowUp className="w-3.5 h-3.5" /> Team Strengths
              </h4>
              {teamStrengths.length > 0 ? (
                <ul className="space-y-1.5">
                  {teamStrengths.map((s) => (
                    <li key={s.key} className="text-xs text-text-secondary flex items-center justify-between">
                      <span>{s.label}</span>
                      <span className="text-xs font-bold text-emerald-400">{Math.round(s.val)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-muted">No strengths above threshold yet.</p>
              )}
            </div>

            <div className="bg-red-400/5 border border-red-400/10 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mb-2">
                <ArrowDown className="w-3.5 h-3.5" /> Areas for Improvement
              </h4>
              {teamWeaknesses.length > 0 ? (
                <ul className="space-y-1.5">
                  {teamWeaknesses.map((w) => (
                    <li key={w.key} className="text-xs text-text-secondary flex items-center justify-between">
                      <span>{w.label}</span>
                      <span className="text-xs font-bold text-red-400">{Math.round(w.val)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-muted">All metrics are above threshold!</p>
              )}
            </div>
          </div>

          {/* Skill gap */}
          {missingSkills.length > 0 && (
            <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5" /> Missing Job Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
              <Star className="w-3.5 h-3.5" /> Recommendations for Industry Readiness
            </h4>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Members list */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Members</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(team.members || []).map((m, i) => (
                <div key={m.userId || i} className="flex items-center gap-3 bg-surface-200/50 border border-border rounded-xl px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">{m.name}</p>
                    <p className="text-[10px] text-text-muted">{m.role}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{Math.round(m.scores?.overall || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformancePage;
