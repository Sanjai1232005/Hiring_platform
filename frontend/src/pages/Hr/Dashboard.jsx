import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, ChevronRight, CheckCircle2, Clock, Circle, Search,
  Users, UserCheck, UserX, TrendingUp, MapPin, Calendar,
  Building2, ArrowRight, Filter, BarChart3, Eye, ChevronDown,
  Layers, Activity, Target, Zap, MessageCircle,
} from 'lucide-react';
import ResumeScreening from './stages/ResumeScreening';
import ProfileReview from './stages/ProfileReview';
import CodingTest from './stages/CodingTest';
import TestEvaluation from './stages/TestEvaluation';
import Interview from './stages/Interview';
import BASE_URL from '../../apiConfig';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ── build the stage list dynamically from the job's assessmentStrategy ── */
const getStagesForStrategy = (strategy) => {
  const resume = { key: 'resume', label: 'Resume Screening', component: ResumeScreening };
  const profile = { key: 'profile', label: 'Profile Review', component: ProfileReview };
  const coding = { key: 'coding', label: 'Coding Test', component: CodingTest };
  const task = { key: 'task', label: 'Task Assessment', component: CodingTest };
  const evaluation = { key: 'evaluation', label: 'Test Evaluation', component: TestEvaluation };
  const interview = { key: 'interview', label: 'Interview', component: Interview };

  switch (strategy) {
    case 'task_only':
      return [resume, profile, task, evaluation, interview];
    case 'coding_then_task':
      return [resume, profile, coding, task, evaluation, interview];
    case 'task_then_coding':
      return [resume, profile, task, coding, evaluation, interview];
    case 'none':
      return [resume, profile, evaluation, interview];
    default: // coding_only
      return [resume, profile, coding, evaluation, interview];
  }
};

/* ── helpers ── */
const STAGE_LABELS = {
  applied: 'Applied', resume_screening: 'Resume', resume: 'Resume', coding_test: 'Coding',
  coding: 'Coding', task_assessment: 'Task', hr_review: 'Review',
  interview: 'Interview', final: 'Selected', rejected: 'Rejected',
};

const STRATEGY_LABELS = {
  coding_only: 'Coding Only',
  task_only: 'Task Only',
  coding_then_task: 'Coding → Task',
  task_then_coding: 'Task → Coding',
  none: 'Direct Interview',
};

const TYPE_COLORS = {
  'Full-Time': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Part-Time': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Internship: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Contract: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, sub, color = 'text-primary', bgColor = 'bg-primary/10' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-surface-100 border border-border rounded-xl p-4 hover:border-border-light transition-colors"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      {sub && <span className="text-[10px] font-medium text-text-muted bg-surface-200 px-1.5 py-0.5 rounded">{sub}</span>}
    </div>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="text-xs text-text-muted mt-0.5">{label}</p>
  </motion.div>
);

