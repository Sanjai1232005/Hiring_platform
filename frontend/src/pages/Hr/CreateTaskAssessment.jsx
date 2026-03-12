import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Send, Clock, FileText, Trash2, CheckCircle2, Loader2,
  ChevronDown, ChevronUp, Link2, Layers, Target, Code2, BookOpen, BarChart3,
  Sparkles, GripVertical, AlertCircle, Eye, Shield, Zap,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const DIFFICULTY_OPTIONS = [
  { value: 'junior', label: 'Junior', icon: '🌱', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { value: 'mid', label: 'Mid-Level', icon: '⚡', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'senior', label: 'Senior', icon: '🔥', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { value: 'staff', label: 'Staff / Lead', icon: '💎', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
];

const emptyTask = () => ({
  title: '',
  description: '',
  context: '',
  requirements: [''],
  evaluationCriteria: [''],
  techStack: [],
  difficulty: 'mid',
  resources: [],
  expectedDeliverable: '',
  timeLimit: 60,
});

/* ── Chip input for tech stack ── */
const ChipInput = ({ label, icon: Icon, chips, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const val = input.trim();
    if (val && !chips.includes(val)) { onChange([...chips, val]); }
    setInput('');
  };
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      )}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <AnimatePresence>
          {chips.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
            >
              {c}
              <button onClick={() => onChange(chips.filter((_, j) => j !== i))} className="text-primary/60 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={placeholder}
            icon={Icon}
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={!input.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
};

/* ── Multi-line list input for requirements / criteria ── */
const ListInput = ({ label, icon: Icon, items, onChange, placeholder }) => {
  const update = (i, val) => { const u = [...items]; u[i] = val; onChange(u); };
  const remove = (i) => { onChange(items.filter((_, j) => j !== i)); };
  const add = () => { onChange([...items, '']); };
  const filledCount = items.filter((x) => x.trim()).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-text-secondary">{label}</label>
        {filledCount > 0 && (
          <span className="text-[10px] font-bold text-text-muted bg-surface-300 px-1.5 py-0.5 rounded">{filledCount} item{filledCount > 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <span className="w-5 h-5 rounded-md bg-surface-300 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">{i + 1}</span>
            <div className="flex-1">
              <Input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                icon={Icon}
              />
            </div>
            {items.length > 1 && (
              <button onClick={() => remove(i)} className="text-text-muted hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 mt-2 transition-colors"
      >
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  );
};

/* ── Resource link input ── */
const ResourceInput = ({ resources, onChange }) => {
  const update = (i, field, val) => { const u = [...resources]; u[i] = { ...u[i], [field]: val }; onChange(u); };
  const remove = (i) => { onChange(resources.filter((_, j) => j !== i)); };
  const add = () => { onChange([...resources, { label: '', url: '' }]); };
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">Reference Resources</label>
      {resources.length > 0 && (
        <div className="space-y-2 mb-2">
          {resources.map((r, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input value={r.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Label (e.g. API Docs)" icon={BookOpen} />
                <Input value={r.url} onChange={(e) => update(i, 'url', e.target.value)} placeholder="https://..." icon={Link2} />
              </div>
              <button onClick={() => remove(i)} className="text-text-muted hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors">
        <Plus className="w-3 h-3" /> Add resource link
      </button>
    </div>
  );
};

/* ── Task completeness indicator ── */
const TaskProgress = ({ task }) => {
  const checks = [
    !!task.title.trim(),
    !!task.description.trim(),
    !!task.expectedDeliverable.trim(),
    task.timeLimit > 0,
    task.requirements.some((r) => r.trim()),
  ];
  const done = checks.filter(Boolean).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-400' : pct >= 60 ? 'bg-primary' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${pct === 100 ? 'text-emerald-400' : 'text-text-muted'}`}>{pct}%</span>
    </div>
  );
};

/* ═══════════════ Main Form ═══════════════ */
export default function CreateTaskAssessment({ jobId, onTaskCreated }) {
  const [tasks, setTasks] = useState([emptyTask()]);
  const [loading, setLoading] = useState(false);
  const [expandedTask, setExpandedTask] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const addTask = () => {
    if (tasks.length >= 3) return;
    setTasks([...tasks, emptyTask()]);
    setExpandedTask(tasks.length);
  };

  const removeTask = (index) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter((_, i) => i !== index));
    setExpandedTask(Math.max(0, index - 1));
  };

  const handleSubmit = async () => {
    if (!jobId) return setError('Job ID is missing!');

    for (const task of tasks) {
      if (!task.title || !task.description || !task.expectedDeliverable || !task.timeLimit) {
        return setError('Please fill required fields (title, description, deliverable, time) for every task.');
      }
    }
    setError('');

    const cleaned = tasks.map((t) => ({
      ...t,
      requirements: t.requirements.filter((r) => r.trim()),
      evaluationCriteria: t.evaluationCriteria.filter((c) => c.trim()),
      resources: t.resources.filter((r) => r.label.trim() || r.url.trim()),
    }));

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        BASE_URL + '/tasks/create',
        { jobId, tasks: cleaned },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setTasks([emptyTask()]);
      setExpandedTask(0);
      if (onTaskCreated) onTaskCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating task assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Task cards header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Create Task Assessment</h2>
            <p className="text-xs text-text-muted">{tasks.length}/3 tasks configured</p>
          </div>
        </div>
        {tasks.length < 3 && (
          <button
            type="button"
            onClick={addTask}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        )}
      </div>

      {/* Task tabs + progress overview */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tasks.map((task, i) => {
          const diffOpt = DIFFICULTY_OPTIONS.find((d) => d.value === task.difficulty);
          return (
            <button
              key={i}
              onClick={() => setExpandedTask(expandedTask === i ? -1 : i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                expandedTask === i
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface-100 border-border text-text-muted hover:border-border-light'
              }`}
            >
              <span className="font-bold">Task {i + 1}</span>
              {task.title && <span className="max-w-[100px] truncate text-text-secondary">{task.title}</span>}
              <TaskProgress task={task} />
            </button>
          );
        })}
      </div>

      {/* Task forms */}
      <div className="space-y-3">
        {tasks.map((task, i) => {
          const isExpanded = expandedTask === i;
          const diffOpt = DIFFICULTY_OPTIONS.find((d) => d.value === task.difficulty);
          return (
            <motion.div
              key={i}
              layout
              className={`bg-surface-100 border rounded-xl overflow-hidden transition-colors ${
                isExpanded ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border'
              }`}
            >
              {/* Collapsed header */}
              <button
                type="button"
                onClick={() => setExpandedTask(isExpanded ? -1 : i)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-200/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isExpanded ? 'text-primary bg-primary/10 border-primary/20' : 'text-text-muted bg-surface-200 border-border'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {task.title || 'Untitled task'}
                  </span>
                  {task.difficulty && (
                    <span className={`hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${diffOpt?.color || ''}`}>
                      {diffOpt?.icon} {diffOpt?.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {task.techStack.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-text-muted">
                      <Code2 className="w-3 h-3" /> {task.techStack.length}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" /> {task.timeLimit}m
                  </span>
                  <TaskProgress task={task} />
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expanded form */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-5 py-5 space-y-5">
                      {tasks.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeTask(i)}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Task
                          </button>
                        </div>
                      )}

                      {/* Row 1: Title + Difficulty + Time */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_120px] gap-3">
                        <Input
                          label="Task Title *"
                          value={task.title}
                          onChange={(e) => updateTask(i, 'title', e.target.value)}
                          placeholder="Design and implement a real-time notification service"
                        />
                        {/* Difficulty as visual pills */}
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1.5">Difficulty</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {DIFFICULTY_OPTIONS.map((d) => (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => updateTask(i, 'difficulty', d.value)}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                                  task.difficulty === d.value
                                    ? d.color + ' ring-1 ring-current/20'
                                    : 'bg-surface-200 border-border text-text-muted hover:border-border-light'
                                }`}
                              >
                                {d.icon} {d.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Input
                          label="Time (min) *"
                          type="number"
                          value={task.timeLimit}
                          onChange={(e) => updateTask(i, 'timeLimit', parseInt(e.target.value) || 0)}
                          icon={Clock}
                        />
                      </div>

                      {/* Description */}
                      <Textarea
                        label="Task Description *"
                        value={task.description}
                        onChange={(e) => updateTask(i, 'description', e.target.value)}
                        rows={4}
                        placeholder={"You are building a feature for a SaaS platform used by 10,000+ daily active users.\n\nThe product team has requested a real-time notification service..."}
                      />

                      {/* Business Context */}
                      <Textarea
                        label="Business Context / Background"
                        value={task.context}
                        onChange={(e) => updateTask(i, 'context', e.target.value)}
                        rows={2}
                        placeholder="Our platform currently relies on polling for notifications, causing unnecessary load..."
                      />

                      {/* Requirements + Criteria side by side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <ListInput
                          label="Requirements *"
                          icon={Target}
                          items={task.requirements}
                          onChange={(val) => updateTask(i, 'requirements', val)}
                          placeholder="Implement WebSocket connection..."
                        />
                        <ListInput
                          label="Evaluation Criteria"
                          icon={BarChart3}
                          items={task.evaluationCriteria}
                          onChange={(val) => updateTask(i, 'evaluationCriteria', val)}
                          placeholder="Code architecture and separation..."
                        />
                      </div>

                      {/* Tech Stack */}
                      <ChipInput
                        label="Tech Stack"
                        icon={Code2}
                        chips={task.techStack}
                        onChange={(val) => updateTask(i, 'techStack', val)}
                        placeholder="React, Node.js, PostgreSQL..."
                      />

                      {/* Resources */}
                      <ResourceInput
                        resources={task.resources}
                        onChange={(val) => updateTask(i, 'resources', val)}
                      />

                      {/* Deliverable */}
                      <Input
                        label="Expected Deliverable *"
                        value={task.expectedDeliverable}
                        onChange={(e) => updateTask(i, 'expectedDeliverable', e.target.value)}
                        placeholder="Working GitHub repo with README, or zip with running code + tests"
                        icon={FileText}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Error / Success messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400/60 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-emerald-400">Task assessment created successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-text-muted">{tasks.length} task{tasks.length > 1 ? 's' : ''} will be created</p>
        <Button onClick={handleSubmit} loading={loading}>
          <Send className="w-3.5 h-3.5" /> Create Task Assessment
        </Button>
      </div>
    </div>
  );
}

/**
 * Displays existing task assessments for a job — enhanced card layout
 */
export function TaskAssessmentList({ jobId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssessment, setExpandedAssessment] = useState(null);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(BASE_URL + '/tasks/job/' + jobId, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setAssessments(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching task assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchAssessments();
  }, [jobId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task assessment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(BASE_URL + '/tasks/' + id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      fetchAssessments();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading task assessments...
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
          <Layers className="w-6 h-6 text-text-muted" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">No Assessments Yet</h3>
        <p className="text-xs text-text-muted max-w-xs">No task assessments have been created for this job. Switch to the "Create New" tab to get started.</p>
      </div>
    );
  }

  const diffColor = {
    junior: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    mid: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    senior: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    staff: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  const diffIcon = { junior: '🌱', mid: '⚡', senior: '🔥', staff: '💎' };

  const totalTasks = assessments.reduce((s, a) => s + (a.tasks?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-4 bg-surface-100 border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-bold text-text-primary">{assessments.length}</span>
          <span className="text-text-muted">assessment{assessments.length > 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 text-sm">
          <FileText className="w-4 h-4 text-accent" />
          <span className="font-bold text-text-primary">{totalTasks}</span>
          <span className="text-text-muted">total task{totalTasks > 1 ? 's' : ''}</span>
        </div>
      </div>

      {assessments.map((a, idx) => {
        const isOpen = expandedAssessment === idx;
        return (
          <motion.div
            key={a._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-surface-100 border rounded-xl overflow-hidden transition-colors ${
              isOpen ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border'
            }`}
          >
            {/* Assessment header */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <button
                type="button"
                onClick={() => setExpandedAssessment(isOpen ? null : idx)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    Assessment {idx + 1}
                  </p>
                  <p className="text-[10px] text-text-muted">{a.tasks.length} task{a.tasks.length > 1 ? 's' : ''}</p>
                </div>

                {/* Mini task previews */}
                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  {a.tasks.map((t, ti) => (
                    <span key={ti} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${diffColor[t.difficulty] || 'text-text-muted bg-surface-200 border-border'}`}>
                      {diffIcon[t.difficulty] || ''} {t.difficulty}
                    </span>
                  ))}
                </div>

                <ChevronDown className={`w-4 h-4 text-text-muted ml-auto shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => handleDelete(a._id)}
                className="ml-3 p-2 text-text-muted hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors shrink-0"
                title="Delete assessment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expanded task details */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border px-5 py-4 space-y-3">
                    {a.tasks.map((task, ti) => (
                      <div key={ti} className="bg-surface-200/60 border border-border/50 rounded-xl p-5 space-y-3">
                        {/* Task header */}
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">Task {ti + 1}</span>
                              <p className="text-sm font-semibold text-text-primary">{task.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.difficulty && (
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${diffColor[task.difficulty] || ''}`}>
                                  {diffIcon[task.difficulty]} {task.difficulty}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Clock className="w-3 h-3" /> {task.timeLimit} min
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-text-secondary leading-relaxed">{task.description}</p>

                        {/* Context */}
                        {task.context && (
                          <div className="bg-surface-100 rounded-lg p-3 border border-border/30">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Business Context</p>
                            <p className="text-xs text-text-secondary">{task.context}</p>
                          </div>
                        )}

                        {/* Requirements + Criteria grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {task.requirements?.length > 0 && (
                            <div className="bg-surface-100 rounded-lg p-3 border border-border/30">
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Target className="w-3 h-3 text-primary" /> Requirements
                              </p>
                              <ul className="space-y-1">
                                {task.requirements.map((r, ri) => (
                                  <li key={ri} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                    <span className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0 mt-0.5">{ri + 1}</span>
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {task.evaluationCriteria?.length > 0 && (
                            <div className="bg-surface-100 rounded-lg p-3 border border-border/30">
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-amber-400" /> Eval Criteria
                              </p>
                              <ul className="space-y-1">
                                {task.evaluationCriteria.map((c, ci) => (
                                  <li key={ci} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Tech Stack chips */}
                        {task.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {task.techStack.map((t, tsi) => (
                              <span key={tsi} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Resources */}
                        {task.resources?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {task.resources.map((r, ri) => (
                              <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg hover:bg-primary/10 transition-colors">
                                <Link2 className="w-3 h-3" /> {r.label || r.url}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Deliverable */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          <p className="text-xs text-accent font-medium">{task.expectedDeliverable}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
