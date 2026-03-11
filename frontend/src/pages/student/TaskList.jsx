import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, ChevronRight, Loader2 } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { PageWrapper } from '../../components/animations/pageTransition';
import EmptyState from '../../components/ui/EmptyState';

const StudentTaskList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/my-applications-stages', {
          headers: { Authorization: 'Bearer ' + token },
        });
        // Show jobs that are in coding stage or beyond
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
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Task Assessments</h1>
        <p className="text-text-secondary text-sm mb-6">
          View and complete task assessments for your applied jobs.
        </p>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications"
            description="Apply to jobs first to see task assessments."
            icon={ClipboardList}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <button
                key={app._id}
                onClick={() => navigate('/student/task-assessment/' + app.jobId)}
                className="w-full text-left bg-surface-100 border border-border rounded-lg p-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {app.jobTitle}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">{app.company}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default StudentTaskList;
