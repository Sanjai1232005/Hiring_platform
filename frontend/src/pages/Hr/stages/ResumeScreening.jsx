import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';

const ResumeScreening = ({ job, onStageUpdate }) => {
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!job) return;
    const fetchApplicants = async () => {
      try {
        setLoadingApplicants(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/students/' + job._id, {
          headers: { Authorization: 'Bearer ' + token },
        });
        setApplicants(res.data || []);
      } catch (err) {
        console.error('Error fetching applicants:', err);
      } finally {
        setLoadingApplicants(false);
      }
    };
    fetchApplicants();
  }, [job]);

  const handleProcessResumes = async () => {
    if (!job) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/job/' + job._id + '/resume-screen', {}, {
        headers: { Authorization: 'Bearer ' + token },
      });
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChange', { stage: 'profile' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Resume screening completed successfully!');
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error('Error processing resumes:', err);
      alert('Failed to process resumes.');
    } finally {
      setProcessing(false);
    }
  };

  if (!job) return <p className="text-text-muted">No job selected.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Resume Screening</h3>
      <p className="text-text-secondary text-sm mb-4">
        Processing resumes for <span className="text-text-primary font-medium">{job.title}</span>
      </p>

      <Button onClick={handleProcessResumes} loading={processing} className="mb-6">
        {processing ? 'Processing...' : 'Process Resumes'}
      </Button>

      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
        Applicants ({applicants.length})
      </h4>

      {loadingApplicants ? (
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : applicants.length === 0 ? (
        <p className="text-text-muted text-sm">No applicants found.</p>
      ) : (
        <div className="space-y-2">
          {applicants.map((student) => (
            <div key={student._id}
              className="flex items-center justify-between p-3 bg-surface-200 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-text-primary">{student.userId?.name}</p>
                <p className="text-xs text-text-muted">{student.userId?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/' + student.userId?._id)} icon={Eye}>
                Profile
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeScreening;
