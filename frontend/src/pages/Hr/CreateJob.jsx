import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Briefcase, MapPin, Building2, Users, FileText, ListChecks,
  GraduationCap, Target, Code2, Gift, DollarSign, CalendarDays,
  ChevronDown, Plus, X, Sparkles, AlertCircle, CheckCircle2,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ── tiny helpers ── */
const INITIAL = {
  title: '', company: '', department: '', location: '',
  workMode: 'Remote', employmentType: 'Full-Time', experienceLevel: 'Fresher',
  openPositions: 1, assessmentStrategy: 'coding_only',
  description: '',
  responsibilities: [''], requirements: [''], niceToHave: [''],
  skills: [], benefits: [],
  salaryRange: { min: '', max: '', currency: 'INR' },
  deadline: '',
};

const STRATEGY_HINTS = {
  coding_only:      'Candidates will complete a coding test only.',
  task_only:        'Candidates will complete a task assessment only.',
  coding_then_task: 'Candidates take a coding test first, then a task assessment.',
  task_then_coding: 'Candidates complete a task assessment first, then a coding test.',
  none:             'No automated assessments — manual screening only.',
};

/* ── reusable sub-components (defined OUTSIDE the main component to avoid re-mount) ── */

/** Numbered list input (responsibilities / requirements / niceToHave) */
const ListInput = ({ items, onChange, onAdd, onRemove, placeholder, icon: Icon }) => (
  <div className="space-y-2">
    {items.map((val, i) => (
      <div key={i} className="flex items-start gap-2 group">
        <span className="shrink-0 w-6 h-9 flex items-center justify-center text-[11px] font-bold text-text-muted">
          {i + 1}.
        </span>
        <input
          value={val}
          onChange={(e) => onChange(i, e.target.value)}
          placeholder={`${placeholder} ${i + 1}`}
          className="flex-1 px-3 py-2 bg-surface-200 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
        />
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="shrink-0 p-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    ))}
    <button
      type="button"
      onClick={onAdd}
      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 mt-1 ml-8 transition-colors"
    >
      <Plus className="w-3 h-3" /> Add item
    </button>
  </div>
);

/** Chip / tag input (skills, benefits) — type + Enter */
const ChipInput = ({ chips, onChange, placeholder }) => {
  const inputRef = useRef(null);

  const add = (raw) => {
    const val = raw.trim();
    if (val && !chips.includes(val)) onChange([...chips, val]);
  };

  const remove = (idx) => onChange(chips.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(e.target.value);
      e.target.value = '';
    }
    if (e.key === 'Backspace' && !e.target.value && chips.length) {
      remove(chips.length - 1);
    }
  };

  return (
    <div
      className="min-h-[42px] flex flex-wrap items-center gap-1.5 px-3 py-2 bg-surface-200 border border-border rounded-lg focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-colors cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {chips.map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 border border-primary/25 text-xs font-medium text-primary"
        >
          {c}
          <button type="button" onClick={() => remove(i)} className="hover:text-red-400 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onBlur={(e) => { add(e.target.value); e.target.value = ''; }}
        placeholder={chips.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
      />
    </div>
  );
};

/** Collapsible section */
const Section = ({ icon: Icon, title, subtitle, open, onToggle, children, badge }) => (
  <div className="border border-border rounded-xl overflow-hidden bg-surface-100">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-200/50 transition-colors"
    >
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent/15 text-accent">{badge}</span>
          )}
        </div>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/50">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ═══════════════════════════════════════ MAIN COMPONENT ═══════════════════════════════════════ */

const CreateJobs = () => {
  const [formData, setFormData] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, details: true, skills: false, comp: false, assessment: false });

  /* ── field helpers ── */
  const set = useCallback((patch) => setFormData((p) => ({ ...p, ...patch })), []);
  const handleChange = (e) => set({ [e.target.name]: e.target.value });

  const handleArrayChange = useCallback((field, index, value) => {
    setFormData((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const addArrayItem = useCallback((field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  }, []);

  const removeArrayItem = useCallback((field, index) => {
    setFormData((prev) => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length ? arr : [''] };
    });
  }, []);

  const handleSalaryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      salaryRange: { ...prev.salaryRange, [e.target.name]: e.target.value },
    }));
  };

  const toggle = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Job title is required';
    if (!formData.company.trim()) e.company = 'Company name is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (formData.salaryRange.min && formData.salaryRange.max && Number(formData.salaryRange.min) > Number(formData.salaryRange.max)) {
      e.salary = 'Min salary cannot exceed max';
    }
    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      e.deadline = 'Deadline must be in the future';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities.filter(Boolean),
        requirements: formData.requirements.filter(Boolean),
        niceToHave: formData.niceToHave.filter(Boolean),
        openPositions: Number(formData.openPositions) || 1,
      };
      await axios.post(BASE_URL + '/hr/create', payload, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setSuccess(true);
      setFormData(INITIAL);
      setOpenSections({ basic: true, details: true, skills: false, comp: false, assessment: false });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create job' });
    } finally {
      setLoading(false);
    }
  };

  /* ── count filled fields for section badges ── */
  const skillCount = formData.skills.length + formData.benefits.length +
    formData.requirements.filter(Boolean).length + formData.niceToHave.filter(Boolean).length +
    formData.responsibilities.filter(Boolean).length;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Create Job Posting</h1>
            <p className="text-xs text-text-muted mt-0.5">Fill out the sections below to publish a new position</p>
          </div>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Job posting created successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit error */}
        {errors.submit && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ─── SECTION 1: Basic Info ─── */}
          <Section
            icon={Building2}
            title="Basic Information"
            subtitle="Job title, company, and location"
            open={openSections.basic}
            onToggle={() => toggle('basic')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Job Title" name="title" value={formData.title} onChange={handleChange}
                required placeholder="e.g. Senior Frontend Engineer" error={errors.title} />
              <Input label="Company" name="company" value={formData.company} onChange={handleChange}
                required placeholder="e.g. Acme Technologies" error={errors.company} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Department" name="department" value={formData.department} onChange={handleChange}
                placeholder="e.g. Engineering, Product, Design" icon={Users} />
              <Input label="Location" name="location" value={formData.location} onChange={handleChange}
                placeholder="e.g. Bangalore, Mumbai" icon={MapPin} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Work Mode" name="workMode" value={formData.workMode} onChange={handleChange}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </Select>
              <Select label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange}>
                <option>Full-Time</option><option>Part-Time</option><option>Internship</option><option>Contract</option>
              </Select>
              <Select label="Experience Level" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                <option>Fresher</option><option>Junior</option><option>Mid-Level</option><option>Senior</option><option>Lead</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Open Positions</label>
                <input
                  type="number" min="1" name="openPositions" value={formData.openPositions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-100 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 hover:border-border-light transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Application Deadline</label>
                <input
                  type="date" name="deadline" value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-100 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 hover:border-border-light transition-all"
                />
                {errors.deadline && <p className="text-xs text-red-400 mt-1">{errors.deadline}</p>}
              </div>
            </div>
          </Section>

          {/* ─── SECTION 2: Job Details ─── */}
          <Section
            icon={FileText}
            title="Job Details"
            subtitle="Description and what the role involves"
            open={openSections.details}
            onToggle={() => toggle('details')}
          >
            <Textarea
              label="Job Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Provide a compelling overview of the role, team, and impact the candidate will make..."
              error={errors.description}
            />

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                <ListChecks className="w-4 h-4 text-primary" />
                Key Responsibilities
              </label>
              <ListInput
                items={formData.responsibilities}
                onChange={(i, v) => handleArrayChange('responsibilities', i, v)}
                onAdd={() => addArrayItem('responsibilities')}
                onRemove={(i) => removeArrayItem('responsibilities', i)}
                placeholder="Responsibility"
              />
            </div>
          </Section>

          {/* ─── SECTION 3: Requirements & Skills ─── */}
          <Section
            icon={Target}
            title="Requirements & Skills"
            subtitle="What candidates need and what's nice to have"
            open={openSections.skills}
            onToggle={() => toggle('skills')}
            badge={skillCount > 0 ? `${skillCount} items` : null}
          >
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                <GraduationCap className="w-4 h-4 text-primary" />
                Must-Have Requirements
              </label>
              <ListInput
                items={formData.requirements}
                onChange={(i, v) => handleArrayChange('requirements', i, v)}
                onAdd={() => addArrayItem('requirements')}
                onRemove={(i) => removeArrayItem('requirements', i)}
                placeholder="Requirement"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                Nice to Have
              </label>
              <ListInput
                items={formData.niceToHave}
                onChange={(i, v) => handleArrayChange('niceToHave', i, v)}
                onAdd={() => addArrayItem('niceToHave')}
                onRemove={(i) => removeArrayItem('niceToHave', i)}
                placeholder="Nice to have"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                <Code2 className="w-4 h-4 text-primary" />
                Required Skills
                <span className="text-[10px] text-text-muted font-normal">(press Enter or comma to add)</span>
              </label>
              <ChipInput
                chips={formData.skills}
                onChange={(v) => set({ skills: v })}
                placeholder="e.g. React, Node.js, TypeScript..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                <Gift className="w-4 h-4 text-accent" />
                Benefits & Perks
                <span className="text-[10px] text-text-muted font-normal">(press Enter or comma to add)</span>
              </label>
              <ChipInput
                chips={formData.benefits}
                onChange={(v) => set({ benefits: v })}
                placeholder="e.g. Health Insurance, Stock Options, Remote Work..."
              />
            </div>
          </Section>

          {/* ─── SECTION 4: Compensation ─── */}
          <Section
            icon={DollarSign}
            title="Compensation"
            subtitle="Salary range and currency"
            open={openSections.comp}
            onToggle={() => toggle('comp')}
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Min Salary</label>
                <input
                  type="number" name="min" placeholder="e.g. 800000" value={formData.salaryRange.min}
                  onChange={handleSalaryChange}
                  className="w-full px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Max Salary</label>
                <input
                  type="number" name="max" placeholder="e.g. 1500000" value={formData.salaryRange.max}
                  onChange={handleSalaryChange}
                  className="w-full px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Currency</label>
                <select
                  name="currency" value={formData.salaryRange.currency} onChange={handleSalaryChange}
                  className="w-full px-3 py-2.5 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                >
                  <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
                </select>
              </div>
            </div>
            {errors.salary && <p className="text-xs text-red-400">{errors.salary}</p>}
            {formData.salaryRange.min && formData.salaryRange.max && (
              <p className="text-xs text-text-muted">
                Range: {Number(formData.salaryRange.min).toLocaleString()} – {Number(formData.salaryRange.max).toLocaleString()} {formData.salaryRange.currency} / year
              </p>
            )}
          </Section>

          {/* ─── SECTION 5: Assessment Strategy ─── */}
          <Section
            icon={CalendarDays}
            title="Assessment Pipeline"
            subtitle="How candidates will be evaluated"
            open={openSections.assessment}
            onToggle={() => toggle('assessment')}
          >
            <Select label="Assessment Strategy" name="assessmentStrategy" value={formData.assessmentStrategy} onChange={handleChange}>
              <option value="coding_only">Coding Test Only</option>
              <option value="task_only">Task Assessment Only</option>
              <option value="coding_then_task">Coding Test → Task Assessment</option>
              <option value="task_then_coding">Task Assessment → Coding Test</option>
              <option value="none">No Assessment (Manual Screening)</option>
            </Select>
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {STRATEGY_HINTS[formData.assessmentStrategy]}
            </p>
          </Section>

          {/* ─── Submit ─── */}
          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full" size="lg" icon={Send}>
              Publish Job Posting
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default CreateJobs;
