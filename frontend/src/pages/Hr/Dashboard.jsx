import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, ChevronRight, CheckCircle2, Clock, Circle } from 'lucide-react';
import ResumeScreening from './stages/ResumeScreening';
import ProfileReview from './stages/ProfileReview';
import CodingTest from './stages/CodingTest';
import TestEvaluation from './stages/TestEvaluation';
import Interview from './stages/Interview';
import BASE_URL from '../../apiConfig';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

const stages = [
  { key: 'resume', label: 'Resume Screening', component: ResumeScreening },
  { key: 'profile', label: 'Profile Review', component: ProfileReview },
  { key: 'coding', label: 'Coding Test', component: CodingTest },
  { key: 'evaluation', label: 'Test Evaluation', component: TestEvaluation },
  { key: 'interview', label: 'Interview', component: Interview },
];

const HRDashboard = () => {
  const [hrData, setHrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchHrJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/getjobs', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setHrData(res.data.jobs || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHrJobs();
  }, []);

  const handleJobSelect = (job) => setSelectedJob(job);

  const renderStageComponent = () => {
    if (!selectedJob) return null;
    const stageObj = stages.find((s) => s.key === selectedJob.stage);
    if (!stageObj) return <p className="text-text-muted">Unknown Stage</p>;
    const StageComponent = stageObj.component;
    return <StageComponent job={selectedJob} />;
  };

  const renderStageTracker = () => {
    if (!selectedJob) return null;
    const currentIndex = stages.findIndex((s) => s.key === selectedJob.stage);

    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          return (
            <div key={stage.key} className="flex items-center gap-2 shrink-0">
              <div className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
                (completed ? 'bg-accent/10 text-accent' : current ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'bg-surface-200 text-text-muted')}>
                {completed ? <CheckCircle2 className="w-4 h-4" /> : current ? <Clock className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
                {stage.label}
              </div>
              {index < stages.length - 1 && <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return (
    <PageWrapper>
      <div className="space-y-4">
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    </PageWrapper>
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-72 border-r border-border bg-surface-100 p-4 overflow-y-auto shrink-0">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Your Jobs</h2>
        {hrData.length === 0 ? (
          <p className="text-text-muted text-sm">No jobs created yet</p>
        ) : (
          <div className="space-y-2">
            {hrData.map((job) => (
              <button
                key={job._id}
                onClick={() => handleJobSelect(job)}
                className={'w-full text-left p-3 rounded-lg border transition-colors ' +
                  (selectedJob?._id === job._id
                    ? 'bg-primary/10 border-primary/30 text-text-primary'
                    : 'bg-surface-200 border-border text-text-secondary hover:border-border-light')}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{job.title}</p>
                    <p className="text-xs text-text-muted truncate">{job.company}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedJob ? (
          <PageWrapper>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">{selectedJob.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-text-muted text-sm">Current stage:</span>
                <Badge variant="primary">{selectedJob.stage?.toUpperCase()}</Badge>
              </div>
            </div>

            {/* Stage Tracker */}
            <div className="bg-surface-100 border border-border rounded-lg p-4 mb-6">
              {renderStageTracker()}
            </div>

            {/* Stage Content */}
            <div className="bg-surface-100 border border-border rounded-lg p-6">
              {renderStageComponent()}
            </div>
          </PageWrapper>
        ) : (
          <EmptyState
            title="Select a job"
            description="Choose a job from the sidebar to view its recruitment pipeline"
            icon={Briefcase}
          />
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
