import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CheckCircle2, MessageCircle, Brain, Lightbulb, Shield,
  ChevronDown, FileText, Github, ExternalLink, Star,
  Eye, Zap, Activity, Loader2, Sparkles, BarChart3,
  AlertCircle, Clock,
} from 'lucide-react';
import ExplanationVideoPlayer from '../../components/ui/ExplanationVideoPlayer';
import Button from '../../components/ui/Button';

/* ─── Animated Score Ring ─── */
const ScoreRing = ({ score, size = 48, strokeWidth = 4, color = 'text-primary' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((score || 0) / 100, 1);

  const strokeColor = {
    'text-primary': '#6366f1',
    'text-accent': '#14b8a6',
    'text-cyan-400': '#22d3ee',
    'text-amber-400': '#fbbf24',
    'text-rose-400': '#fb7185',
    'text-violet-400': '#a78bfa',
    'text-emerald-400': '#34d399',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-surface-300" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={strokeColor[color] || '#6366f1'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${color}`}>{score ?? '—'}</span>
      </div>
    </div>
  );
};

/* ─── Score Bar ─── */
const ScoreBar = ({ label, score, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: { bar: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
    cyan: { bar: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    amber: { bar: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' },
    rose: { bar: 'bg-rose-400', text: 'text-rose-400', bg: 'bg-rose-400/10' },
    violet: { bar: 'bg-violet-400', text: 'text-violet-400', bg: 'bg-violet-400/10' },
    accent: { bar: 'bg-accent', text: 'text-accent', bg: 'bg-accent/10' },
    emerald: { bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
          {label}
        </span>
        <span className={`text-sm font-bold ${c.text}`}>{score ?? '—'}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${c.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score || 0, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/* ─── Proctoring Mini Stat ─── */
const ProcStat = ({ label, value, accent = 'text-primary' }) => (
  <div className="bg-surface-100 border border-border/50 rounded-lg p-3 text-center">
    <p className={`text-lg font-bold ${accent}`}>{value ?? '—'}</p>
    <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

const CandidateEvaluationCard = ({ candidate, onAnalyze, index = 0, analyzing = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'proctoring' | 'submissions'

  const ai = candidate.aiAnalysis || {};
  const proc = candidate.proctoring?.analysis || {};
  const hasAI = ai.overall_score != null;

  const overallScore = ai.overall_score || 0;
  const scoreColor = overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-primary' : overallScore >= 40 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = overallScore >= 80 ? 'bg-emerald-400/10 border-emerald-400/20' : overallScore >= 60 ? 'bg-primary/10 border-primary/20' : overallScore >= 40 ? 'bg-amber-400/10 border-amber-400/20' : 'bg-red-400/10 border-red-400/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-surface-100 border rounded-xl overflow-hidden transition-all ${
        expanded ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border hover:border-border-light'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-200/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {(candidate.candidateName || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0 text-left">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {candidate.candidateName}
            </h3>
            <p className="text-xs text-text-muted truncate">{candidate.candidateEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Quick score badges */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-lg">
              <CheckCircle2 className="w-3 h-3" /> Task: {candidate.taskCompletionScore ?? '—'}
            </span>
            {hasAI && (
              <span className={`flex items-center gap-1 text-[10px] font-bold ${scoreColor} ${scoreBg} border px-2 py-0.5 rounded-lg`}>
                <Activity className="w-3 h-3" /> AI: {ai.overall_score}
              </span>
            )}
            {!hasAI && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted bg-surface-200 border border-border px-2 py-0.5 rounded-lg">
                <Clock className="w-3 h-3" /> Not analyzed
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-5 space-y-5">
              {/* Analyze button if not yet analyzed */}
              {!hasAI && onAnalyze && (
                <div className="flex items-center gap-3 p-4 bg-violet-400/5 border border-violet-400/20 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">AI Analysis Available</p>
                    <p className="text-xs text-text-muted">Run AI to analyze this candidate's explanation & performance.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAnalyze(candidate.candidateId, candidate.assessmentId)}
                    loading={analyzing}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Analyze
                  </Button>
                </div>
              )}

              {/* Overall score hero (if analyzed) */}
              {hasAI && (
                <div className="flex items-center gap-5 p-4 bg-surface-200/40 border border-border/50 rounded-xl">
                  <ScoreRing score={ai.overall_score} size={64} strokeWidth={5} color={scoreColor} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-0.5">Overall Score</p>
                    <p className={`text-2xl font-bold ${scoreColor}`}>{ai.overall_score}<span className="text-sm font-normal text-text-muted">/100</span></p>
                    <p className="text-xs text-text-secondary mt-1">
                      {overallScore >= 80 ? 'Excellent candidate' : overallScore >= 60 ? 'Good performance' : overallScore >= 40 ? 'Average performance' : 'Needs improvement'}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" /> Task: {candidate.taskCompletionScore}
                    </span>
                  </div>
                </div>
              )}

              {/* Inner tabs */}
              {hasAI && (
                <div className="flex items-center gap-1 bg-surface-200/50 border border-border/50 rounded-xl p-1">
                  {[
                    { key: 'scores', label: 'Scores & Analysis', icon: BarChart3 },
                    { key: 'proctoring', label: 'Proctoring', icon: Shield },
                    { key: 'submissions', label: 'Submissions', icon: FileText },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeTab === t.key
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Scores Tab */}
              {(activeTab === 'scores' || !hasAI) && hasAI && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Score Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ScoreBar label="Task Completion" score={candidate.taskCompletionScore} icon={CheckCircle2} color="accent" />
                    <ScoreBar label="Communication" score={ai.communication_score} icon={MessageCircle} color="cyan" />
                    <ScoreBar label="Technical Depth" score={ai.technical_depth} icon={Brain} color="violet" />
                    <ScoreBar label="Problem Solving" score={ai.problem_solving} icon={Lightbulb} color="amber" />
                    <ScoreBar label="Confidence Level" score={ai.confidence_level} icon={Zap} color="rose" />
                    <ScoreBar label="Overall Score" score={ai.overall_score} icon={Activity} color="primary" />
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ai.strengths?.length > 0 && (
                      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5" /> Key Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {ai.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                              <CheckCircle2 className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {ai.areas_for_improvement?.length > 0 && (
                      <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                          <Lightbulb className="w-3.5 h-3.5" /> Areas to Improve
                        </h4>
                        <ul className="space-y-1.5">
                          {ai.areas_for_improvement.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Proctoring Tab */}
              {activeTab === 'proctoring' && hasAI && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <ProcStat label="Attention" value={proc.attentionScore} accent="text-primary" />
                    <ProcStat label="Face Detection" value={proc.faceDetectionRate ? Math.round(proc.faceDetectionRate * 100) + '%' : undefined} accent="text-accent" />
                    <ProcStat label="Tab Switches" value={proc.tabSwitchCount} accent="text-cyan-400" />
                    <ProcStat label="Environment" value={proc.environmentScore} accent="text-violet-400" />
                  </div>
                  {proc.overallVerdict && (
                    <div className="flex items-start gap-2 p-3 bg-surface-200/50 rounded-xl border border-border/50">
                      <Eye className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      <p className="text-xs text-text-secondary leading-relaxed">{proc.overallVerdict}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Submissions Tab */}
              {activeTab === 'submissions' && hasAI && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {/* Explanation Video */}
                  <ExplanationVideoPlayer videoUrl={candidate.explanation?.videoUrl} />

                  {/* Task Submissions */}
                  {candidate.submissions?.length > 0 ? (
                    <div className="space-y-2">
                      {candidate.submissions.map((sub, i) => (
                        <div
                          key={i}
                          className="bg-surface-200/50 border border-border/50 rounded-xl p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                                Task {sub.taskIndex + 1}
                              </span>
                              <span className="text-xs text-text-secondary font-medium">{sub.taskTitle}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sub.submissionFiles?.map((file, fi) => (
                              <a
                                key={fi}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 hover:bg-primary/10 transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                File {fi + 1}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                            {sub.githubLink && (
                              <a
                                href={sub.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-text-secondary bg-surface-300 border border-border rounded-lg px-3 py-2 hover:text-text-primary transition-colors"
                              >
                                <Github className="w-3 h-3" />
                                GitHub
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {(!sub.submissionFiles?.length && !sub.githubLink) && (
                              <span className="text-xs text-text-muted">No files submitted</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted text-center py-4">No task submissions found.</p>
                  )}
                </motion.div>
              )}

              {/* If not analyzed, still show proctoring + submissions inline */}
              {!hasAI && (
                <>
                  {/* Proctoring */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" /> Proctoring
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <ProcStat label="Attention" value={proc.attentionScore} accent="text-primary" />
                      <ProcStat label="Face Detection" value={proc.faceDetectionRate ? Math.round(proc.faceDetectionRate * 100) + '%' : undefined} accent="text-accent" />
                      <ProcStat label="Tab Switches" value={proc.tabSwitchCount} accent="text-cyan-400" />
                      <ProcStat label="Environment" value={proc.environmentScore} accent="text-violet-400" />
                    </div>
                  </div>

                  {/* Explanation Video */}
                  <ExplanationVideoPlayer videoUrl={candidate.explanation?.videoUrl} />

                  {/* Task Submissions */}
                  {candidate.submissions?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Task Submissions</p>
                      {candidate.submissions.map((sub, i) => (
                        <div key={i} className="bg-surface-200/50 border border-border/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                              Task {sub.taskIndex + 1}
                            </span>
                            <span className="text-xs text-text-secondary">{sub.taskTitle}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sub.submissionFiles?.map((file, fi) => (
                              <a key={fi} href={file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 hover:bg-primary/10 transition-colors">
                                <FileText className="w-3 h-3" /> File {fi + 1} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                            {sub.githubLink && (
                              <a href={sub.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-text-secondary bg-surface-300 border border-border rounded-lg px-3 py-2 hover:text-text-primary transition-colors">
                                <Github className="w-3 h-3" /> GitHub <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CandidateEvaluationCard;
