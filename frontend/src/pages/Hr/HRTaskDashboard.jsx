import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Loader2, Users, BarChart3 } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import { Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import CandidateEvaluationCard from '../../components/ui/CandidateEvaluationCard';
import { PageWrapper } from '../../components/animations/pageTransition';

const HRTaskDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [results, setResults] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

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
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setResults(null);
      return;
    }
    const fetchResults = async () => {
      try {
        setLoadingResults(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/tasks/results/' + selectedJobId, {
          headers: { Authorization: 'Bearer ' + token },
        });
        setResults(res.data?.data || null);
      } catch (err) {
        console.error('Error fetching task results:', err);
        setResults(null);
      } finally {
        setLoadingResults(false);
      }
    };
    fetchResults();
  }, [selectedJobId]);

  const handleAnalyze = async (candidateId, assessmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        BASE_URL + '/tasks/analyzeExplanation',
        { candidateId, jobId: selectedJobId, assessmentId },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      // Refresh results to pick up new analysis
      const res = await axios.get(BASE_URL + '/tasks/results/' + selectedJobId, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setResults(res.data?.data || null);
    } catch (err) {
      console.error('Error running analysis:', err);
      alert('Analysis failed. Make sure the ML service is running.');
    }
  };

  if (loadingJobs) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs...
        </div>
      </PageWrapper>
    );
  }

  const candidates = results?.candidates || [];
  const assessmentCount = results?.assessments?.length || 0;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-violet-400/20 border border-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Task Assessment Results</h1>
            <p className="text-sm text-text-secondary">Review candidate submissions &amp; AI analysis</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Create a job first to view task assessment results."
            icon={ClipboardList}
          />
        ) : (
          <div className="space-y-6">
            {/* Job Selector */}
            <div className="bg-surface-100 border border-border rounded-xl p-5">
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

            {/* Loading Results */}
            {loadingResults && (
              <div className="flex items-center gap-2 text-text-muted text-sm py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading results...
              </div>
            )}

            {/* Results */}
            {selectedJobId && !loadingResults && (
              <>
                {/* Stats Bar */}
                <div className="flex items-center gap-4 bg-surface-100 border border-border rounded-xl px-5 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-text-primary">{candidates.length}</span> Candidate{candidates.length !== 1 ? 's' : ''}
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    <span className="font-medium text-text-primary">{assessmentCount}</span> Assessment{assessmentCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Candidate Cards */}
                {candidates.length === 0 ? (
                  <EmptyState
                    title="No submissions yet"
                    description="No candidates have submitted task assessments for this job."
                    icon={Users}
                  />
                ) : (
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <CandidateEvaluationCard
                        key={c.candidateId}
                        candidate={c}
                        onAnalyze={handleAnalyze}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default HRTaskDashboard;
