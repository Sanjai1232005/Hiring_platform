import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ClipboardList, Clock, CheckCircle2, Play, Send,
  ArrowLeft, Loader2, AlertCircle, ChevronRight
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Button from '../../components/ui/Button';
import TaskTimer from '../../components/ui/TaskTimer';
import TaskSubmissionPanel from '../../components/ui/TaskSubmissionPanel';
import ProctoringCamera from '../../components/ui/ProctoringCamera';
import ExplanationRecorder from '../../components/ui/ExplanationRecorder';
import { PageWrapper } from '../../components/animations/pageTransition';

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
        proctoringRef.current.stop().catch(() => {});
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
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Assessment Submitted!</h1>
          <p className="text-text-secondary mb-8">
            Your task assessment for <span className="font-medium text-text-primary">{jobTitle}</span> has been submitted successfully.
          </p>
          {assessments.length > 1 && remainingCount > 0 ? (
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={resetToList}>
                Back to Assessment List
              </Button>
              <Button onClick={() => navigate('/student/dashboard')}>
                Dashboard
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </PageWrapper>
    );
  }

  // ── No assessments ──
  if (assessments.length === 0) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-16">
          <AlertCircle className="w-10 h-10 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">No Task Assessments</h2>
          <p className="text-text-secondary text-sm">No task assessments have been created for this job yet.</p>
        </div>
      </PageWrapper>
    );
  }

  // ── Assessment picker (multiple assessments, none selected) ──
  if (!selectedAssessment) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-cyan/20 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Task Assessments</h1>
              <p className="text-sm text-text-secondary">{jobTitle} &mdash; {assessments.length} assessment{assessments.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="space-y-3">
            {assessments.map((a, idx) => {
              const done = completedIds.has(a._id);
              const totalTime = a.timeLimit || a.tasks.reduce((s, t) => s + t.timeLimit, 0);
              return (
                <button
                  key={a._id}
                  onClick={() => selectAssessment(a)}
                  className={`w-full text-left bg-surface-100 border rounded-xl p-4 transition-all hover:border-primary/30 ${
                    done ? 'border-accent/20' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Assessment {idx + 1}
                    </span>
                    {done ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {a.tasks.length} Task{a.tasks.length > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {totalTime}m
                    </span>
                  </div>
                </button>
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
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Already Completed</h1>
          <p className="text-text-secondary mb-8">
            You have already submitted this assessment.
          </p>
          {assessments.length > 1 ? (
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={resetToList}>
                Back to Assessment List
              </Button>
              <Button onClick={() => navigate('/student/dashboard')}>
                Dashboard
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </PageWrapper>
    );
  }

  // ── Not started yet: show overview ──
  if (!started) {
    const assessment = selectedAssessment;
    const totalTime = assessment.timeLimit || assessment.tasks.reduce((s, t) => s + t.timeLimit, 0);

    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => assessments.length > 1 ? resetToList() : navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-surface-100 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-cyan/20 border border-primary/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Task Assessment</h1>
                <p className="text-sm text-text-secondary">{jobTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-text-muted mb-6">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4" />
                {assessment.tasks.length} Task{assessment.tasks.length > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {totalTime} minutes total
              </span>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-400 font-medium mb-1">⚠️ Important</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Once you start, a countdown timer will begin. You must submit all tasks before the timer runs out.
                Make sure you have a stable internet connection.
              </p>
            </div>
          </div>

          {/* Task List Preview */}
          <div className="space-y-3 mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Tasks Overview</h2>
            {assessment.tasks.map((task, i) => (
              <div
                key={i}
                className="bg-surface-100 border border-border rounded-lg p-4 hover:border-border-light transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Task {i + 1}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.timeLimit}m
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{task.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2">{task.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-1 text-xs text-accent mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {task.expectedDeliverable}
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" className="w-full" onClick={handleStart} icon={Play}>
            Start Task Assessment
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // ── Assessment in progress ──
  const assessment = selectedAssessment;
  const totalTime = assessment.timeLimit || assessment.tasks.reduce((s, t) => s + t.timeLimit, 0);
  const currentTask = assessment.tasks[currentTaskIndex];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with timer */}
      <div className="flex items-center justify-between bg-surface-100 border border-border rounded-xl p-4 mb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-base font-semibold text-text-primary">{jobTitle} — Task Assessment</h1>
            <p className="text-xs text-text-muted">
              Task {currentTaskIndex + 1} of {assessment.tasks.length}
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

      {/* Proctoring camera */}
      <div className="mb-6">
        <ProctoringCamera
          active={started}
          onRecordingReady={(ctrl) => { proctoringRef.current = ctrl; }}
        />
      </div>

      {/* Explanation recorder — triggers at last 5 minutes */}
      {explanationMode && (
        <div className="mb-6">
          <ExplanationRecorder
            active={explanationMode}
            onRecordingComplete={(blob) => { explanationBlobRef.current = blob; }}
            mediaStream={proctoringRef.current?.getStream?.()}
          />
        </div>
      )}

      {/* Task navigation tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
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

      {/* Current task submission panel */}
      <div className="bg-surface-100 border border-border rounded-xl p-6 mb-6">
        <TaskSubmissionPanel
          task={currentTask}
          taskIndex={currentTaskIndex}
          submission={submissions[currentTaskIndex]}
          onUpdate={handleTaskUpdate}
        />
      </div>

      {/* Navigation & Submit */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentTaskIndex === 0}
          onClick={() => setCurrentTaskIndex((i) => i - 1)}
        >
          ← Previous
        </Button>

        {currentTaskIndex < assessment.tasks.length - 1 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentTaskIndex((i) => i + 1)}
          >
            Next Task →
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSubmit}
            loading={submitting}
            icon={Send}
          >
            Submit All Tasks
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudentTaskAssessment;
