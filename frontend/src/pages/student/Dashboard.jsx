import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Code2, ClipboardList, Video, ArrowRight, Trophy,
  Briefcase, XCircle, Star, Activity, CalendarClock, Layers, ChevronDown,
} from 'lucide-react';
import API from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import { SkeletonCard } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const FALLBACK_STAGES = [
  { name: 'resume', label: 'Resume' },
  { name: 'coding', label: 'Test' },
  { name: 'interview', label: 'Interview' },
  { name: 'final', label: 'Selected' },
];

const stageAction = (stageName, app, navigate) => {
  if (stageName === 'coding_test' || stageName === 'coding') {
    if (!app.testCompleted && app.testToken) {
      return { label: 'Start Test', icon: Code2, onClick: () => navigate(`/test/start/${app.testToken}`) };
    }
    if (app.testCompleted) return { label: 'Test Completed', disabled: true };
  }
  if (stageName === 'task_assessment') {
    return { label: 'View Tasks', icon: ClipboardList, onClick: () => navigate(`/student/task-assessment/${app.jobId}`) };
  }
  if (stageName === 'interview') {
    return { label: 'View Interviews', icon: Video, onClick: () => navigate('/student/interviews') };
  }
  return null;
};

const STAGE_ICON = {
  resume: Briefcase,
  coding: Code2,
  coding_test: Code2,
  task_assessment: ClipboardList,
  interview: Video,
  final: Star,
};

