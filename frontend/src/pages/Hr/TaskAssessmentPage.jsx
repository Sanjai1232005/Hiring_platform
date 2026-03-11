import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Loader2 } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import CreateTaskAssessment, { TaskAssessmentList } from './CreateTaskAssessment';
import { Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper } from '../../components/animations/pageTransition';

const TaskAssessmentPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Task Assessments</h1>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Create a job first before adding task assessments."
            icon={ClipboardList}
          />
        ) : (
          <div className="space-y-6">
            {/* Job Selector */}
            <div className="bg-surface-100 border border-border rounded-lg p-6">
              <Select
                label="Select Job"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                <option value="">Choose a job...</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} — {job.company}
                  </option>
                ))}
              </Select>
            </div>

            {selectedJobId && (
              <>
                {/* Existing Assessments */}
                <div className="bg-surface-100 border border-border rounded-lg p-6">
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                    Existing Task Assessments
                  </h2>
                  <TaskAssessmentList key={refreshKey} jobId={selectedJobId} />
                </div>

                {/* Create New */}
                <div className="bg-surface-100 border border-border rounded-lg p-6">
                  <CreateTaskAssessment
                    jobId={selectedJobId}
                    onTaskCreated={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default TaskAssessmentPage;
