import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  ClipboardList, ChevronRight, Loader2, MapPin, Briefcase,
  CheckCircle2, Clock, AlertCircle, Search, Filter, Code2, FileText,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { PageWrapper } from '../../components/animations/pageTransition';
import EmptyState from '../../components/ui/EmptyState';

const STAGE_CONFIG = {
  applied:         { label: 'Applied',        color: 'text-blue-400   bg-blue-400/10   border-blue-400/20' },
  shortlisted:     { label: 'Shortlisted',    color: 'text-cyan-400   bg-cyan-400/10   border-cyan-400/20' },
  coding:          { label: 'Coding Test',    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  task_assessment: { label: 'Task Assessment', color: 'text-amber-400  bg-amber-400/10  border-amber-400/20' },
  interview:       { label: 'Interview',      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  final:           { label: 'Selected',       color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  rejected:        { label: 'Rejected',       color: 'text-red-400    bg-red-400/10    border-red-400/20' },
};

const STRATEGY_LABEL = {
  coding_only: 'Coding Only',
  task_only: 'Task Only',
  coding_then_task: 'Coding → Task',
  task_then_coding: 'Task → Coding',
  none: 'No Assessment',
};

/* Determine what assessments are available for a job */
const getAssessmentInfo = (app) => {
  const strategy = app.assessmentStrategy || 'none';
  const hasTaskStrategy = ['task_only', 'coding_then_task', 'task_then_coding'].includes(strategy);
  const hasCodingStrategy = ['coding_only', 'coding_then_task', 'task_then_coding'].includes(strategy);
  const taskCount = app.taskCount || 0;
  const questionCount = app.questionCount || 0;
  const hasAvailableAssessments = (hasTaskStrategy && taskCount > 0) || (hasCodingStrategy && questionCount > 0);
  return { hasTaskStrategy, hasCodingStrategy, taskCount, questionCount, hasAvailableAssessments };
};

const StudentTaskList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | completed

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/my-applications-stages', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setApplications(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted py-20 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading assessments...
        </div>
      </PageWrapper>
    );
  }

  /* Filter + search */
  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || app.jobTitle?.toLowerCase().includes(q) || app.company?.toLowerCase().includes(q);
    if (filter === 'pending') return matchesSearch && !['final', 'rejected'].includes(app.currentStage);
    if (filter === 'completed') return matchesSearch && ['final', 'rejected'].includes(app.currentStage);
    return matchesSearch;
  });

  const pendingCount = applications.filter((a) => !['final', 'rejected'].includes(a.currentStage)).length;
  const completeCount = applications.length - pendingCount;
  const readyCount = applications.filter((a) => getAssessmentInfo(a).hasAvailableAssessments).length;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Task Assessments</h1>
              <p className="text-sm text-text-muted">View and complete task assessments for your applied jobs</p>
            </div>
          </div>
        </div>

        {/* ── Quick stats ── */}
        {applications.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Applications', value: applications.length, icon: Briefcase, accent: 'text-primary' },
              { label: 'Assessments Ready', value: readyCount, icon: CheckCircle2, accent: 'text-emerald-400' },
              { label: 'Pending', value: pendingCount, icon: Clock, accent: 'text-amber-400' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface-100 border border-border rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-lg ${s.accent} bg-current/10 flex items-center justify-center`}
                  style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}
                >
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filter ── */}
        {applications.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title or company..."
                className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex bg-surface-100 border border-border rounded-xl overflow-hidden">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'completed', label: 'Done' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── List ── */}
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Apply to jobs first to see task assessments."
            icon={ClipboardList}
          />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No matching applications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app, idx) => {
              const stage = STAGE_CONFIG[app.currentStage] || STAGE_CONFIG.applied;
              const strategy = STRATEGY_LABEL[app.assessmentStrategy] || app.assessmentStrategy;
              const { hasTaskStrategy, hasCodingStrategy, taskCount, questionCount, hasAvailableAssessments } = getAssessmentInfo(app);
              const isActive = app.currentStage === 'task_assessment';

              return (
                <motion.button
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => navigate('/student/task-assessment/' + app.jobId)}
                  className={`w-full text-left bg-surface-100 border rounded-xl p-4 transition-all group hover:shadow-md hover:shadow-primary/5 ${
                    isActive ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Title row */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                          {app.jobTitle}
                        </h3>
                        {isActive && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {app.company}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {app.location}
                          </span>
                        )}
                        {app.employmentType && app.employmentType !== 'N/A' && (
                          <span className="px-1.5 py-0.5 rounded bg-surface-200 text-[10px]">
                            {app.employmentType}
                          </span>
                        )}
                      </div>

                      {/* Assessment availability row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {hasTaskStrategy && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            taskCount > 0
                              ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                              : 'bg-surface-200 text-text-muted border border-border'
                          }`}>
                            <FileText className="w-3 h-3" />
                            {taskCount > 0 ? `${taskCount} Task${taskCount > 1 ? 's' : ''} Ready` : 'No Tasks Yet'}
                          </span>
                        )}
                        {hasCodingStrategy && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            questionCount > 0
                              ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20'
                              : 'bg-surface-200 text-text-muted border border-border'
                          }`}>
                            <Code2 className="w-3 h-3" />
                            {questionCount > 0 ? `${questionCount} Question${questionCount > 1 ? 's' : ''} Ready` : 'No Questions Yet'}
                          </span>
                        )}
                      </div>

                      {/* Bottom row — stage + strategy */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${stage.color}`}>
                          {app.currentStage === 'final' && <CheckCircle2 className="w-3 h-3" />}
                          {stage.label}
                        </span>
                        <span className="text-[10px] text-text-muted bg-surface-200 px-2 py-0.5 rounded">
                          {strategy}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>

                  {/* Pipeline progress bar */}
                  {app.pipelineStages?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        {app.pipelineStages.map((s, i) => {
                          const allStageNames = app.pipelineStages.map((ps) => ps.name);
                          const currentIdx = allStageNames.indexOf(app.currentStage);
                          const passed = i <= currentIdx || app.currentStage === 'final';
                          const active = i === currentIdx;
                          return (
                            <div key={i} className="flex items-center gap-1 flex-1">
                              <div
                                className={`h-1.5 rounded-full flex-1 transition-colors ${
                                  passed ? 'bg-primary' :
                                  app.currentStage === 'rejected' && i === currentIdx ? 'bg-red-400' :
                                  'bg-surface-300'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-text-muted">{app.pipelineStages[0]?.label}</span>
                        <span className="text-[9px] text-text-muted">{app.pipelineStages[app.pipelineStages.length - 1]?.label}</span>
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default StudentTaskList;
