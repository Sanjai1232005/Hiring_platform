import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Clock, Briefcase, Building2, DollarSign, ArrowLeft, Send } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Button from '../../components/ui/Button';
import { PageWrapper } from '../../components/animations/pageTransition';
import Loader from '../../components/ui/Loader';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [role, setRole] = useState('');

  const parseJwt = (token) => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  };

  useEffect(() => {
    axios.get(BASE_URL + '/job/' + id).then((res) => setJob(res.data));
    const token = localStorage.getItem('token');
    const decoded = parseJwt(token);
    setRole(decoded?.role || '');
  }, [id]);

  if (!job) return <Loader />;

  const sections = [
    { title: 'Description', content: job.description },
    { title: 'Requirements', content: job.requirements },
    { title: 'Responsibilities', content: job.responsibilities },
  ].filter(s => s.content);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Left */}
        <div className="md:col-span-2 space-y-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Header */}
          <div className="bg-surface-100 border border-border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{job.title}</h1>
                <p className="text-text-secondary mt-1">{job.company}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.experience || 'Fresher'}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{job.jobType || 'Full Time'}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location || 'Remote'}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-surface-200 border border-border rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-text-muted" />
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((s, i) => (
            <div key={i} className="bg-surface-100 border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">{s.title}</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div>
          <div className="bg-surface-100 border border-border rounded-lg p-6 sticky top-6">
            <h3 className="text-base font-semibold text-text-primary mb-4">Job Overview</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Experience', value: job.experience || 'Fresher' },
                { label: 'Job Type', value: job.jobType || 'Full Time' },
                { label: 'Location', value: job.location || 'Remote' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
              {job.salaryRange?.min && job.salaryRange?.max && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-text-muted flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Salary</span>
                  <span className="text-accent font-semibold">{job.salaryRange.min} - {job.salaryRange.max} LPA</span>
                </div>
              )}
            </div>

            {role !== 'hr' && (
              <Button
                className="w-full mt-6"
                size="lg"
                icon={Send}
                onClick={() => navigate('/student/apply/' + job._id, { state: job })}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default JobDetails;
