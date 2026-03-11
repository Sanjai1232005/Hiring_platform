import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Clock, Briefcase, Building2, Search, ArrowRight } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';

const PostJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const parseJwt = (token) => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = parseJwt(token);
    setRole(decoded?.role || '');
  }, []);

  const fetchJobs = async (filterDays = '') => {
    try {
      setLoading(true);
      let url = BASE_URL + '/job/alljob';
      if (filterDays) url += '?days=' + filterDays;
      const res = await axios.get(url);
      setJobs(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const getTimeElapsed = (dateString) => {
    if (!dateString) return 'Recently';
    const diff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1d ago';
    return diff + 'd ago';
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Explore <span className="text-primary">{jobs.length}</span> Jobs
        </h1>
        <p className="text-text-secondary mt-1">Full-time roles from startups to top companies</p>

        <div className="mt-4 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="number"
              placeholder="Posted in last X days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-100 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
          <Button onClick={() => fetchJobs(days)} size="md">Filter</Button>
        </div>
      </div>

      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      {/* Job List */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your filters" />
      ) : (
        <StaggerList className="space-y-3">
          {jobs.map((job) => (
            <StaggerItem key={job._id}>
              <div className="bg-surface-100 border border-border rounded-lg p-5 hover:border-border-light transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <span className="text-xs text-primary">{getTimeElapsed(job.createdAt)}</span>
                    </div>
                    <p className="text-text-secondary text-sm">{job.company}</p>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.experience || 'Fresher'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.jobType || 'Full Time'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="w-10 h-10 bg-surface-200 border border-border rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-text-muted" />
                  </div>
                </div>

                <p className="text-text-muted text-sm mt-3 line-clamp-2">{job.description}</p>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                  {job.salaryRange?.min && job.salaryRange?.max ? (
                    <Badge variant="success">{job.salaryRange.min} - {job.salaryRange.max} LPA</Badge>
                  ) : <span />}

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate((role === 'hr' ? '/hr/jobs/' : '/jobs/') + job._id)}>
                      Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    {role !== 'hr' && (
                      <Button size="sm" onClick={() => navigate('/student/apply/' + job._id, { state: job })}>
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageWrapper>
  );
};

export default PostJob;
