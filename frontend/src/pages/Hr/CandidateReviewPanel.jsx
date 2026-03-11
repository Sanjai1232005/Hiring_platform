import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, Loader2, CheckCircle, XCircle, Star,
  ChevronDown, ChevronUp, Shield, Brain, Eye,
  ClipboardList, Code2, FileText, ArrowRight, Trophy,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ─── tiny reusable progress bar ─── */
const ScoreBar = ({ label, value, max = 100, color = 'primary' }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colors = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    violet: 'bg-violet-400',
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-medium">{value ?? '—'}{max === 100 ? '%' : `/${max}`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-300 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color] || colors.primary} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ─── stage badge helper ─── */
const stageColor = (stage) => {
  const map = {
    applied: 'default',
    resume_screening: 'info',
    resume: 'info',
    coding_test: 'primary',
    coding: 'primary',
    task_assessment: 'warning',
    hr_review: 'info',
    interview: 'success',
    final: 'success',
    rejected: 'danger',
  };
  return map[stage] || 'default';
};

const stageLabel = (name) =>
  name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ─── rank badge colors ─── */
const rankStyle = (rank) => {
  if (rank === 1) return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
  if (rank === 2) return 'bg-slate-300/20 text-slate-300 border-slate-400/40';
  if (rank === 3) return 'bg-orange-400/20 text-orange-300 border-orange-400/40';
  return 'bg-surface-200 text-text-muted border-border';
};

/* ─── single candidate card ─── */
const CandidateCard = ({ c, onDecision, actionLoading }) => {
  const [open, setOpen] = useState(false);

  const ai = c.aiAnalysis || {};
  const proc = c.proctoring?.analysis || {};

  return (
    <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
      {/* collapsed header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-200/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* rank badge */}
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankStyle(c.rank)}`}>
            {c.rank <= 3 ? <Trophy className="w-3.5 h-3.5" /> : `#${c.rank}`}
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {(c.candidateName || '?')[0].toUpperCase()}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{c.candidateName}</p>
            <p className="text-xs text-text-muted truncate">{c.candidateEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* overall score pill */}
          {c.overallScore != null && (
            <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              {c.overallScore.toFixed(1)}%
            </span>
          )}
          <Badge variant={stageColor(c.currentStage)} dot>
            {stageLabel(c.currentStage)}
          </Badge>
          {c.isShortlisted && <Badge variant="success">Shortlisted</Badge>}
          {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>

      {/* expanded body */}
      {open && (
        <div className="border-t border-border px-5 py-5 space-y-5">
          {/* pipeline stages */}
          {c.pipelineStages?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Pipeline</p>
              <div className="flex flex-wrap items-center gap-1">
                {c.pipelineStages.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1">
                    <Badge variant={s.name === c.currentStage ? 'primary' : 'default'}>
                      {s.label}
                    </Badge>
                    {i < c.pipelineStages.length - 1 && <ArrowRight className="w-3 h-3 text-text-muted" />}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Overall Score Breakdown */}
          {c.overallScore != null && (
            <div className="bg-gradient-to-r from-primary/5 to-cyan-400/5 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Overall Ranking Score
                </div>
                <span className="text-lg font-bold text-primary">{c.overallScore.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { label: 'Resume', value: c.resumeScore, weight: '30%', color: 'text-accent' },
                  { label: 'Coding', value: c.codingScore, weight: '30%', color: 'text-primary' },
                  { label: 'Task', value: c.aiAnalysis?.overall_score, weight: '20%', color: 'text-amber-400' },
                  { label: 'Explanation', value: (() => { const a = c.aiAnalysis; const s = [a?.communication_score, a?.technical_depth, a?.confidence_level, a?.problem_solving].filter(Boolean); return s.length ? (s.reduce((x,y)=>x+y,0)/s.length).toFixed(0) : null; })(), weight: '10%', color: 'text-violet-400' },
                  { label: 'Proctoring', value: c.proctoring?.analysis?.attentionScore, weight: '10%', color: 'text-cyan-400' },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-100/80 rounded-md p-2 border border-border/30">
                    <p className="text-[10px] text-text-muted">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color}`}>{item.value != null ? item.value : '—'}</p>
                    <p className="text-[9px] text-text-muted">{item.weight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* score sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Resume */}
            <div className="bg-surface-200/50 rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" /> Resume
              </div>
              {c.resumeScore != null ? (
                <ScoreBar label="Resume Score" value={c.resumeScore} color="accent" />
              ) : (
                <p className="text-xs text-text-muted italic">Not scored</p>
              )}
            </div>

            {/* Coding */}
            <div className="bg-surface-200/50 rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5" /> Coding Test
              </div>
              {c.codingScore != null ? (
                <>
                  <ScoreBar label="Score" value={c.codingScore} color="primary" />
                  {c.codingTotal != null && (
                    <ScoreBar label="Correct" value={c.codingCorrect ?? 0} max={c.codingTotal} color="cyan" />
                  )}
                </>
              ) : (
                <p className="text-xs text-text-muted italic">{c.testCompleted ? 'Pending evaluation' : 'Not taken'}</p>
              )}
            </div>

            {/* Task Assessment */}
            <div className="bg-surface-200/50 rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <ClipboardList className="w-3.5 h-3.5" /> Task
              </div>
              {c.taskSubmission ? (
                <>
                  <p className="text-xs text-text-primary">
                    Submitted {c.taskSubmission.submissions?.length ?? 0} task(s)
                  </p>
                  <Badge variant={c.taskSubmission.completed ? 'success' : 'warning'} dot>
                    {c.taskSubmission.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </>
              ) : (
                <p className="text-xs text-text-muted italic">No submission</p>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-surface-200/50 rounded-lg p-4 space-y-3 border border-border/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" /> AI Analysis
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <ScoreBar label="Communication" value={ai.communication_score} color="primary" />
              <ScoreBar label="Technical Depth" value={ai.technical_depth} color="violet" />
              <ScoreBar label="Confidence" value={ai.confidence_level} color="amber" />
              <ScoreBar label="Problem Solving" value={ai.problem_solving} color="cyan" />
              <ScoreBar label="Overall" value={ai.overall_score} color="accent" />
            </div>
            {(ai.strengths?.length > 0 || ai.areas_for_improvement?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {ai.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-accent mb-1">Strengths</p>
                    <ul className="space-y-0.5">
                      {ai.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-1">
                          <span className="text-accent mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ai.areas_for_improvement?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-400 mb-1">Areas for Improvement</p>
                    <ul className="space-y-0.5">
                      {ai.areas_for_improvement.map((s, i) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-1">
                          <span className="text-amber-400 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proctoring */}
          <div className="bg-surface-200/50 rounded-lg p-4 space-y-3 border border-border/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" /> Proctoring
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ScoreBar label="Attention" value={proc.attentionScore} color="primary" />
              <ScoreBar label="Face Detection" value={Math.round((proc.faceDetectionRate ?? 0) * 100)} color="accent" />
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Tab Switches</p>
                <p className="text-sm font-semibold text-text-primary">{proc.tabSwitchCount ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Verdict</p>
                <Badge variant={proc.overallVerdict === 'Clear' ? 'success' : 'warning'} dot>
                  {proc.overallVerdict || '—'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          {c.currentStage !== 'rejected' && c.currentStage !== 'final' && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                variant="accent"
                icon={CheckCircle}
                loading={actionLoading === `approve-${c.candidateId}`}
                disabled={!!actionLoading}
                onClick={() => onDecision(c.candidateId, 'approve')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Star}
                loading={actionLoading === `shortlist-${c.candidateId}`}
                disabled={!!actionLoading}
                onClick={() => onDecision(c.candidateId, 'shortlist')}
              >
                Shortlist &amp; Advance
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={XCircle}
                loading={actionLoading === `reject-${c.candidateId}`}
                disabled={!!actionLoading}
                onClick={() => onDecision(c.candidateId, 'reject')}
              >
                Reject
              </Button>
            </div>
          )}

          {c.currentStage === 'rejected' && (
            <p className="text-xs text-red-400 flex items-center gap-1 pt-2 border-t border-border">
              <XCircle className="w-3.5 h-3.5" /> Candidate has been rejected
            </p>
          )}
          {c.currentStage === 'final' && (
            <p className="text-xs text-accent flex items-center gap-1 pt-2 border-t border-border">
              <CheckCircle className="w-3.5 h-3.5" /> Candidate reached final stage
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════ main page ═══════════════ */
const CandidateReviewPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  /* fetch jobs on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/job/getjobs`, { headers });
        setJobs(res.data.jobs || []);
      } catch {
        /* ignore */
      } finally {
        setLoadingJobs(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* fetch review data when job changes */
  const fetchReviewData = useCallback(async (jobId) => {
    if (!jobId) { setCandidates([]); return; }
    try {
      setLoadingData(true);
      const res = await axios.get(`${BASE_URL}/job/review-data/${jobId}`, { headers });
      setCandidates(res.data?.data?.candidates || []);
    } catch {
      setCandidates([]);
    } finally {
      setLoadingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchReviewData(selectedJobId); }, [selectedJobId, fetchReviewData]);

  /* handle approve / reject / shortlist */
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
      // refresh data
      await fetchReviewData(selectedJobId);
    } catch (err) {
      setToast({ type: 'danger', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  /* stats */
  const active = candidates.filter((c) => c.currentStage !== 'rejected');
  const shortlisted = candidates.filter((c) => c.isShortlisted);

  if (loadingJobs) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs…
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-accent/10 text-accent border-accent/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {toast.message}
          </div>
        )}

        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Candidate Review</h1>
            <p className="text-sm text-text-secondary">Evaluate candidates &amp; manage pipeline progression</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <EmptyState title="No jobs found" description="Create a job first." icon={Users} />
        ) : (
          <div className="space-y-5">
            {/* job selector */}
            <div className="bg-surface-100 border border-border rounded-xl p-5">
              <Select label="Select Job" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
                <option value="">Choose a job…</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.title} — {j.company}</option>
                ))}
              </Select>
            </div>

            {loadingData && (
              <div className="flex items-center gap-2 text-text-muted text-sm py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading candidates…
              </div>
            )}

            {selectedJobId && !loadingData && (
              <>
                {/* stats */}
                <div className="flex items-center gap-4 bg-surface-100 border border-border rounded-xl px-5 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-text-primary">{candidates.length}</span> Total
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="font-medium text-text-primary">{active.length}</span> Active
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-text-primary">{shortlisted.length}</span> Shortlisted
                  </div>
                </div>

                {/* candidate cards */}
                {candidates.length === 0 ? (
                  <EmptyState title="No candidates" description="No one has applied to this job yet." icon={Users} />
                ) : (
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <CandidateCard
                        key={c.candidateId}
                        c={c}
                        onDecision={handleDecision}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CandidateReviewPanel;
