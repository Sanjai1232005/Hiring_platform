import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Clock, Code2, ClipboardList, Video, ArrowRight, Trophy } from 'lucide-react';
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

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <PageWrapper>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Track your application progress.</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </PageWrapper>
    );
  }

  if (applications.length === 0) {
    return (
      <PageWrapper>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Track your application progress.</p>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          {applications.length} active application{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      <StaggerList className="space-y-4">
        {applications.map((app) => {
          const stages = app.pipelineStages?.length > 0 ? app.pipelineStages : FALLBACK_STAGES;
          const currentIdx = stages.findIndex((s) => s.name === app.currentStage);
          const action = stageAction(app.currentStage, app, navigate);

          return (
            <StaggerItem key={app._id}>
              <div className="bg-surface-100 border border-border rounded-lg p-6 hover:border-border-light transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{app.jobTitle}</h2>
                    <p className="text-sm text-text-secondary">{app.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.overallScore != null && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {app.overallScore.toFixed(1)}%
                      </span>
                    )}
                    <Badge
                      variant={app.currentStage === 'rejected' ? 'danger' : app.currentStage === 'final' ? 'success' : 'primary'}
                      dot
                    >
                      {app.currentStage === 'final' ? 'Selected' : app.currentStage?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                    {app.isShortlisted && <Badge variant="success">Shortlisted</Badge>}
                  </div>
                </div>

                {/* Pipeline stepper */}
                <div className="relative flex items-center justify-between mt-6">
                  <div className="absolute top-4 left-0 right-0 h-px bg-border" />
                  {stages.map((stage, index) => {
                    let status = 'pending';
                    if (app.currentStage === 'rejected') {
                      status = 'pending';
                    } else if (currentIdx > index) {
                      status = 'completed';
                    } else if (currentIdx === index) {
                      status = 'current';
                    }

                    return (
                      <div key={stage.name} className="flex flex-col items-center relative z-10 flex-1">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium border transition-all ${
                          status === 'completed' ? 'bg-accent/10 border-accent/30 text-accent' :
                          status === 'current' ? 'bg-primary/10 border-primary/30 text-primary animate-pulse' :
                          'bg-surface-200 border-border text-text-muted'
                        }`}>
                          {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                           status === 'current' ? <Clock className="w-4 h-4" /> :
                           index + 1}
                        </div>
                        <p className={`text-xs mt-2 ${status === 'current' ? 'text-primary font-medium' : 'text-text-muted'}`}>
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Action button for current stage */}
                {action && app.currentStage !== 'rejected' && app.currentStage !== 'final' && (
                  <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      icon={action.icon || ArrowRight}
                      disabled={action.disabled}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                    <span className="text-xs text-text-muted">
                      Action required for the <span className="text-primary font-medium">{stages[currentIdx]?.label}</span> stage
                    </span>
                  </div>
                )}

                {/* Rejected / Final messages */}
                {app.currentStage === 'rejected' && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-red-400">Your application was not selected to proceed further.</p>
                  </div>
                )}
                {app.currentStage === 'final' && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-accent font-medium">🎉 Congratulations! You have been selected.</p>
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
