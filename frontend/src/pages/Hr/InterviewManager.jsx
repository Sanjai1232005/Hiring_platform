import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Loader2, CalendarPlus, Video, CheckCircle, XCircle,
  ChevronDown, MessageSquare, Calendar, Clock, Search,
  Filter, ArrowRight, ExternalLink, User, Briefcase,
  AlertCircle, Sparkles, Shield, BarChart3,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

const ROUND_TYPES = [
  { value: 'technical', label: 'Technical', icon: '🔧', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'system_design', label: 'System Design', icon: '🏗️', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  { value: 'behavioral', label: 'Behavioral', icon: '🤝', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  { value: 'final', label: 'Final', icon: '🎯', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
];

const ROUND_COLOR_MAP = {
  technical: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  system_design: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  behavioral: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  final: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

const RESULT_CONFIG = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  pass: { label: 'Passed', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
  fail: { label: 'Failed', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle },
};

const formatRoundType = (rt) =>
  rt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, accent = 'text-primary' }) => (
  <div className="bg-surface-100 border border-border rounded-xl p-4 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
      <Icon className={`w-4 h-4 ${accent}`} />
    </div>
    <div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

/* ─── Schedule Form (modal-style inline) ─── */
const ScheduleForm = ({ candidateId, jobId, onScheduled, onCancel }) => {
  const [form, setForm] = useState({
    roundType: 'technical',
    interviewerName: '',
    interviewerEmail: '',
    date: '',
    meetingLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.interviewerName || !form.date || !form.meetingLink) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/interview/schedule`,
        {
          candidateId,
          jobId,
          roundType: form.roundType,
          interviewer: { name: form.interviewerName, email: form.interviewerEmail },
          date: form.date,
          meetingLink: form.meetingLink,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setForm({ roundType: 'technical', interviewerName: '', interviewerEmail: '', date: '', meetingLink: '' });
      onScheduled();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={submit}
      className="overflow-hidden"
    >
      <div className="bg-surface-200/60 rounded-xl border border-primary/20 p-5 space-y-4 mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarPlus className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-primary">Schedule New Round</p>
          </div>
          <button type="button" onClick={onCancel} className="text-xs text-text-muted hover:text-text-secondary">Cancel</button>
        </div>

        {/* Round type selector as visual pills */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">Round Type</label>
          <div className="flex flex-wrap gap-2">
            {ROUND_TYPES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, roundType: r.value }))}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  form.roundType === r.value
                    ? r.color + ' ring-1 ring-current/20'
                    : 'bg-surface-100 border-border text-text-muted hover:border-border-light'
                }`}
              >
                <span>{r.icon}</span> {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Interviewer Name *" value={form.interviewerName} onChange={set('interviewerName')} placeholder="Jane Smith" />
          <Input label="Interviewer Email" type="email" value={form.interviewerEmail} onChange={set('interviewerEmail')} placeholder="jane@company.com" />
          <Input label="Date & Time *" type="datetime-local" value={form.date} onChange={set('date')} />
          <Input label="Meeting Link *" value={form.meetingLink} onChange={set('meetingLink')} placeholder="https://meet.google.com/..." />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={loading}><CalendarPlus className="w-3.5 h-3.5" /> Schedule Round</Button>
        </div>
      </div>
    </motion.form>
  );
};

/* ─── Feedback Form ─── */
const FeedbackForm = ({ roundId, onSubmitted, onCancel }) => {
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!result) { setError('Please select pass or fail'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/interview/submit-feedback`,
        { roundId, feedback, result },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={submit}
      className="overflow-hidden"
    >
      <div className="mt-3 p-4 bg-surface-100 rounded-xl border border-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-text-primary">Submit Feedback</p>
          <button type="button" onClick={onCancel} className="text-xs text-text-muted hover:text-text-secondary">Cancel</button>
        </div>

        <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Interview notes, strengths, areas for improvement..." />

        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted mr-1">Result:</label>
          <button
            type="button"
            onClick={() => setResult('pass')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              result === 'pass'
                ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 ring-1 ring-emerald-400/20'
                : 'border-border text-text-muted hover:border-emerald-400/30'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" /> Pass
          </button>
          <button
            type="button"
            onClick={() => setResult('fail')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              result === 'fail'
                ? 'text-red-400 bg-red-400/10 border-red-400/30 ring-1 ring-red-400/20'
                : 'border-border text-text-muted hover:border-red-400/30'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> Fail
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={loading} disabled={!result}>Submit Feedback</Button>
        </div>
      </div>
    </motion.form>
  );
};

/* ─── Single round card ─── */
const RoundCard = ({ round, onRefresh }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const d = new Date(round.date);
  const isPast = d < new Date();
  const resultCfg = RESULT_CONFIG[round.result] || RESULT_CONFIG.pending;
  const roundColor = ROUND_COLOR_MAP[round.roundType] || '';
  const ResultIcon = resultCfg.icon;

  return (
    <div className="bg-surface-200/40 border border-border/50 rounded-xl p-4 space-y-3 hover:border-border transition-colors">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${roundColor}`}>
            {formatRoundType(round.roundType)}
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${resultCfg.color}`}>
            <ResultIcon className="w-3 h-3" />
            {resultCfg.label}
          </span>
        </div>
        {round.meetingLink && (
          <a
            href={round.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Video className="w-3 h-3" /> Join Meeting
          </a>
        )}
      </div>

      {/* Details row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {round.interviewer?.name}
          {round.interviewer?.email && <span className="text-text-muted">({round.interviewer.email})</span>}
        </span>
        {isPast && round.result === 'pending' && (
          <span className="text-amber-400 text-[10px] font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">Overdue</span>
        )}
      </div>

      {/* Feedback display */}
      {round.feedback && (
        <div className="flex gap-2 p-3 bg-surface-100 rounded-lg border border-border/30">
          <MessageSquare className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">{round.feedback}</p>
        </div>
      )}

      {/* Feedback action */}
      {round.result === 'pending' && (
        <>
          {!showFeedback && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare className="w-3 h-3" /> Submit Feedback
            </button>
          )}
          <AnimatePresence>
            {showFeedback && (
              <FeedbackForm
                roundId={round._id}
                onSubmitted={() => { setShowFeedback(false); onRefresh(); }}
                onCancel={() => setShowFeedback(false)}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

/* ─── Candidate interview card ─── */
const CandidateInterviewCard = ({ candidate, rounds, jobId, onRefresh, index }) => {
  const [open, setOpen] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const candidateRounds = rounds.filter(
    (r) => r.candidateId?._id?.toString() === candidate.candidateId || r.candidateId === candidate.candidateId
  );

  const passCount = candidateRounds.filter((r) => r.result === 'pass').length;
  const failCount = candidateRounds.filter((r) => r.result === 'fail').length;
  const pendingCount = candidateRounds.filter((r) => r.result === 'pending').length;
  const total = candidateRounds.length;

  const stageColor = {
    interview: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    final: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-surface-100 border rounded-xl overflow-hidden transition-all ${
        open ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border hover:border-border-light'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-200/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {(candidate.candidateName || '?')[0].toUpperCase()}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{candidate.candidateName}</p>
            <p className="text-xs text-text-muted truncate">{candidate.candidateEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mini round progress dots */}
          {total > 0 && (
            <div className="flex items-center gap-1 mr-2">
              {candidateRounds.map((r, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    r.result === 'pass' ? 'bg-emerald-400' :
                    r.result === 'fail' ? 'bg-red-400' :
                    'bg-amber-400'
                  }`}
                  title={`${formatRoundType(r.roundType)}: ${r.result}`}
                />
              ))}
            </div>
          )}
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
              {pendingCount} pending
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
            stageColor[candidate.currentStage] || 'text-text-muted bg-surface-200 border-border'
          }`}>
            {candidate.currentStage?.replace(/_/g, ' ')}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Body — expandable */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4 space-y-3">
              {/* Mini stats row */}
              {total > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-text-muted">
                    <BarChart3 className="w-3 h-3" /> {total} round{total > 1 ? 's' : ''}
                  </span>
                  {passCount > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> {passCount} passed
                    </span>
                  )}
                  {failCount > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle className="w-3 h-3" /> {failCount} failed
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="w-3 h-3" /> {pendingCount} pending
                    </span>
                  )}
                </div>
              )}

              {/* Rounds */}
              {candidateRounds.length === 0 ? (
                <div className="py-6 text-center">
                  <Calendar className="w-6 h-6 text-text-muted mx-auto mb-2" />
                  <p className="text-xs text-text-muted">No interview rounds scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {candidateRounds.map((r) => (
                    <RoundCard key={r._id} round={r} onRefresh={onRefresh} />
                  ))}
                </div>
              )}

              {/* Schedule button */}
              {!showSchedule && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors pt-1"
                  onClick={() => setShowSchedule(true)}
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Schedule New Round
                </button>
              )}

              <AnimatePresence>
                {showSchedule && (
                  <ScheduleForm
                    candidateId={candidate.candidateId}
                    jobId={jobId}
                    onScheduled={() => { setShowSchedule(false); onRefresh(); }}
                    onCancel={() => setShowSchedule(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════ Job Selector Card ═══════════════ */
const JobSelector = ({ jobs, selectedJobId, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    return !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q);
  });

  return (
    <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-9 pr-3 py-2.5 bg-surface-200/50 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.map((j) => (
          <button
            key={j._id}
            onClick={() => onSelect(j._id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
              selectedJobId === j._id
                ? 'bg-primary/10 border-l-2 border-l-primary'
                : 'hover:bg-surface-200/50 border-l-2 border-l-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-text-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${selectedJobId === j._id ? 'text-primary' : 'text-text-primary'}`}>
                {j.title}
              </p>
              <p className="text-[10px] text-text-muted truncate">{j.company}</p>
            </div>
            {selectedJobId === j._id && (
              <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-xs text-text-muted text-center">No matching jobs.</p>
        )}
      </div>
    </div>
  );
};

