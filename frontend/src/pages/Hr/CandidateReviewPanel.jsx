import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Loader2, CheckCircle, XCircle, Star,
  ChevronDown, ChevronUp, Shield, Brain, Eye,
  ClipboardList, Code2, FileText, ArrowRight, Trophy,
  Search, Briefcase, UserCheck, UserX, TrendingUp,
  BarChart3, Filter, Sparkles, AlertTriangle, Award,
  Target, Zap, MessageCircle, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ═══════════════ helpers ═══════════════ */
const stageColor = (stage) => {
  const map = {
    applied: 'default', resume_screening: 'info', resume: 'info',
    coding_test: 'primary', coding: 'primary', task_assessment: 'warning',
    hr_review: 'info', interview: 'success', final: 'success', rejected: 'danger',
  };
  return map[stage] || 'default';
};
const stageLabel = (name) =>
  (name || '').replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

const gradeFor = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', ring: 'stroke-emerald-400' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5', ring: 'stroke-blue-400' };
  if (score >= 40) return { label: 'Average', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', ring: 'stroke-amber-400' };
  return { label: 'Needs Work', color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', ring: 'stroke-red-400' };
};

const rankMedal = (rank) => {
  if (rank === 1) return { emoji: '🥇', bg: 'bg-amber-400/15 border-amber-400/30', text: 'text-amber-300' };
  if (rank === 2) return { emoji: '🥈', bg: 'bg-slate-300/15 border-slate-400/30', text: 'text-slate-300' };
  if (rank === 3) return { emoji: '🥉', bg: 'bg-orange-400/15 border-orange-400/30', text: 'text-orange-300' };
  return { emoji: null, bg: 'bg-surface-200 border-border', text: 'text-text-muted' };
};

/* ═══════════════ SVG Score Ring ═══════════════ */
const ScoreRing = ({ value, size = 72, strokeWidth = 5, className = '' }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value || 0, 0), 100);
  const grade = gradeFor(pct);
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
          className="stroke-surface-300" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
          strokeLinecap="round" className={grade.ring}
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${grade.color}`}>{pct.toFixed(0)}</span>
        <span className="text-[8px] text-text-muted uppercase">{grade.label}</span>
      </div>
    </div>
  );
};

/* ═══════════════ Animated Score Bar ═══════════════ */
const ScoreBar = ({ label, value, max = 100, color = 'bg-primary', icon: Icon }) => {
  const pct = max > 0 ? Math.min(((value ?? 0) / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3" />} {label}
        </span>
        <span className="text-text-primary font-semibold">
          {value != null ? value : '—'}{max === 100 ? '%' : `/${max}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/* ═══════════════ Stat Card ═══════════════ */
const StatCard = ({ icon: Icon, label, value, accent = 'text-primary', sub }) => (
  <motion.div className="bg-surface-100 border border-border rounded-xl p-4 flex items-center gap-3"
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.replace('text-', 'bg-').replace(/400|500/, '400/15')}`}>
      <Icon className={`w-5 h-5 ${accent}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
    </div>
  </motion.div>
);

