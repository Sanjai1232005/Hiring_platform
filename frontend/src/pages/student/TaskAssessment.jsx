import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Clock, CheckCircle2, Play, Send,
  ArrowLeft, Loader2, AlertCircle, ChevronRight,
  Shield, Zap, FileText, Code2, Target, Sparkles,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Button from '../../components/ui/Button';
import TaskTimer from '../../components/ui/TaskTimer';
import TaskSubmissionPanel from '../../components/ui/TaskSubmissionPanel';
import ProctoringCamera from '../../components/ui/ProctoringCamera';
import ExplanationRecorder from '../../components/ui/ExplanationRecorder';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ── Difficulty helpers ── */
const DIFF_COLOR = {
  junior: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  mid: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  senior: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  staff: 'text-red-400 bg-red-400/10 border-red-400/20',
};
const DIFF_LABEL = { junior: 'Junior', mid: 'Mid-Level', senior: 'Senior', staff: 'Staff / Lead' };

/* ── Stat chip used in overview ── */
const StatChip = ({ icon: Icon, label, value, accent = 'text-primary' }) => (
  <div className="flex items-center gap-2 bg-surface-200/50 border border-border rounded-lg px-3 py-2">
    <Icon className={`w-4 h-4 ${accent}`} />
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

/* ── Step indicator ── */
const StepIndicator = ({ steps, currentStage }) => (
  <div className="flex items-center gap-1 w-full">
    {steps.map((step, i) => {
      const isActive = i === currentStage;
      const isPast = i < currentStage;
      return (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
            isPast ? 'bg-accent' : isActive ? 'bg-primary' : 'bg-surface-300'
          }`} />
        </div>
      );
    })}
  </div>
);

const StudentTaskAssessment = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [justSubmittedId, setJustSubmittedId] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const proctoringRef = useRef(null);
  const [explanationMode, setExplanationMode] = useState(false);
  const explanationBlobRef = useRef(null);
  const submittingRef = useRef(false);
  const submissionsRef = useRef([]);
  const selectedAssessmentRef = useRef(null);

  // Cleanup all media on unmount (safety net for camera staying on)
  useEffect(() => {
    return () => {
      if (proctoringRef.current?.stop) {
        proctoringRef.current.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: 'Bearer ' + token };

        const [assessRes, jobRes] = await Promise.all([
          axios.get(BASE_URL + '/tasks/job/' + jobId, { headers }),
          axios.get(BASE_URL + '/job/' + jobId),
        ]);

        const data = assessRes.data?.data || [];
        setAssessments(data);
        setJobTitle(jobRes.data?.title || 'Job');

        // Check completion status for all assessments in parallel
        if (data.length > 0) {
          const subChecks = await Promise.allSettled(
            data.map((a) => axios.get(BASE_URL + '/tasks/submission/' + a._id, { headers }))
          );
          const completed = new Set();
          subChecks.forEach((res, i) => {
            if (res.status === 'fulfilled' && res.value.data?.data?.completed) {
              completed.add(data[i]._id);
            }
          });
          setCompletedIds(completed);

          // Auto-select if only one assessment
          if (data.length === 1) {
            setSelectedAssessment(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching task assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const selectAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setJustSubmittedId(null);
  };

  const resetToList = () => {
    setSelectedAssessment(null);
    setStarted(false);
    setStartedAt(null);
    setCurrentTaskIndex(0);
    setSubmissions([]);
    submissionsRef.current = [];
    selectedAssessmentRef.current = null;
    setExplanationMode(false);
    explanationBlobRef.current = null;
    proctoringRef.current = null;
    setJustSubmittedId(null);
  };

  const handleStart = () => {
    if (!selectedAssessment) return;
    setStarted(true);
    setStartedAt(new Date().toISOString());
    setCurrentTaskIndex(0);
    // Initialize empty submissions for each task
    const initial = selectedAssessment.tasks.map((task, i) => ({
      taskIndex: i,
      taskTitle: task.title,
      submissionFiles: [],
      githubLink: '',
    }));
    setSubmissions(initial);
    submissionsRef.current = initial;
    selectedAssessmentRef.current = selectedAssessment;
  };

  const handleTaskUpdate = useCallback((data) => {
    setSubmissions((prev) => {
      const updated = [...prev];
      updated[data.taskIndex] = data;
      submissionsRef.current = updated;
      return updated;
    });
  }, []);

  const handleSubmit = async () => {
    // Guard against double submission
    if (submittingRef.current) return;

    // Use ref for latest data (avoids stale closure in handleTimeUp)
    const latestSubmissions = submissionsRef.current;
    const latestAssessment = selectedAssessmentRef.current || selectedAssessment;

    // Validate at least one file or github link per task
    for (let i = 0; i < latestSubmissions.length; i++) {
      const sub = latestSubmissions[i];
      if ((!sub.submissionFiles || sub.submissionFiles.length === 0) && !sub.githubLink) {
        alert(`Please upload at least one file or provide a GitHub link for Task ${i + 1}.`);
        setCurrentTaskIndex(i);
        return;
      }
    }

    try {
      submittingRef.current = true;
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };

      // Build promises to run in parallel
      const promises = [];

      // 1) Task submission
      promises.push(
        axios.post(
          BASE_URL + '/tasks/submit',
          { jobId, assessmentId: latestAssessment._id, submissions: latestSubmissions },
          { headers }
        )
      );

      // 2) Proctoring analysis (simulated — no video upload)
      // Stop the camera gracefully but skip the slow Cloudinary upload
      if (proctoringRef.current?.stop) {
        try { await proctoringRef.current.stop(); } catch (_) {}
      }
      promises.push(
        axios.post(
          BASE_URL + '/tasks/uploadRecording',
          { jobId, assessmentId: latestAssessment._id },
          { headers }
        ).catch((e) => console.error('Proctoring analysis failed:', e))
      );

      // 3) Explanation analysis (simulated — no video upload)
      promises.push(
        axios.post(
          BASE_URL + '/tasks/uploadExplanation',
          { jobId, assessmentId: latestAssessment._id },
          { headers }
        ).catch((e) => console.error('Explanation analysis failed:', e))
      );

      // Run all in parallel
      await Promise.all(promises);
      setCompletedIds((prev) => new Set([...prev, latestAssessment._id]));
      setJustSubmittedId(latestAssessment._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, []); // handleSubmit reads from refs, no stale closure

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading task assessment...
        </div>
      </PageWrapper>
    );
  }

  const remainingCount = assessments.length - completedIds.size;

  // ── Just submitted ──
  if (justSubmittedId) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto text-center py-16 space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-emerald-500/10 border border-accent/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Assessment Submitted!</h1>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Your task assessment for <span className="font-semibold text-text-primary">{jobTitle}</span> has been submitted. Proctoring and explanation analyses are being processed.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-100 border border-border rounded-xl p-4 text-left space-y-2 max-w-xs mx-auto"
          >
            <div className="flex items-center gap-2 text-xs text-accent"><CheckCircle2 className="w-3.5 h-3.5" /> Tasks submitted</div>
            <div className="flex items-center gap-2 text-xs text-accent"><Shield className="w-3.5 h-3.5" /> Proctoring analysis queued</div>
            <div className="flex items-center gap-2 text-xs text-accent"><Sparkles className="w-3.5 h-3.5" /> Explanation analysis queued</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-3 justify-center">
            {assessments.length > 1 && remainingCount > 0 ? (
              <>
                <Button variant="secondary" onClick={resetToList}>Back to Assessments</Button>
                <Button onClick={() => navigate('/student/dashboard')}>Dashboard</Button>
              </>
            ) : (
              <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
            )}
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  // ── No assessments ──
  if (assessments.length === 0) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-5">
            <AlertCircle className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">No Task Assessments</h2>
          <p className="text-sm text-text-muted max-w-xs mx-auto">No task assessments have been created for this job yet. Check back later.</p>
          <Button variant="secondary" size="sm" className="mt-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Go Back
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // ── Assessment picker (multiple assessments, none selected) ──
  if (!selectedAssessment) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Hero header */}
          <div className="bg-surface-100 border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Task Assessments</h1>
                <p className="text-sm text-text-muted">{jobTitle} &mdash; {assessments.length} assessment{assessments.length > 1 ? 's' : ''} available</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-surface-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${(completedIds.size / assessments.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-text-muted">{completedIds.size}/{assessments.length}</span>
            </div>
          </div>

          {/* Assessment cards */}
          <div className="grid gap-3">
            {assessments.map((a, idx) => {
              const done = completedIds.has(a._id);
              const totalTime = a.timeLimit || a.tasks.reduce((s, t) => s + t.timeLimit, 0);
              const maxDiff = a.tasks.reduce((max, t) => {
                const order = { junior: 0, mid: 1, senior: 2, staff: 3 };
                return (order[t.difficulty] || 0) > (order[max] || 0) ? t.difficulty : max;
              }, 'junior');

              return (
                <motion.button
                  key={a._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => selectAssessment(a)}
                  className={`w-full text-left bg-surface-100 border rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-primary/5 group ${
                    done ? 'border-accent/20' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        Assessment {idx + 1}
                      </span>
                      {maxDiff && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${DIFF_COLOR[maxDiff] || ''}`}>
                          {DIFF_LABEL[maxDiff] || maxDiff}
                        </span>
                      )}
                    </div>
                    {done ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Task previews */}
                  <div className="space-y-2 mb-3">
                    {a.tasks.map((task, ti) => (
                      <div key={ti} className="flex items-center gap-2 text-xs text-text-secondary">
                        <div className="w-5 h-5 rounded bg-surface-300 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                          {ti + 1}
                        </div>
                        <span className="truncate">{task.title}</span>
                        {task.techStack?.length > 0 && (
                          <span className="text-[10px] text-text-muted bg-surface-200 px-1.5 py-0.5 rounded shrink-0">
                            {task.techStack.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-text-muted pt-3 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {a.tasks.length} Task{a.tasks.length > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {totalTime} min
                    </span>
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Selected assessment already completed ──
  if (completedIds.has(selectedAssessment._id)) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto text-center py-16 space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Already Completed</h1>
          <p className="text-sm text-text-muted">You have already submitted this assessment. Your results are being processed.</p>
          <div className="flex gap-3 justify-center">
            {assessments.length > 1 ? (
              <>
                <Button variant="secondary" onClick={resetToList}>Back to Assessments</Button>
                <Button onClick={() => navigate('/student/dashboard')}>Dashboard</Button>
              </>
            ) : (
              <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
            )}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Not started yet: show overview ──
  if (!started) {
    const assessment = selectedAssessment;
    const totalTime = assessment.timeLimit || assessment.tasks.reduce((s, t) => s + t.timeLimit, 0);
    const totalReqs = assessment.tasks.reduce((s, t) => s + (t.requirements?.length || 0), 0);
    const allTech = [...new Set(assessment.tasks.flatMap((t) => t.techStack || []))];

    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => assessments.length > 1 ? resetToList() : navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* ── Hero Card ── */}
          <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
            {/* Gradient header */}
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary/50" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-text-primary">Task Assessment</h1>
                  <p className="text-sm text-text-muted mt-0.5">{jobTitle}</p>
                </div>
              </div>

              {/* Stat chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <StatChip icon={ClipboardList} label="Tasks" value={assessment.tasks.length} />
                <StatChip icon={Clock} label="Time Limit" value={`${totalTime} min`} accent="text-amber-400" />
                <StatChip icon={Target} label="Requirements" value={totalReqs} accent="text-cyan-400" />
                <StatChip icon={Code2} label="Tech Stack" value={allTech.length || 'Any'} accent="text-purple-400" />
              </div>

              {/* Tech stack pills */}
              {allTech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {allTech.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Important notice ── */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-1">Before You Start</p>
              <ul className="text-xs text-text-muted space-y-1 leading-relaxed">
                <li>• A countdown timer begins immediately — manage your time carefully</li>
                <li>• Webcam proctoring will be active throughout the assessment</li>
                <li>• In the last 5 minutes, you'll record a brief explanation video</li>
                <li>• Ensure a stable internet connection and quiet environment</li>
              </ul>
            </div>
          </div>

          {/* ── Task Cards ── */}
          <div>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Tasks Overview</h2>
            <div className="space-y-3">
              {assessment.tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-surface-100 border border-border rounded-xl p-5 hover:border-border-light transition-colors"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.difficulty && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${DIFF_COLOR[task.difficulty] || ''}`}>
                          {DIFF_LABEL[task.difficulty] || task.difficulty}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" /> {task.timeLimit}m
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-3">{task.description}</p>

                  {/* Tech stack + requirements inline */}
                  <div className="flex flex-wrap items-center gap-2">
                    {task.techStack?.map((t, ti) => (
                      <span key={ti} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary">
                        <Code2 className="w-2.5 h-2.5" /> {t}
                      </span>
                    ))}
                    {task.requirements?.length > 0 && (
                      <span className="text-[10px] text-text-muted bg-surface-200 px-2 py-0.5 rounded">
                        {task.requirements.length} requirement{task.requirements.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Deliverable */}
                  {task.expectedDeliverable && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/40 text-xs text-accent">
                      <FileText className="w-3.5 h-3.5" />
                      Deliverable: {task.expectedDeliverable}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Start button ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" className="w-full" onClick={handleStart}>
              <Play className="w-4 h-4" /> Start Task Assessment
            </Button>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  // ── Assessment in progress ──
  const assessment = selectedAssessment;
  const totalTime = assessment.timeLimit || assessment.tasks.reduce((s, t) => s + t.timeLimit, 0);
  const currentTask = assessment.tasks[currentTaskIndex];
  const completedTasks = submissions.filter((s) => s && (s.submissionFiles?.length > 0 || s.githubLink)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-lg border-b border-border pb-3 pt-2 -mx-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-text-primary truncate">{jobTitle}</h1>
              <p className="text-[10px] text-text-muted">
                Task {currentTaskIndex + 1} of {assessment.tasks.length} &middot; {completedTasks}/{assessment.tasks.length} done
              </p>
            </div>
          </div>
          <TaskTimer
            totalMinutes={totalTime}
            startedAt={startedAt}
            onTimeUp={handleTimeUp}
            onLastFiveMinutes={() => setExplanationMode(true)}
          />
        </div>

        {/* Task progress bar */}
        <StepIndicator steps={assessment.tasks} currentStage={currentTaskIndex} />
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Main content */}
        <div className="space-y-4">
          {/* Proctoring camera */}
          <ProctoringCamera
            active={started}
            onRecordingReady={(ctrl) => { proctoringRef.current = ctrl; }}
          />

          {/* Explanation recorder — triggers at last 5 minutes */}
          <AnimatePresence>
            {explanationMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ExplanationRecorder
                  active={explanationMode}
                  onRecordingComplete={(blob) => { explanationBlobRef.current = blob; }}
                  mediaStream={proctoringRef.current?.getStream?.()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current task submission panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTaskIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-100 border border-border rounded-xl p-6"
            >
              <TaskSubmissionPanel
                task={currentTask}
                taskIndex={currentTaskIndex}
                submission={submissions[currentTaskIndex]}
                onUpdate={handleTaskUpdate}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between bg-surface-100 border border-border rounded-xl p-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentTaskIndex === 0}
              onClick={() => setCurrentTaskIndex((i) => i - 1)}
            >
              &larr; Previous
            </Button>

            {currentTaskIndex < assessment.tasks.length - 1 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentTaskIndex((i) => i + 1)}
              >
                Next Task &rarr;
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                loading={submitting}
              >
                <Send className="w-4 h-4" /> Submit All Tasks
              </Button>
            )}
          </div>
        </div>

        {/* ── Sidebar: task navigator ── */}
        <div className="space-y-3 hidden lg:block">
          <div className="bg-surface-100 border border-border rounded-xl p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Tasks</h3>
            <div className="space-y-2">
              {assessment.tasks.map((task, i) => {
                const sub = submissions[i];
                const hasContent = sub && (sub.submissionFiles?.length > 0 || sub.githubLink);
                const isActive = i === currentTaskIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentTaskIndex(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-primary/10 border border-primary/30'
                        : hasContent
                        ? 'bg-accent/5 border border-accent/20'
                        : 'bg-surface-200/50 border border-transparent hover:border-border'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-primary text-white' :
                      hasContent ? 'bg-accent/20 text-accent' :
                      'bg-surface-300 text-text-muted'
                    }`}>
                      {hasContent && !isActive ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {task.timeLimit}m
                        {task.difficulty && (
                          <span className={`ml-1 ${DIFF_COLOR[task.difficulty]?.split(' ')[0] || ''}`}>
                            &middot; {DIFF_LABEL[task.difficulty] || task.difficulty}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit summary */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-muted">Progress</span>
                <span className="font-bold text-text-primary">{completedTasks}/{assessment.tasks.length}</span>
              </div>
              <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                  style={{ width: `${(completedTasks / assessment.tasks.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile task tabs (visible on small screens) ── */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
        {assessment.tasks.map((task, i) => {
          const sub = submissions[i];
          const hasContent = sub && (sub.submissionFiles?.length > 0 || sub.githubLink);
          return (
            <button
              key={i}
              onClick={() => setCurrentTaskIndex(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium shrink-0 transition-all ${
                i === currentTaskIndex
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : hasContent
                  ? 'bg-accent/5 border-accent/20 text-accent'
                  : 'bg-surface-200 border-border text-text-secondary hover:border-border-light'
              }`}
            >
              {hasContent && i !== currentTaskIndex && (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Task {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentTaskAssessment;
