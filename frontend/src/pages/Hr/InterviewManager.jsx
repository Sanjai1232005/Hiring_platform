import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, Loader2, CalendarPlus, Video, CheckCircle, XCircle,
  ChevronDown, ChevronUp, MessageSquare, Calendar, Clock,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

const ROUND_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'system_design', label: 'System Design' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'final', label: 'Final' },
];

const resultVariant = (r) =>
  r === 'pass' ? 'success' : r === 'fail' ? 'danger' : 'warning';

/* ─── Schedule Form (inline) ─── */
const ScheduleForm = ({ candidateId, jobId, onScheduled }) => {
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
    <form onSubmit={submit} className="bg-surface-200/50 rounded-lg border border-border/50 p-4 space-y-3">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Schedule New Round</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select label="Round Type" value={form.roundType} onChange={set('roundType')}>
          {ROUND_TYPES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
        <Input label="Interviewer Name *" value={form.interviewerName} onChange={set('interviewerName')} placeholder="Jane Smith" />
        <Input label="Interviewer Email" type="email" value={form.interviewerEmail} onChange={set('interviewerEmail')} placeholder="jane@company.com" />
        <Input label="Date & Time *" type="datetime-local" value={form.date} onChange={set('date')} />
        <Input label="Meeting Link *" value={form.meetingLink} onChange={set('meetingLink')} placeholder="https://meet.google.com/..." className="md:col-span-2" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" size="sm" icon={CalendarPlus} loading={loading}>Schedule</Button>
    </form>
  );
};

/* ─── Feedback Form ─── */
const FeedbackForm = ({ roundId, onSubmitted }) => {
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
    <form onSubmit={submit} className="mt-3 p-3 bg-surface-100 rounded-lg border border-border/50 space-y-2">
      <Textarea label="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} placeholder="Notes from the interview..." />
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant={result === 'pass' ? 'accent' : 'outline'} icon={CheckCircle} onClick={() => setResult('pass')}>Pass</Button>
        <Button type="button" size="sm" variant={result === 'fail' ? 'danger' : 'outline'} icon={XCircle} onClick={() => setResult('fail')}>Fail</Button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" size="sm" loading={loading} disabled={!result}>Submit Feedback</Button>
    </form>
  );
};

/* ─── Single round row ─── */
const RoundRow = ({ round, onRefresh }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const d = new Date(round.date);

  return (
    <div className="bg-surface-200/30 rounded-lg border border-border/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={resultVariant(round.result)} dot>
            {round.roundType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
          <Badge variant={resultVariant(round.result)}>
            {round.result.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span>Interviewer: <span className="text-text-primary font-medium">{round.interviewer?.name}</span></span>
        <a
          href={round.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <Video className="w-3 h-3" /> Join
        </a>
      </div>

      {round.feedback && (
        <div className="text-xs text-text-secondary bg-surface-100 rounded p-2 border border-border/30">
          <MessageSquare className="w-3 h-3 inline mr-1 text-text-muted" />
          {round.feedback}
        </div>
      )}

      {round.result === 'pending' && (
        <>
          <button
            type="button"
            className="text-xs text-primary hover:underline cursor-pointer"
            onClick={() => setShowFeedback((v) => !v)}
          >
            {showFeedback ? 'Cancel' : 'Submit Feedback'}
          </button>
          {showFeedback && (
            <FeedbackForm
              roundId={round._id}
              onSubmitted={() => { setShowFeedback(false); onRefresh(); }}
            />
          )}
        </>
      )}
    </div>
  );
};

/* ─── Candidate interview card ─── */
const CandidateInterviewCard = ({ candidate, rounds, jobId, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const candidateRounds = rounds.filter(
    (r) => r.candidateId?._id?.toString() === candidate.candidateId || r.candidateId === candidate.candidateId
  );

  const passCount = candidateRounds.filter((r) => r.result === 'pass').length;
  const pendingCount = candidateRounds.filter((r) => r.result === 'pending').length;

  return (
    <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
      {/* header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-200/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {(candidate.candidateName || '?')[0].toUpperCase()}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{candidate.candidateName}</p>
            <p className="text-xs text-text-muted truncate">{candidate.candidateEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {candidateRounds.length > 0 && (
            <span className="text-xs text-text-secondary">
              {passCount}/{candidateRounds.length} passed
            </span>
          )}
          {pendingCount > 0 && <Badge variant="warning" dot>{pendingCount} pending</Badge>}
          <Badge variant={candidate.currentStage === 'interview' ? 'primary' : 'default'} dot>
            {candidate.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
          {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>

      {/* body */}
      {open && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          {candidateRounds.length === 0 && (
            <p className="text-xs text-text-muted italic">No interview rounds scheduled yet.</p>
          )}

          {candidateRounds.map((r) => (
            <RoundRow key={r._id} round={r} onRefresh={onRefresh} />
          ))}

          <button
            type="button"
            className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1"
            onClick={() => setShowSchedule((v) => !v)}
          >
            <CalendarPlus className="w-3 h-3" />
            {showSchedule ? 'Close' : 'Schedule New Round'}
          </button>

          {showSchedule && (
            <ScheduleForm
              candidateId={candidate.candidateId}
              jobId={jobId}
              onScheduled={() => { setShowSchedule(false); onRefresh(); }}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════ main page ═══════════════ */
const InterviewManager = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

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

  // Show candidates that are in interview stage first, then others
  const sorted = [...candidates].sort((a, b) => {
    if (a.currentStage === 'interview' && b.currentStage !== 'interview') return -1;
    if (b.currentStage === 'interview' && a.currentStage !== 'interview') return 1;
    return 0;
  });

  const interviewCount = candidates.filter((c) => c.currentStage === 'interview').length;
  const pendingRounds = rounds.filter((r) => r.result === 'pending').length;

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
        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/20 to-primary/20 border border-violet-400/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Interview Manager</h1>
            <p className="text-sm text-text-secondary">Schedule interviews &amp; submit round feedback</p>
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
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            )}

            {selectedJobId && !loadingData && (
              <>
                {/* stats */}
                <div className="flex items-center gap-4 bg-surface-100 border border-border rounded-xl px-5 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-text-primary">{candidates.length}</span> Candidates
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Video className="w-4 h-4 text-violet-400" />
                    <span className="font-medium text-text-primary">{interviewCount}</span> In Interview
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-text-primary">{pendingRounds}</span> Pending
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="font-medium text-text-primary">{rounds.length}</span> Total Rounds
                  </div>
                </div>

                {sorted.length === 0 ? (
                  <EmptyState title="No candidates" description="No applicants for this job yet." icon={Users} />
                ) : (
                  <div className="space-y-3">
                    {sorted.map((c) => (
                      <CandidateInterviewCard
                        key={c.candidateId}
                        candidate={c}
                        rounds={rounds}
                        jobId={selectedJobId}
                        onRefresh={refresh}
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

export default InterviewManager;
