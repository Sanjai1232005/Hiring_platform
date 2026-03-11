import { useState } from 'react';
import axios from 'axios';
import { Plus, X, Send } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PageWrapper } from '../../components/animations/pageTransition';

const CreateJobs = () => {
  const [formData, setFormData] = useState({
    title: '', company: '', location: '',
    employmentType: 'Full-Time', experienceLevel: 'Fresher',
    assessmentStrategy: 'coding_only',
    description: '', responsibilities: [''], requirements: [''], skills: [''],
    salaryRange: { min: '', max: '', currency: 'INR' },
    deadline: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayField = (field) => setFormData({ ...formData, [field]: [...formData[field], ''] });

  const removeArrayField = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated.length ? updated : [''] });
  };

  const handleSalaryChange = (e) => {
    setFormData({ ...formData, salaryRange: { ...formData.salaryRange, [e.target.name]: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/hr/create', formData, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Job created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating job');
    } finally {
      setLoading(false);
    }
  };

  const ArrayField = ({ label, field }) => (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <div className="space-y-2">
        {formData[field].map((val, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={val}
              onChange={(e) => handleArrayChange(field, i, e.target.value)}
              placeholder={label.slice(0, -1) + ' ' + (i + 1)}
              className="flex-1 px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
            {formData[field].length > 1 && (
              <button type="button" onClick={() => removeArrayField(field, i)}
                className="p-2.5 text-text-muted hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => addArrayField(field)}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-2 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add {label.slice(0, -1)}
      </button>
    </div>
  );

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Create Job Posting</h1>

        <form onSubmit={handleSubmit} className="bg-surface-100 border border-border rounded-lg p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Job Title" name="title" value={formData.title} onChange={handleChange} required placeholder="Software Engineer" />
            <Input label="Company" name="company" value={formData.company} onChange={handleChange} required placeholder="Acme Inc" />
          </div>

          <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="Remote / Bangalore" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange}>
              <option>Full-Time</option><option>Part-Time</option><option>Internship</option><option>Contract</option>
            </Select>
            <Select label="Experience Level" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
              <option>Fresher</option><option>Junior</option><option>Mid-Level</option><option>Senior</option><option>Lead</option>
            </Select>
          </div>

          <div>
            <Select label="Assessment Strategy" name="assessmentStrategy" value={formData.assessmentStrategy} onChange={handleChange}>
              <option value="coding_only">Coding Test Only</option>
              <option value="task_only">Task Assessment Only</option>
              <option value="coding_then_task">Coding Test → Task Assessment</option>
              <option value="task_then_coding">Task Assessment → Coding Test</option>
              <option value="none">No Assessment</option>
            </Select>
            <p className="text-xs text-text-muted mt-1">
              {formData.assessmentStrategy === 'coding_only' && 'Candidates will complete a coding test only.'}
              {formData.assessmentStrategy === 'task_only' && 'Candidates will complete a task assessment only.'}
              {formData.assessmentStrategy === 'coding_then_task' && 'Candidates take a coding test first, then a task assessment.'}
              {formData.assessmentStrategy === 'task_then_coding' && 'Candidates complete a task assessment first, then a coding test.'}
              {formData.assessmentStrategy === 'none' && 'No automated assessments — manual screening only.'}
            </p>
          </div>

          <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Job description..." />

          <ArrayField label="Responsibilities" field="responsibilities" />
          <ArrayField label="Requirements" field="requirements" />
          <ArrayField label="Skills" field="skills" />

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Salary Range</label>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" name="min" placeholder="Min" value={formData.salaryRange.min} onChange={handleSalaryChange}
                className="px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors" />
              <input type="number" name="max" placeholder="Max" value={formData.salaryRange.max} onChange={handleSalaryChange}
                className="px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors" />
              <select name="currency" value={formData.salaryRange.currency} onChange={handleSalaryChange}
                className="px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors">
                <option>INR</option><option>USD</option><option>EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Deadline</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange}
              className="px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors" />
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg" icon={Send}>
            Create Job
          </Button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default CreateJobs;