/* ═══════════════ Main Page ═══════════════ */
const InterviewManager = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

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

  const fetchData = useCallback(async (jobId) => {
    if (!jobId) { setCandidates([]); setRounds([]); return; }
    try {
      setLoadingData(true);
      const [candRes, roundsRes] = await Promise.all([
        axios.get(`${BASE_URL}/job/review-data/${jobId}`, { headers }),
        axios.get(`${BASE_URL}/interview/job/${jobId}`, { headers }),
      ]);
      setCandidates(candRes.data?.data?.candidates || []);
      setRounds(roundsRes.data?.data || []);
    } catch {
      setCandidates([]); setRounds([]);
    } finally { setLoadingData(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(selectedJobId); }, [selectedJobId, fetchData]);

  const refresh = () => fetchData(selectedJobId);

  /* Derived data */
  const interviewCount = candidates.filter((c) => c.currentStage === 'interview').length;
  const pendingRounds = rounds.filter((r) => r.result === 'pending').length;
  const passedRounds = rounds.filter((r) => r.result === 'pass').length;
  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  /* Filter & sort */
  const filtered = candidates
    .filter((c) => {
      const q = candidateSearch.toLowerCase();
      const nameMatch = !q || c.candidateName?.toLowerCase().includes(q) || c.candidateEmail?.toLowerCase().includes(q);
      if (stageFilter === 'interview') return nameMatch && c.currentStage === 'interview';
      if (stageFilter === 'decided') return nameMatch && ['final', 'rejected'].includes(c.currentStage);
      return nameMatch;
    })
    .sort((a, b) => {
      if (a.currentStage === 'interview' && b.currentStage !== 'interview') return -1;
      if (b.currentStage === 'interview' && a.currentStage !== 'interview') return 1;
      return 0;
    });

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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Hero Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/20 to-primary/20 border border-violet-400/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Interview Manager</h1>
              <p className="text-sm text-text-muted">Schedule rounds, provide feedback & track candidate progress</p>
            </div>
          </div>
          {selectedJob && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-text-muted">Current Job</p>
              <p className="text-sm font-semibold text-primary">{selectedJob.title}</p>
            </div>
          )}
        </div>

        {jobs.length === 0 ? (
          <EmptyState title="No jobs found" description="Create a job first to manage interviews." icon={Briefcase} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* ── Left sidebar: Job selector ── */}
            <div className="space-y-4">
              <JobSelector jobs={jobs} selectedJobId={selectedJobId} onSelect={setSelectedJobId} />

              {/* Global stats (when job selected) */}
              {selectedJobId && !loadingData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard icon={Users} label="Candidates" value={candidates.length} accent="text-primary" />
                    <StatCard icon={Video} label="In Interview" value={interviewCount} accent="text-violet-400" />
                    <StatCard icon={Clock} label="Pending" value={pendingRounds} accent="text-amber-400" />
                    <StatCard icon={CheckCircle} label="Passed" value={passedRounds} accent="text-emerald-400" />
                  </div>

                  {/* Round distribution mini chart */}
                  {rounds.length > 0 && (
                    <div className="bg-surface-100 border border-border rounded-xl p-4">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Round Distribution</p>
                      <div className="space-y-2">
                        {ROUND_TYPES.map((rt) => {
                          const count = rounds.filter((r) => r.roundType === rt.value).length;
                          const pct = rounds.length > 0 ? (count / rounds.length) * 100 : 0;
                          return (
                            <div key={rt.value}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-text-muted">{rt.icon} {rt.label}</span>
                                <span className="font-bold text-text-primary">{count}</span>
                              </div>
                              <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${rt.color.split(' ')[1]}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* ── Right: Main content ── */}
            <div className="space-y-4">
              {!selectedJobId ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
                    <Briefcase className="w-7 h-7 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Select a Job</h3>
                  <p className="text-sm text-text-muted max-w-sm">Choose a job from the sidebar to view and manage interview rounds for its candidates.</p>
                </div>
              ) : loadingData ? (
                <div className="flex items-center gap-2 text-text-muted text-sm py-16 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading candidates…
                </div>
              ) : (
                <>
                  {/* Search + filter bar */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        placeholder="Search candidates..."
                        className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="flex bg-surface-100 border border-border rounded-xl overflow-hidden">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'interview', label: 'In Interview' },
                        { key: 'decided', label: 'Decided' },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setStageFilter(f.key)}
                          className={`px-3 py-2 text-xs font-medium transition-colors ${
                            stageFilter === f.key
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Candidates */}
                  {filtered.length === 0 ? (
                    <EmptyState
                      title="No candidates found"
                      description={candidateSearch ? 'Try a different search.' : 'No applicants match the current filter.'}
                      icon={Users}
                    />
                  ) : (
                    <div className="space-y-3">
                      {filtered.map((c, idx) => (
                        <CandidateInterviewCard
                          key={c.candidateId}
                          candidate={c}
                          rounds={rounds}
                          jobId={selectedJobId}
                          onRefresh={refresh}
                          index={idx}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default InterviewManager;