/* ═══════════════ Pipeline Timeline ═══════════════ */
const PipelineTimeline = ({ stages, currentStage }) => (
  <div className="flex items-center gap-0 w-full overflow-x-auto py-1">
    {stages.map((s, i) => {
      const isCurrent = s.name === currentStage;
      const isPast = stages.findIndex((st) => st.name === currentStage) > i;
      return (
        <div key={s.name} className="flex items-center flex-shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
            isCurrent
              ? 'bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10'
              : isPast
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-surface-200 text-text-muted border-border'
          }`}>
            {isPast && <CheckCircle className="w-2.5 h-2.5" />}
            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            {s.label}
          </div>
          {i < stages.length - 1 && (
            <div className={`w-4 h-px mx-0.5 ${isPast ? 'bg-accent/40' : 'bg-border'}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ═══════════════ Score Breakdown Card ═══════════════ */
const BreakdownCard = ({ icon: Icon, title, color, children }) => (
  <div className="bg-surface-200/40 rounded-xl p-4 border border-border/50 space-y-3">
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace(/400|500/, '400/15')}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
    </div>
    {children}
  </div>
);

/* ═══════════════ Candidate Card ═══════════════ */
const CandidateCard = ({ c, onDecision, actionLoading, index = 0 }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('overview');

  const ai = c.aiAnalysis || {};
  const proc = c.proctoring?.analysis || {};
  const medal = rankMedal(c.rank);
  const grade = c.overallScore != null ? gradeFor(c.overallScore) : null;

  const explanationAvg = (() => {
    const s = [ai.communication_score, ai.technical_depth, ai.confidence_level, ai.problem_solving].filter(Boolean);
    return s.length ? (s.reduce((x, y) => x + y, 0) / s.length) : null;
  })();

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'ai', label: 'AI Analysis', icon: Brain },
    { key: 'proctoring', label: 'Proctoring', icon: Eye },
  ];

  return (
    <motion.div
      className="bg-surface-100 border border-border rounded-xl overflow-hidden group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      {/* ─── Header ─── */}
      <button type="button"
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-200/30 transition-all"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* rank */}
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 ${medal.bg} ${medal.text}`}>
            {medal.emoji ? <span className="text-base">{medal.emoji}</span> : `#${c.rank}`}
          </div>
          {/* avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border ${
            grade ? `bg-gradient-to-br ${grade.bg} ${grade.color} border-current/20` : 'bg-primary/15 text-primary border-primary/20'
          }`}>
            {(c.candidateName || '?')[0].toUpperCase()}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{c.candidateName}</p>
            <p className="text-[11px] text-text-muted truncate">{c.candidateEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* score mini ring */}
          {c.overallScore != null && (
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <div className="relative w-9 h-9">
                <svg width={36} height={36} className="-rotate-90">
                  <circle cx={18} cy={18} r={14} fill="none" strokeWidth={3} className="stroke-surface-300" />
                  <circle cx={18} cy={18} r={14} fill="none" strokeWidth={3} strokeLinecap="round"
                    className={grade?.ring || 'stroke-primary'}
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 - (2 * Math.PI * 14 * c.overallScore) / 100}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${grade?.color || 'text-primary'}`}>
                  {c.overallScore.toFixed(0)}
                </span>
              </div>
            </div>
          )}
          <Badge variant={stageColor(c.currentStage)} dot>{stageLabel(c.currentStage)}</Badge>
          {c.isShortlisted && <Badge variant="success">Shortlisted</Badge>}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </motion.div>
        </div>
      </button>

      {/* ─── Expanded ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-5 space-y-5">
              {/* ── Pipeline Timeline ── */}
              {c.pipelineStages?.length > 0 && (
                <PipelineTimeline stages={c.pipelineStages} currentStage={c.currentStage} />
              )}

              {/* ── Overall Score Hero ── */}
              {c.overallScore != null && (
                <div className={`bg-gradient-to-r ${grade.bg} rounded-xl p-5 border border-border/30`}>
                  <div className="flex items-center gap-5">
                    <ScoreRing value={c.overallScore} size={80} strokeWidth={6} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Overall Ranking Score</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: 'Resume', value: c.resumeScore, weight: '30%', color: 'text-accent', barColor: 'bg-accent' },
                          { label: 'Coding', value: c.codingScore, weight: '30%', color: 'text-primary', barColor: 'bg-primary' },
                          { label: 'Task', value: ai.overall_score, weight: '20%', color: 'text-amber-400', barColor: 'bg-amber-400' },
                          { label: 'Explain', value: explanationAvg != null ? +explanationAvg.toFixed(0) : null, weight: '10%', color: 'text-violet-400', barColor: 'bg-violet-400' },
                          { label: 'Proctor', value: proc.attentionScore, weight: '10%', color: 'text-cyan-400', barColor: 'bg-cyan-400' },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <p className={`text-base font-bold ${item.color}`}>{item.value != null ? item.value : '—'}</p>
                            <div className="h-1 rounded-full bg-surface-300 overflow-hidden my-1">
                              <div className={`h-full rounded-full ${item.barColor}`}
                                style={{ width: `${Math.min(item.value || 0, 100)}%` }} />
                            </div>
                            <p className="text-[9px] text-text-muted">{item.label}</p>
                            <p className="text-[8px] text-text-muted/60">{item.weight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab Navigation ── */}
              <div className="flex items-center gap-1 bg-surface-200/50 rounded-xl p-1 border border-border/50">
                {tabs.map((t) => (
                  <button key={t.key} type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      tab === t.key
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-100'
                    }`}
                    onClick={() => setTab(t.key)}
                  >
                    <t.icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                ))}
              </div>

              {/* ── Tab Content ── */}
              <AnimatePresence mode="wait">
                <motion.div key={tab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* OVERVIEW TAB */}
                  {tab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <BreakdownCard icon={FileText} title="Resume" color="text-accent">
                        {c.resumeScore != null ? (
                          <ScoreBar label="Resume Score" value={c.resumeScore} color="bg-accent" />
                        ) : (
                          <p className="text-xs text-text-muted italic">Not scored</p>
                        )}
                      </BreakdownCard>

                      <BreakdownCard icon={Code2} title="Coding Test" color="text-primary">
                        {c.codingScore != null ? (
                          <div className="space-y-2">
                            <ScoreBar label="Score" value={c.codingScore} color="bg-primary" />
                            {c.codingTotal != null && (
                              <ScoreBar label="Correct" value={c.codingCorrect ?? 0} max={c.codingTotal} color="bg-cyan-400" />
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted italic">{c.testCompleted ? 'Pending evaluation' : 'Not taken'}</p>
                        )}
                      </BreakdownCard>

                      <BreakdownCard icon={ClipboardList} title="Task" color="text-amber-400">
                        {c.taskSubmission ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-secondary">Submitted</span>
                              <span className="text-sm font-bold text-text-primary">{c.taskSubmission.submissions?.length ?? 0} task(s)</span>
                            </div>
                            <Badge variant={c.taskSubmission.completed ? 'success' : 'warning'} dot>
                              {c.taskSubmission.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted italic">No submission</p>
                        )}
                      </BreakdownCard>
                    </div>
                  )}

                  {/* AI ANALYSIS TAB */}
                  {tab === 'ai' && (
                    <div className="space-y-4">
                      {ai.overall_score != null ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                              { label: 'Communication', value: ai.communication_score, icon: MessageCircle, color: 'bg-primary' },
                              { label: 'Technical Depth', value: ai.technical_depth, icon: Code2, color: 'bg-violet-400' },
                              { label: 'Confidence', value: ai.confidence_level, icon: Zap, color: 'bg-amber-400' },
                              { label: 'Problem Solving', value: ai.problem_solving, icon: Target, color: 'bg-cyan-400' },
                              { label: 'Overall', value: ai.overall_score, icon: Award, color: 'bg-accent' },
                            ].map((item) => (
                              <div key={item.label} className="bg-surface-200/40 rounded-xl p-3 border border-border/50 space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <item.icon className="w-3 h-3 text-text-muted" />
                                  <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.label}</span>
                                </div>
                                <div className="flex items-end gap-1">
                                  <span className="text-xl font-bold text-text-primary">{item.value ?? '—'}</span>
                                  {item.value != null && <span className="text-[10px] text-text-muted mb-0.5">/100</span>}
                                </div>
                                <div className="h-1.5 rounded-full bg-surface-300 overflow-hidden">
                                  <motion.div className={`h-full rounded-full ${item.color}`}
                                    initial={{ width: 0 }} animate={{ width: `${item.value || 0}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {(ai.strengths?.length > 0 || ai.areas_for_improvement?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {ai.strengths?.length > 0 && (
                                <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <ThumbsUp className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Strengths</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {ai.strengths.map((s, i) => (
                                      <motion.li key={i}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-xs text-text-secondary flex items-start gap-2"
                                      >
                                        <CheckCircle className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" /> {s}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {ai.areas_for_improvement?.length > 0 && (
                                <div className="bg-amber-400/5 rounded-xl p-4 border border-amber-400/10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <ThumbsDown className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Areas for Improvement</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {ai.areas_for_improvement.map((s, i) => (
                                      <motion.li key={i}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-xs text-text-secondary flex items-start gap-2"
                                      >
                                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" /> {s}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-10 h-10 text-text-muted/30 mx-auto mb-2" />
                          <p className="text-sm text-text-muted">AI analysis not available yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROCTORING TAB */}
                  {tab === 'proctoring' && (
                    <div className="space-y-4">
                      {proc.attentionScore != null ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: 'Attention Score', value: proc.attentionScore, suffix: '%', icon: Eye, color: 'text-primary' },
                              { label: 'Face Detection', value: `${Math.round((proc.faceDetectionRate ?? 0) * 100)}%`, icon: Users, color: 'text-accent' },
                              { label: 'Tab Switches', value: proc.tabSwitchCount ?? 0, icon: AlertTriangle, color: proc.tabSwitchCount > 5 ? 'text-red-400' : 'text-amber-400' },
                              { label: 'Verdict', value: proc.overallVerdict || '—', icon: Shield, color: proc.overallVerdict === 'Clear' ? 'text-emerald-400' : 'text-red-400' },
                            ].map((item) => (
                              <div key={item.label} className="bg-surface-200/40 rounded-xl p-4 border border-border/50 text-center">
                                <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
                                <p className="text-lg font-bold text-text-primary">{item.value}{item.suffix || ''}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{item.label}</p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <ScoreBar label="Attention Score" value={proc.attentionScore} color="bg-primary" icon={Eye} />
                            <ScoreBar label="Face Detection Rate" value={Math.round((proc.faceDetectionRate ?? 0) * 100)} color="bg-accent" icon={Users} />
                          </div>
                          {proc.environmentScore != null && (
                            <ScoreBar label="Environment Score" value={proc.environmentScore} color="bg-cyan-400" icon={Shield} />
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Eye className="w-10 h-10 text-text-muted/30 mx-auto mb-2" />
                          <p className="text-sm text-text-muted">No proctoring data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* ── Action Buttons ── */}
              {c.currentStage !== 'rejected' && c.currentStage !== 'final' && (
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Button size="sm" variant="accent" icon={CheckCircle}
                    loading={actionLoading === `approve-${c.candidateId}`}
                    disabled={!!actionLoading}
                    onClick={() => onDecision(c.candidateId, 'approve')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="primary" icon={Star}
                    loading={actionLoading === `shortlist-${c.candidateId}`}
                    disabled={!!actionLoading}
                    onClick={() => onDecision(c.candidateId, 'shortlist')}>
                    Shortlist &amp; Advance
                  </Button>
                  <div className="flex-1" />
                  <Button size="sm" variant="danger" icon={XCircle}
                    loading={actionLoading === `reject-${c.candidateId}`}
                    disabled={!!actionLoading}
                    onClick={() => onDecision(c.candidateId, 'reject')}>
                    Reject
                  </Button>
                </div>
              )}

              {c.currentStage === 'rejected' && (
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/15">
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Candidate has been rejected</span>
                  </div>
                </div>
              )}
              {c.currentStage === 'final' && (
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/15">
                    <CheckCircle className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-accent font-medium">Candidate reached final stage</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════ Score Distribution Mini Chart ═══════════════ */
const ScoreDistribution = ({ candidates }) => {
  const buckets = [
    { label: '80+', color: 'bg-emerald-400', range: [80, 101] },
    { label: '60-79', color: 'bg-blue-400', range: [60, 80] },
    { label: '40-59', color: 'bg-amber-400', range: [40, 60] },
    { label: '<40', color: 'bg-red-400', range: [0, 40] },
  ];
  const scored = candidates.filter((c) => c.overallScore != null);
  const total = scored.length || 1;
  return (
    <div className="bg-surface-100 border border-border rounded-xl p-4">
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <BarChart3 className="w-3 h-3" /> Score Distribution
      </p>
      <div className="space-y-2">
        {buckets.map((b) => {
          const count = scored.filter((c) => c.overallScore >= b.range[0] && c.overallScore < b.range[1]).length;
          const pct = (count / total) * 100;
          return (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted w-8 text-right">{b.label}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-300 overflow-hidden">
                <motion.div className={`h-full rounded-full ${b.color}`}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }} />
              </div>
              <span className="text-[10px] text-text-secondary font-medium w-4 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════ MAIN PAGE ═══════════════ */
const CandidateReviewPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [jobSearch, setJobSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [sortBy, setSortBy] = useState('rank');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/job/getjobs`, { headers });
        setJobs(res.data.jobs || []);
      } catch { /* ignore */ }
      finally { setLoadingJobs(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReviewData = useCallback(async (jobId) => {
    if (!jobId) { setCandidates([]); return; }
    try {
      setLoadingData(true);
      const res = await axios.get(`${BASE_URL}/job/review-data/${jobId}`, { headers });
      setCandidates(res.data?.data?.candidates || []);
    } catch { setCandidates([]); }
    finally { setLoadingData(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchReviewData(selectedJobId); }, [selectedJobId, fetchReviewData]);

  const handleDecision = async (candidateId, decision) => {
    setActionLoading(`${decision}-${candidateId}`);
    try {
      const res = await axios.post(
        `${BASE_URL}/job/review`,
        { candidateId, jobId: selectedJobId, decision },
        { headers },
      );
      const d = res.data.data;
      setToast({
        type: decision === 'reject' ? 'danger' : 'success',
        message: `${decision === 'approve' ? 'Approved' : decision === 'reject' ? 'Rejected' : 'Shortlisted'} — moved to ${stageLabel(d.newStage)}`,
      });
      await fetchReviewData(selectedJobId);
    } catch (err) {
      setToast({ type: 'danger', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  /* derived */
  const filteredJobs = useMemo(
    () => jobs.filter((j) => `${j.title} ${j.company}`.toLowerCase().includes(jobSearch.toLowerCase())),
    [jobs, jobSearch],
  );

  const active = candidates.filter((c) => c.currentStage !== 'rejected');
  const shortlisted = candidates.filter((c) => c.isShortlisted);
  const rejected = candidates.filter((c) => c.currentStage === 'rejected');
  const avgScore = (() => {
    const scored = candidates.filter((c) => c.overallScore != null);
    return scored.length ? (scored.reduce((s, c) => s + c.overallScore, 0) / scored.length).toFixed(1) : '—';
  })();

  const processed = useMemo(() => {
    let list = [...candidates];
    if (filterTab === 'active') list = list.filter((c) => c.currentStage !== 'rejected');
    else if (filterTab === 'shortlisted') list = list.filter((c) => c.isShortlisted);
    else if (filterTab === 'rejected') list = list.filter((c) => c.currentStage === 'rejected');
    if (candidateSearch) {
      const q = candidateSearch.toLowerCase();
      list = list.filter((c) => `${c.candidateName} ${c.candidateEmail}`.toLowerCase().includes(q));
    }
    if (sortBy === 'rank') list.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    else if (sortBy === 'score') list.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
    else if (sortBy === 'name') list.sort((a, b) => (a.candidateName || '').localeCompare(b.candidateName || ''));
    return list;
  }, [candidates, filterTab, candidateSearch, sortBy]);

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  if (loadingJobs) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs…
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-accent/15 text-accent border-accent/25'
                : 'bg-red-500/15 text-red-400 border-red-500/25'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6 min-h-[calc(100vh-6rem)]">
        {/* ══════ LEFT SIDEBAR ══════ */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">Review Panel</h1>
              <p className="text-[11px] text-text-muted">Evaluate &amp; decide</p>
            </div>
          </div>

          {/* Job search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input type="text" placeholder="Search jobs…" value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Job list */}
          <div className="space-y-1.5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 scrollbar-thin">
            {filteredJobs.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No jobs found</p>
            ) : (
              filteredJobs.map((j) => (
                <button key={j._id} type="button"
                  onClick={() => setSelectedJobId(j._id)}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition-all group ${
                    j._id === selectedJobId
                      ? 'bg-primary/10 border-primary/25 shadow-sm shadow-primary/5'
                      : 'bg-surface-100 border-border hover:border-primary/20 hover:bg-surface-200/50'
                  }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      j._id === selectedJobId ? 'bg-primary/20' : 'bg-surface-200'
                    }`}>
                      <Briefcase className={`w-3.5 h-3.5 ${j._id === selectedJobId ? 'text-primary' : 'text-text-muted'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${j._id === selectedJobId ? 'text-primary' : 'text-text-primary'}`}>
                        {j.title}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">{j.company}</p>
                    </div>
                    {j._id === selectedJobId && <ArrowRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Score Distribution (if job selected) */}
          {selectedJobId && !loadingData && candidates.length > 0 && (
            <ScoreDistribution candidates={candidates} />
          )}
        </div>

        {/* ══════ MAIN CONTENT ══════ */}
        <div className="flex-1 min-w-0 space-y-5">
          {!selectedJobId ? (
            <div className="flex items-center justify-center h-full">
              <EmptyState icon={Shield} title="Select a job"
                description="Choose a job from the sidebar to review candidates" />
            </div>
          ) : loadingData ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Job title banner */}
              {selectedJob && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-surface-100 border border-border rounded-xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">{selectedJob.title}</p>
                      <p className="text-[11px] text-text-muted">{selectedJob.company}</p>
                    </div>
                  </div>
                  <Badge variant="primary">{candidates.length} Candidates</Badge>
                </motion.div>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                <StatCard icon={Users} label="Total" value={candidates.length} accent="text-primary" />
                <StatCard icon={UserCheck} label="Active" value={active.length} accent="text-accent" />
                <StatCard icon={Star} label="Shortlisted" value={shortlisted.length} accent="text-amber-400" />
                <StatCard icon={TrendingUp} label="Avg Score" value={avgScore} accent="text-cyan-400" />
              </div>

              {/* Search + Filter + Sort */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input type="text" placeholder="Search candidates…" value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-0.5 bg-surface-100 border border-border rounded-xl p-0.5">
                  {[
                    { key: 'all', label: 'All', count: candidates.length },
                    { key: 'active', label: 'Active', count: active.length },
                    { key: 'shortlisted', label: 'Shortlisted', count: shortlisted.length },
                    { key: 'rejected', label: 'Rejected', count: rejected.length },
                  ].map((f) => (
                    <button key={f.key} type="button"
                      onClick={() => setFilterTab(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterTab === f.key
                          ? 'bg-primary/15 text-primary'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}>
                      {f.label} <span className="ml-1 opacity-60">{f.count}</span>
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-100 border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50">
                  <option value="rank">Sort: Rank</option>
                  <option value="score">Sort: Score</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>

              {/* Candidate List */}
              {processed.length === 0 ? (
                <EmptyState icon={Users} title="No candidates"
                  description={candidateSearch || filterTab !== 'all' ? 'No matches found. Try adjusting filters.' : 'No one has applied to this job yet.'} />
              ) : (
                <div className="space-y-3">
                  {processed.map((c, i) => (
                    <CandidateCard key={c.candidateId} c={c}
                      onDecision={handleDecision} actionLoading={actionLoading} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CandidateReviewPanel;
