import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Send, Clock, FileText, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const emptyTask = () => ({
  title: '',
  description: '',
  expectedDeliverable: '',
  timeLimit: 60,
});

export default function CreateTaskAssessment({ jobId, onTaskCreated }) {
  const [tasks, setTasks] = useState([emptyTask()]);
  const [loading, setLoading] = useState(false);

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const addTask = () => {
    if (tasks.length >= 3) return;
    setTasks([...tasks, emptyTask()]);
  };

  const removeTask = (index) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!jobId) return alert('Job ID is missing!');

    for (const task of tasks) {
      if (!task.title || !task.description || !task.expectedDeliverable || !task.timeLimit) {
        return alert('Please fill all fields for every task.');
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        BASE_URL + '/tasks/create',
        { jobId, tasks },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      alert('Task assessment created successfully!');
      setTasks([emptyTask()]);
      if (onTaskCreated) onTaskCreated();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-text-primary">Create Task Assessment</h2>

      <div className="bg-surface-200 rounded-lg p-3 text-sm">
        <span className="text-text-muted">Job ID:</span>{' '}
        <span className="text-text-secondary font-mono">{jobId || '—'}</span>
      </div>

      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={i} className="bg-surface-200 border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Task {i + 1} of {tasks.length}
              </span>
              {tasks.length > 1 && (
                <button
                  onClick={() => removeTask(i)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            <Input
              label="Task Title"
              value={task.title}
              onChange={(e) => updateTask(i, 'title', e.target.value)}
              placeholder="Build a responsive React card component"
            />
            <Textarea
              label="Task Description"
              value={task.description}
              onChange={(e) => updateTask(i, 'description', e.target.value)}
              rows={3}
              placeholder="Create a reusable card component using React and Tailwind..."
            />
            <Input
              label="Expected Deliverable"
              value={task.expectedDeliverable}
              onChange={(e) => updateTask(i, 'expectedDeliverable', e.target.value)}
              placeholder="GitHub repo or zip upload"
              icon={FileText}
            />
            <Input
              label="Time Limit (minutes)"
              type="number"
              value={task.timeLimit}
              onChange={(e) => updateTask(i, 'timeLimit', parseInt(e.target.value) || 0)}
              placeholder="60"
              icon={Clock}
            />
          </div>
        ))}
      </div>

      {tasks.length < 3 && (
        <button
          onClick={addTask}
          className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task ({tasks.length}/3)
        </button>
      )}

      <Button onClick={handleSubmit} loading={loading} icon={Send}>
        Create Task Assessment
      </Button>
    </div>
  );
}

/**
 * Displays existing task assessments for a job
 */
export function TaskAssessmentList({ jobId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading task assessments...
      </div>
    );
  }

  if (assessments.length === 0) {
    return <p className="text-text-muted text-sm">No task assessments created yet.</p>;
  }

  return (
    <div className="space-y-3">
      {assessments.map((a, idx) => (
        <div key={a._id} className="bg-surface-200 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Assessment {idx + 1} — {a.tasks.length} task{a.tasks.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => handleDelete(a._id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {a.tasks.map((task, ti) => (
              <div key={ti} className="bg-surface-100 border border-border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{task.title}</p>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted shrink-0 ml-3">
                    <Clock className="w-3.5 h-3.5" /> {task.timeLimit}m
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {task.expectedDeliverable}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
