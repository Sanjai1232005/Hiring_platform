import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock } from 'lucide-react';
import API from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import { SkeletonCard } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const stages = ['resume', 'test', 'interview', 'final', 'rejected'];

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

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
    const interval = setInterval(fetchApplications, 5000);
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
        {applications.map((app) => (
          <StaggerItem key={app._id}>
            <div className="bg-surface-100 border border-border rounded-lg p-6 hover:border-border-light transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">{app.jobTitle}</h2>
                  <p className="text-sm text-text-secondary">{app.company}</p>
                </div>
                <Badge
                  variant={app.currentStage === 'rejected' ? 'danger' : app.currentStage === 'final' ? 'success' : 'primary'}
                  dot
                >
                  {app.currentStage}
                </Badge>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="absolute top-4 left-0 right-0 h-px bg-border" />
                {stages.map((stage, index) => {
                  let status = 'pending';
                  if (stages.indexOf(app.currentStage) > index) status = 'completed';
                  else if (stages.indexOf(app.currentStage) === index) status = 'current';

                  return (
                    <div key={stage} className="flex flex-col items-center relative z-10 flex-1">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium border ${status === 'completed' ? 'bg-accent/10 border-accent/30 text-accent' : status === 'current' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-200 border-border text-text-muted'}`}>
                        {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                         status === 'current' ? <Clock className="w-4 h-4" /> :
                         index + 1}
                      </div>
                      <p className="text-xs text-text-muted mt-2 capitalize">{stage}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerList>
    </PageWrapper>
  );
};

export default Dashboard;