/* ── Metric card with progress bar ── */
const MetricCard = ({ icon: Icon, title, subtitle, display, barColor, barPercent, onClick, expanded, jobs }) => (
  <div>
    <div
      onClick={onClick}
      className={`bg-[#111111] border rounded-lg p-5 transition-colors ${
        expanded ? 'border-[#6366f1]' : 'border-[#1f1f1f] hover:border-[#6366f1]'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-md bg-[#1a1a1a] flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-primary leading-none">{display}</span>
          {onClick && <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
        </div>
      </div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="text-xs text-text-muted mt-0.5 mb-3">{subtitle}</p>
      <div className="h-1.5 w-full rounded-full bg-[#1f1f1f] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(Math.max(barPercent, 0), 100)}%` }}
        />
      </div>
    </div>
    {/* Expandable per-job breakdown */}
    <AnimatePresence>
      {expanded && jobs && jobs.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="mt-1.5 bg-[#111111] border border-[#1f1f1f] rounded-lg p-4 space-y-2">
            {jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f] last:border-b-0">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-xs font-medium text-gray-300 truncate">{j.jobTitle}</p>
                  <p className="text-[10px] text-gray-500 truncate">{j.company}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(j.score, 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-10 text-right">
                    {j.score != null ? `${j.score.toFixed(0)}%` : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ── Compact pipeline dots ── */
const PipelineDots = ({ stages, currentStage }) => {
  const currentIdx = stages.findIndex((s) => s.name === currentStage);
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {stages.map((stage, i) => {
        const done = currentStage !== 'rejected' && currentIdx > i;
        const active = currentStage !== 'rejected' && currentIdx === i;
        return (
          <div key={stage.name} className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                done ? 'bg-accent' : active ? 'bg-primary ring-2 ring-primary/30' : 'bg-[#2a2a31]'
              }`}
              title={stage.label}
            />
            {i < stages.length - 1 && (
              <div className={`w-4 h-px ${done ? 'bg-accent/40' : 'bg-[#2a2a31]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(API + '/job/my-applications-stages', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
    const interval = setInterval(fetchApplications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  /* ── Summary stats ── */
  const totalApps = applications.length;
  const activeApps = applications.filter(
    (a) => a.currentStage !== 'rejected' && a.currentStage !== 'final'
  ).length;
  const selectedApps = applications.filter((a) => a.currentStage === 'final').length;

  const codingScores = applications.map((a) => a.testScore).filter((s) => s != null);
  const avgCoding = codingScores.length ? codingScores.reduce((a, b) => a + b, 0) / codingScores.length : 0;

  const overallScores = applications.map((a) => a.overallScore).filter((s) => s != null);
  const avgOverall = overallScores.length ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length : 0;

  /* Per-job score lists for expandable cards */
  const taskScoreJobs = applications
    .filter((a) => a.overallScore != null)
    .map((a) => ({ id: a._id, jobTitle: a.jobTitle, company: a.company, score: a.overallScore }));
  const codingScoreJobs = applications
    .filter((a) => a.testScore != null)
    .map((a) => ({ id: a._id, jobTitle: a.jobTitle, company: a.company, score: a.testScore }));

  if (loading) {
    return (
      <PageWrapper>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track your application progress.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </PageWrapper>
    );
  }

  if (applications.length === 0) {
    return (
      <PageWrapper>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track your application progress.</p>
        </div>
        <EmptyState
          title="No applications yet"
          description="Start applying to jobs to see your progress here."
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {totalApps} active application{totalApps !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          icon={Briefcase}
          title="Applications"
          subtitle={`${activeApps} in progress`}
          display={totalApps}
          barColor="bg-[#6366f1]"
          barPercent={totalApps ? (activeApps / totalApps) * 100 : 0}
        />
        <MetricCard
          icon={CheckCircle2}
          title="Current Status"
          subtitle={`${selectedApps} selected · ${activeApps} active`}
          display={selectedApps}
          barColor="bg-emerald-500"
          barPercent={totalApps ? (selectedApps / totalApps) * 100 : 0}
        />
        <MetricCard
          icon={ClipboardList}
          title="Task Score"
          subtitle={`${overallScores.length} scored`}
          display={avgOverall ? `${avgOverall.toFixed(0)}%` : '--'}
          barColor="bg-amber-500"
          barPercent={avgOverall}
          onClick={() => setExpandedCard(expandedCard === 'task' ? null : 'task')}
          expanded={expandedCard === 'task'}
          jobs={taskScoreJobs}
        />
        <MetricCard
          icon={Code2}
          title="Coding Score"
          subtitle={`${codingScores.length} completed`}
          display={avgCoding ? `${avgCoding.toFixed(0)}%` : '--'}
          barColor="bg-cyan-500"
          barPercent={avgCoding}
          onClick={() => setExpandedCard(expandedCard === 'coding' ? null : 'coding')}
          expanded={expandedCard === 'coding'}
          jobs={codingScoreJobs}
        />
      </div>

      {/* ── Section cards ── */}
      {(() => {
        const active = applications.filter((a) => a.currentStage !== 'rejected' && a.currentStage !== 'final');
        const completed = applications.filter((a) => a.currentStage === 'final').length;
        const rejected = applications.filter((a) => a.currentStage === 'rejected').length;

        /* Current stages grouped */
        const stageCounts = {};
        active.forEach((a) => {
          const label = a.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown';
          stageCounts[label] = (stageCounts[label] || 0) + 1;
        });

        /* Upcoming assessment = first active app with an actionable stage */
        const upcoming = active.find((a) => stageAction(a.currentStage, a, navigate));

        /* Recent activity = last 4 apps sorted by most recent */
        const recent = [...applications]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
          .slice(0, 4);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {/* Application Progress */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#6366f1] transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Application Progress</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">Overview of all your applications</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Active</span>
                  <span className="text-xs font-medium text-text-primary">{active.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Selected</span>
                  <span className="text-xs font-medium text-accent">{completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Rejected</span>
                  <span className="text-xs font-medium text-red-400">{rejected}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#1f1f1f] overflow-hidden mt-1 flex">
                  {totalApps > 0 && (
                    <>
                      <div className="h-full bg-[#6366f1]" style={{ width: `${(active.length / totalApps) * 100}%` }} />
                      <div className="h-full bg-emerald-500" style={{ width: `${(completed / totalApps) * 100}%` }} />
                      <div className="h-full bg-red-500" style={{ width: `${(rejected / totalApps) * 100}%` }} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Current Stage */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#6366f1] transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Current Stage</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">Where your active applications stand</p>
              {Object.keys(stageCounts).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stageCounts).map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-xs text-gray-300">{label}</span>
                      </div>
                      <Badge variant="primary">{count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No active stages</p>
              )}
            </div>

            {/* Upcoming Assessment */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#6366f1] transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Upcoming Assessment</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">Next action required from you</p>
              {upcoming ? (() => {
                const act = stageAction(upcoming.currentStage, upcoming, navigate);
                return (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300 truncate">{upcoming.jobTitle}</p>
                    <p className="text-xs text-gray-500">{upcoming.company}</p>
                    {act && (
                      <Button size="sm" icon={act.icon || ArrowRight} disabled={act.disabled} onClick={act.onClick} className="w-full mt-1">
                        {act.label}
                      </Button>
                    )}
                  </div>
                );
              })() : (
                <p className="text-xs text-text-muted">No pending assessments</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#6366f1] transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">Latest updates across applications</p>
              {recent.length > 0 ? (
                <div className="space-y-2.5">
                  {recent.map((a) => {
                    const SIcon = STAGE_ICON[a.currentStage] || Briefcase;
                    return (
                      <div key={a._id} className="flex items-center gap-2.5">
                        <SIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-300 truncate">{a.jobTitle}</p>
                        </div>
                        <Badge
                          variant={a.currentStage === 'rejected' ? 'danger' : a.currentStage === 'final' ? 'success' : 'default'}
                        >
                          {a.currentStage === 'final' ? 'Selected' : a.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No recent activity</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Application cards — 2-column grid */}
      <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {applications.map((app) => {
          const stages = app.pipelineStages?.length > 0 ? app.pipelineStages : FALLBACK_STAGES;
          const currentIdx = stages.findIndex((s) => s.name === app.currentStage);
          const action = stageAction(app.currentStage, app, navigate);
          const StageIcon = STAGE_ICON[app.currentStage] || Briefcase;

          return (
            <StaggerItem key={app._id}>
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#2a2a31] transition-colors h-full flex flex-col">
                {/* Card top */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <StageIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{app.jobTitle}</h3>
                    <p className="text-xs text-text-muted truncate">{app.company}</p>
                  </div>
                  {app.overallScore != null && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary flex items-center gap-0.5 shrink-0">
                      <Trophy className="w-3 h-3" /> {app.overallScore.toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Badge
                    variant={app.currentStage === 'rejected' ? 'danger' : app.currentStage === 'final' ? 'success' : 'primary'}
                    dot
                  >
                    {app.currentStage === 'final'
                      ? 'Selected'
                      : app.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                  {app.isShortlisted && <Badge variant="success">Shortlisted</Badge>}
                </div>

                {/* Pipeline dots */}
                <PipelineDots stages={stages} currentStage={app.currentStage} />

                {/* Spacer to push action to bottom */}
                <div className="flex-1" />

                {/* Action button */}
                {action && app.currentStage !== 'rejected' && app.currentStage !== 'final' && (
                  <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                    <Button
                      size="sm"
                      icon={action.icon || ArrowRight}
                      disabled={action.disabled}
                      onClick={action.onClick}
                      className="w-full"
                    >
                      {action.label}
                    </Button>
                  </div>
                )}

                {/* Rejected / Selected messages */}
                {app.currentStage === 'rejected' && (
                  <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                    <p className="text-xs text-red-400">Application not selected to proceed.</p>
                  </div>
                )}
                {app.currentStage === 'final' && (
                  <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                    <p className="text-xs text-accent font-medium">🎉 Congratulations! You've been selected.</p>
                  </div>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </PageWrapper>
  );
};

export default Dashboard;
