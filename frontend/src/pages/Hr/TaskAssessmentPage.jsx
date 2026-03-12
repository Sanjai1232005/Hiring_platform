import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Loader2, Briefcase, Search, ArrowRight, Plus,
  FileText, Eye, Layers, Sparkles, Code2, Trash2, CheckCircle2,
  AlertCircle, Hash, Award,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import CreateTaskAssessment, { TaskAssessmentList } from './CreateTaskAssessment';
import CreateQuestion from './CreateQuestions';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ─── Existing Questions List ─── */
const QuestionList = ({ jobId, refreshKey }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/questions/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading questions…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <EmptyState icon={Code2} title="No coding questions"
        description="Create your first coding question to get started." />
    );
  }

  return (
    <div className="space-y-3">
      {/* summary */}
      <div className="flex items-center gap-3 bg-surface-200/50 rounded-xl px-4 py-2.5 border border-border/50">
        <Code2 className="w-4 h-4 text-primary" />
        <span className="text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{questions.length}</span> question{questions.length !== 1 && 's'} configured
        </span>
        <span className="text-xs text-text-muted">•</span>
        <span className="text-xs text-text-secondary">
          Total marks: <span className="font-semibold text-text-primary">{questions.reduce((s, q) => s + (q.marks || 0), 0)}</span>
        </span>
      </div>

      {questions.map((q, i) => (
        <motion.div key={q._id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-surface-100 border border-border rounded-xl overflow-hidden"
        >
          <button type="button"
            onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-200/30 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              Q{i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{q.title}</p>
              {q.description && (
                <p className="text-[11px] text-text-muted truncate">{q.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="primary">{q.marks || 100} pts</Badge>
              <Badge variant="default">{q.testCases?.length || 0} tests</Badge>
              <motion.div animate={{ rotate: expandedId === q._id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted rotate-90" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {expandedId === q._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border px-4 py-4 space-y-3">
                  {q.description && (
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Description</p>
                      <p className="text-xs text-text-secondary leading-relaxed">{q.description}</p>
                    </div>
                  )}
                  {q.testCases?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Test Cases</p>
                      <div className="grid gap-2">
                        {q.testCases.map((tc, ti) => (
                          <div key={ti} className="bg-surface-200/60 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-text-muted font-medium">Test Case {ti + 1}</span>
                              {tc.hidden && <Badge variant="warning">Hidden</Badge>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] text-text-muted mb-0.5">Input</p>
                                <pre className="text-xs text-text-primary font-mono bg-surface-300/50 rounded px-2 py-1 overflow-x-auto">{tc.input || '—'}</pre>
                              </div>
                              <div>
                                <p className="text-[10px] text-text-muted mb-0.5">Expected Output</p>
                                <pre className="text-xs text-text-primary font-mono bg-surface-300/50 rounded px-2 py-1 overflow-x-auto">{tc.output || '—'}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

/* ═══════════════ MAIN PAGE ═══════════════ */
const TaskAssessmentPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState('existing'); // 'existing' | 'create'
  const [assessmentMode, setAssessmentMode] = useState('task'); // 'task' | 'coding'
  const [jobSearch, setJobSearch] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/getjobs', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const q = jobSearch.toLowerCase();
    return !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q);
  });

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-sm flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-accent/15 text-accent border-accent/25'
                : 'bg-red-500/15 text-red-400 border-red-500/25'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Assessments</h1>
              <p className="text-sm text-text-muted">Create & manage coding questions and task-based assessments</p>
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
          <EmptyState
            title="No jobs found"
            description="Create a job first before adding assessments."
            icon={ClipboardList}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* ── Left sidebar: Job selector ── */}
            <div className="space-y-4">
              <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      placeholder="Search jobs..."
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-200/50 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredJobs.map((j) => (
                    <button
                      key={j._id}
                      onClick={() => { setSelectedJobId(j._id); setTab('existing'); }}
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
                      {selectedJobId === j._id && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  ))}
                  {filteredJobs.length === 0 && (
                    <p className="px-4 py-6 text-xs text-text-muted text-center">No matching jobs.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: Main content ── */}
            <div className="space-y-4">
              {!selectedJobId ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
                    <Layers className="w-7 h-7 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Select a Job</h3>
                  <p className="text-sm text-text-muted max-w-sm">Choose a job from the sidebar to view existing assessments or create new ones.</p>
                </div>
              ) : (
                <>
                  {/* ── Assessment Mode Toggle ── */}
                  <div className="flex items-center gap-3 bg-surface-100 border border-border rounded-xl p-3">
                    <span className="text-xs text-text-muted uppercase tracking-wider font-medium ml-1">Type</span>
                    <div className="flex items-center gap-2 flex-1">
                      <button type="button"
                        onClick={() => { setAssessmentMode('coding'); setTab('existing'); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          assessmentMode === 'coding'
                            ? 'bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20'
                            : 'bg-surface-200/50 border-border text-text-muted hover:text-text-secondary hover:border-border'
                        }`}
                      >
                        <Code2 className="w-4 h-4" /> Coding Questions
                      </button>
                      <button type="button"
                        onClick={() => { setAssessmentMode('task'); setTab('existing'); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          assessmentMode === 'task'
                            ? 'bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20'
                            : 'bg-surface-200/50 border-border text-text-muted hover:text-text-secondary hover:border-border'
                        }`}
                      >
                        <ClipboardList className="w-4 h-4" /> Task Assessment
                      </button>
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div className="flex items-center gap-1 bg-surface-100 border border-border rounded-xl p-1">
                    {[
                      { key: 'existing', label: assessmentMode === 'coding' ? 'Existing Questions' : 'Existing Assessments', icon: Eye },
                      { key: 'create', label: assessmentMode === 'coding' ? 'Add Question' : 'Create New', icon: Plus },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          tab === t.key
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'text-text-muted hover:text-text-secondary hover:bg-surface-200/50'
                        }`}
                      >
                        <t.icon className="w-4 h-4" /> {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    {/* ─── CODING MODE ─── */}
                    {assessmentMode === 'coding' && tab === 'existing' && (
                      <motion.div key="coding-existing"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                        <QuestionList key={refreshKey} jobId={selectedJobId} refreshKey={refreshKey} />
                      </motion.div>
                    )}
                    {assessmentMode === 'coding' && tab === 'create' && (
                      <motion.div key="coding-create"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                        <div className="bg-surface-100 border border-border rounded-xl p-5">
                          <CreateQuestion jobId={selectedJobId}
                            onQuestionCreated={() => {
                              setRefreshKey((k) => k + 1);
                              setTab('existing');
                              showToast('success', 'Coding question created successfully!');
                            }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ─── TASK MODE ─── */}
                    {assessmentMode === 'task' && tab === 'existing' && (
                      <motion.div key="task-existing"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                        <TaskAssessmentList key={refreshKey} jobId={selectedJobId} />
                      </motion.div>
                    )}
                    {assessmentMode === 'task' && tab === 'create' && (
                      <motion.div key="task-create"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                        <CreateTaskAssessment
                          jobId={selectedJobId}
                          onTaskCreated={() => {
                            setRefreshKey((k) => k + 1);
                            setTab('existing');
                            showToast('success', 'Task assessment created successfully!');
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default TaskAssessmentPage;