/* ── Pipeline Funnel ── */
const PipelineFunnel = ({ stages, stageCounts, totalApplicants }) => {
  if (totalApplicants === 0) return null;
  const stageOrder = ['applied', 'resume_screening', 'resume', 'coding_test', 'coding', 'task_assessment', 'hr_review', 'interview', 'final', 'rejected'];
  const entries = stageOrder
    .filter((s) => stageCounts[s] > 0)
    .map((s) => ({ key: s, label: STAGE_LABELS[s] || s, count: stageCounts[s] }));

  if (entries.length === 0) return null;
  const maxCount = Math.max(...entries.map((e) => e.count));

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const pct = Math.max((entry.count / maxCount) * 100, 8);
        const isRejected = entry.key === 'rejected';
        const isSelected = entry.key === 'final';
        return (
          <div key={entry.key} className="flex items-center gap-3">
            <span className="text-[11px] text-text-muted w-20 text-right shrink-0">{entry.label}</span>
            <div className="flex-1 h-7 bg-surface-200 rounded-md overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={`h-full rounded-md ${
                  isRejected ? 'bg-red-500/30' : isSelected ? 'bg-emerald-500/30' : 'bg-primary/25'
                }`}
              />
              <span className={`absolute inset-y-0 left-2 flex items-center text-xs font-semibold ${
                isRejected ? 'text-red-400' : isSelected ? 'text-emerald-400' : 'text-text-primary'
              }`}>
                {entry.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Job Sidebar Card ── */
const JobCard = ({ job, isActive, onClick }) => {
  const totalApplicants = job.stats?.total || 0;
  const deadline = job.deadline ? new Date(job.deadline) : null;
  const isExpired = deadline && deadline < new Date();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 group ${
        isActive
          ? 'bg-primary/8 border-primary/30 ring-1 ring-primary/15'
          : 'bg-surface-100 border-border hover:border-border-light hover:bg-surface-200/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          isActive ? 'bg-primary/15 text-primary' : 'bg-surface-200 text-text-muted group-hover:text-text-secondary'
        }`}>
          <Briefcase className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-text-primary'}`}>
            {job.title}
          </p>
          <p className="text-xs text-text-muted truncate">{job.company}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-medium bg-surface-200 text-text-muted px-1.5 py-0.5 rounded">
              {totalApplicants} applicant{totalApplicants !== 1 ? 's' : ''}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              job.stage === 'selected' ? 'bg-emerald-400/10 text-emerald-400' :
              job.stage === 'interview' ? 'bg-amber-400/10 text-amber-400' :
              'bg-blue-400/10 text-blue-400'
            }`}>
              {job.stage?.toUpperCase()}
            </span>
            {isExpired && (
              <span className="text-[10px] font-medium bg-red-400/10 text-red-400 px-1.5 py-0.5 rounded">Expired</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

/* ── Main Dashboard ── */
const HRDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showJobDetails, setShowJobDetails] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(BASE_URL + '/job/dashboard-stats', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const { jobs: jobData, overview: ov } = res.data;
      setJobs(jobData);
      setOverview(ov);
      if (selectedJob) {
        const updated = jobData.find((j) => j._id === selectedJob._id);
        if (updated) setSelectedJob(updated);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedJob]);

  useEffect(() => { fetchDashboard(); }, []);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setShowJobDetails(false);
  };

  const handleStageUpdate = () => fetchDashboard();

  /* filter sidebar */
  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((j) => j.title.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q));
    }
    if (stageFilter !== 'all') {
      list = list.filter((j) => j.stage === stageFilter);
    }
    return list;
  }, [jobs, searchQuery, stageFilter]);

  const stages = selectedJob ? getStagesForStrategy(selectedJob.assessmentStrategy) : [];

  const renderStageComponent = () => {
    if (!selectedJob) return null;
    const stageObj = stages.find((s) => s.key === selectedJob.stage);
    if (!stageObj) return <p className="text-text-muted">Unknown Stage</p>;
    const StageComponent = stageObj.component;
    return <StageComponent job={selectedJob} onStageUpdate={handleStageUpdate} />;
  };

  /* ── Stage Tracker ── */
  const renderStageTracker = () => {
    if (!selectedJob) return null;
    const currentIndex = stages.findIndex((s) => s.key === selectedJob.stage);

    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {stages.map((stage, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          const pct = currentIndex >= 0 ? ((currentIndex / (stages.length - 1)) * 100).toFixed(0) : 0;

          return (
            <div key={stage.key} className="flex items-center gap-1.5 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                completed
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : current
                  ? 'bg-primary/10 text-primary border border-primary/30 ring-1 ring-primary/20 shadow-sm shadow-primary/10'
                  : 'bg-surface-200/50 text-text-muted border border-transparent'
              }`}>
                {completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : current ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                {stage.label}
              </div>
              {index < stages.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full ${completed ? 'bg-accent/40' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Job Info Header ── */
  const renderJobHeader = () => {
    if (!selectedJob) return null;
    const job = selectedJob;
    const stats = job.stats || {};
    const deadline = job.deadline ? new Date(job.deadline) : null;
    const isExpired = deadline && deadline < new Date();
    const daysLeft = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <div className="space-y-5 mb-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-text-primary truncate">{job.title}</h1>
              {job.isActive !== false ? (
                <Badge variant="success" dot>Active</Badge>
              ) : (
                <Badge variant="danger" dot>Closed</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
              {job.company && (
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
              )}
              {job.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              )}
              {job.employmentType && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${TYPE_COLORS[job.employmentType] || 'bg-surface-200 text-text-muted border-border'}`}>
                  {job.employmentType}
                </span>
              )}
              {job.experienceLevel && (
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{job.experienceLevel}</span>
              )}
              {job.assessmentStrategy && (
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{STRATEGY_LABELS[job.assessmentStrategy] || job.assessmentStrategy}</span>
              )}
              {deadline && (
                <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : ''}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {isExpired ? 'Expired' : `${daysLeft}d left`}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowJobDetails(!showJobDetails)}>
            <Eye className="w-4 h-4" />
            {showJobDetails ? 'Hide Details' : 'View Details'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showJobDetails ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Expandable job details */}
        <AnimatePresence>
          {showJobDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-surface-200/50 border border-border rounded-xl p-5 space-y-4">
                {job.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Description</h4>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {job.responsibilities?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Responsibilities</h4>
                      <ul className="space-y-1">
                        {job.responsibilities.map((r, i) => (
                          <li key={i} className="text-xs text-text-secondary flex gap-2">
                            <span className="text-primary mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {job.requirements?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Requirements</h4>
                      <ul className="space-y-1">
                        {job.requirements.map((r, i) => (
                          <li key={i} className="text-xs text-text-secondary flex gap-2">
                            <span className="text-primary mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {job.skills?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(job.salaryRange?.min || job.salaryRange?.max) && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Salary Range</h4>
                    <p className="text-sm text-text-secondary">
                      {job.salaryRange.currency} {job.salaryRange.min?.toLocaleString()} – {job.salaryRange.max?.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini stats row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface-100 border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-text-primary">{stats.total || 0}</p>
            <p className="text-[10px] text-text-muted uppercase">Applicants</p>
          </div>
          <div className="bg-surface-100 border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{stats.inInterview || 0}</p>
            <p className="text-[10px] text-text-muted uppercase">In Interview</p>
          </div>
          <div className="bg-surface-100 border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.selected || 0}</p>
            <p className="text-[10px] text-text-muted uppercase">Selected</p>
          </div>
          <div className="bg-surface-100 border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-red-400">{stats.rejected || 0}</p>
            <p className="text-[10px] text-text-muted uppercase">Rejected</p>
          </div>
        </div>
      </div>
    );
  };

  /* ── Loading ── */
  if (loading) return (
    <PageWrapper>
      <div className="p-6 space-y-4">
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    </PageWrapper>
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* ── Sidebar ── */}
      <div className="w-80 border-r border-border bg-surface-100/50 flex flex-col shrink-0">
        {/* sidebar header with overview mini stats */}
        <div className="p-4 border-b border-border space-y-3">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Recruitment</h2>
          {overview && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-base font-bold text-text-primary">{overview.totalJobs}</p>
                <p className="text-[9px] text-text-muted uppercase">Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-primary">{overview.totalApplicants}</p>
                <p className="text-[9px] text-text-muted uppercase">Applicants</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-emerald-400">{overview.totalSelected}</p>
                <p className="text-[9px] text-text-muted uppercase">Selected</p>
              </div>
            </div>
          )}
        </div>

        {/* search + filter */}
        <div className="p-3 space-y-2 border-b border-border">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-200 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {['all', 'resume', 'profile', 'coding', 'task', 'evaluation', 'interview'].map((f) => (
              <button
                key={f}
                onClick={() => setStageFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                  stageFilter === f
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* job list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredJobs.length === 0 ? (
            <p className="text-text-muted text-xs text-center py-8">No jobs found</p>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isActive={selectedJob?._id === job._id}
                onClick={() => handleJobSelect(job)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        {selectedJob ? (
          <PageWrapper className="p-6">
            {/* Job Header + stats */}
            {renderJobHeader()}

            {/* Stage Tracker */}
            <div className="bg-surface-100 border border-border rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Pipeline Progress</h3>
                <Badge variant="primary">{selectedJob.stage?.toUpperCase()}</Badge>
              </div>
              {renderStageTracker()}
            </div>

            {/* Pipeline Funnel (if applicants exist) */}
            {selectedJob.stats?.total > 0 && (
              <div className="bg-surface-100 border border-border rounded-xl p-4 mb-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Candidate Distribution</h3>
                <PipelineFunnel
                  stages={stages}
                  stageCounts={selectedJob.stats?.stages || {}}
                  totalApplicants={selectedJob.stats?.total || 0}
                />
              </div>
            )}

            {/* Stage Content */}
            <div className="bg-surface-100 border border-border rounded-xl p-6">
              {renderStageComponent()}
            </div>
          </PageWrapper>
        ) : (
          /* ── Overview when no job selected ── */
          <div className="p-6">
            <PageWrapper>
              {overview && overview.totalJobs > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard Overview</h1>
                    <p className="text-sm text-text-muted">Your recruitment pipeline at a glance</p>
                  </div>

                  {/* Global stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Briefcase} label="Total Jobs" value={overview.totalJobs} sub={`${overview.activeJobs} active`} />
                    <StatCard icon={Users} label="Total Applicants" value={overview.totalApplicants} color="text-blue-400" bgColor="bg-blue-400/10" />
                    <StatCard icon={MessageCircle} label="In Interview" value={overview.totalInInterview} color="text-amber-400" bgColor="bg-amber-400/10" />
                    <StatCard icon={UserCheck} label="Selected" value={overview.totalSelected} color="text-emerald-400" bgColor="bg-emerald-400/10" sub={`${overview.totalRejected} rejected`} />
                  </div>

                  {/* Job cards grid */}
                  <div>
                    <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Your Jobs</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {jobs.slice(0, 6).map((job) => {
                        const stats = job.stats || {};
                        const conversionRate = stats.total > 0 ? ((stats.selected / stats.total) * 100).toFixed(0) : 0;
                        return (
                          <motion.button
                            key={job._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleJobSelect(job)}
                            className="bg-surface-100 border border-border rounded-xl p-5 text-left hover:border-border-light transition-all group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{job.title}</h3>
                                <p className="text-xs text-text-muted">{job.company}</p>
                              </div>
                              <Badge variant={job.isActive !== false ? 'success' : 'danger'} dot>
                                {job.stage?.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              <div>
                                <p className="text-sm font-bold text-text-primary">{stats.total || 0}</p>
                                <p className="text-[9px] text-text-muted">Applied</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-amber-400">{stats.inInterview || 0}</p>
                                <p className="text-[9px] text-text-muted">Interview</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-emerald-400">{stats.selected || 0}</p>
                                <p className="text-[9px] text-text-muted">Selected</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-red-400">{stats.rejected || 0}</p>
                                <p className="text-[9px] text-text-muted">Rejected</p>
                              </div>
                            </div>
                            {/* mini progress bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden flex">
                                {stats.selected > 0 && (
                                  <div className="h-full bg-emerald-400" style={{ width: `${(stats.selected / Math.max(stats.total, 1)) * 100}%` }} />
                                )}
                                {stats.inInterview > 0 && (
                                  <div className="h-full bg-amber-400" style={{ width: `${(stats.inInterview / Math.max(stats.total, 1)) * 100}%` }} />
                                )}
                                {stats.rejected > 0 && (
                                  <div className="h-full bg-red-400/60" style={{ width: `${(stats.rejected / Math.max(stats.total, 1)) * 100}%` }} />
                                )}
                              </div>
                              <span className="text-[10px] text-text-muted">{conversionRate}% hire</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No jobs yet"
                  description="Create your first job posting to start recruiting candidates"
                  icon={Briefcase}
                />
              )}
            </PageWrapper>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
