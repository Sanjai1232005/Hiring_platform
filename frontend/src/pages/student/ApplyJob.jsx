import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Upload, Send } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import uploadToCloudinary from '../../services/cloudinary.service';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PageWrapper } from '../../components/animations/pageTransition';

const ApplyPage = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state;

  const [form, setForm] = useState({ name: '', email: '', resume: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.resume) { setError('Please upload your resume (PDF).'); return; }

    try {
      setLoading(true);
      const resumeLink = await uploadToCloudinary(form.resume, 'raw');
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/job/apply/' + jobId,
        { name: form.name, email: form.email, resumeLink },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      alert('Application submitted successfully!');
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Apply for {job?.title}</h1>
          <p className="text-text-secondary mt-1">{job?.company}</p>
        </div>

        {/* Job Info */}
        <div className="bg-surface-100 border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-text-muted">Location</p>
              <p className="text-text-primary font-medium">{job?.location || 'Remote'}</p>
            </div>
            <div>
              <p className="text-text-muted">Type</p>
              <p className="text-text-primary font-medium">{job?.employmentType || 'Full-time'}</p>
            </div>
            {job?.salaryRange?.min && (
              <div>
                <p className="text-text-muted">Salary</p>
                <p className="text-accent font-medium">{job.salaryRange.min} - {job.salaryRange.max}</p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-100 border border-border rounded-lg p-6 space-y-5">
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Upload Resume (PDF)</label>
            <label className="flex items-center gap-2 px-4 py-3 bg-surface-200 border border-dashed border-border rounded-lg cursor-pointer hover:border-border-light transition-colors text-sm text-text-muted">
              <Upload className="w-4 h-4" />
              {form.resume ? form.resume.name : 'Choose PDF file'}
              <input type="file" name="resume" accept=".pdf" onChange={handleChange} required className="hidden" />
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg" icon={Send}>
            Submit Application
          </Button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ApplyPage;
