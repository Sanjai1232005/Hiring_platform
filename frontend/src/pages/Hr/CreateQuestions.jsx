import axios from 'axios';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, EyeOff, Send, Trash2, Code2, Hash, Award, AlertCircle } from 'lucide-react';
import API from '../../apiConfig';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CreateQuestion({ jobId, onQuestionCreated }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [marks, setMarks] = useState(100);
  const [testCases, setTestCases] = useState([{ input: '', output: '', hidden: false }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addTC = () => setTestCases([...testCases, { input: '', output: '', hidden: false }]);

  const removeTC = (i) => {
    if (testCases.length <= 1) return;
    setTestCases(testCases.filter((_, idx) => idx !== i));
  };

  const updateTC = (i, key, val) => {
    const copy = [...testCases];
    copy[i][key] = val;
    setTestCases(copy);
  };

  const handleSubmit = async () => {
    if (!jobId) { setError('Job ID is missing'); return; }
    if (!title.trim()) { setError('Please enter a question title'); return; }
    if (!desc.trim()) { setError('Please enter a description'); return; }
    setError('');
    setSubmitting(true);
    const payload = { jobId, title, description: desc, marks, testCases };
    try {
      await axios.post(API + '/questions/create', payload);
      if (onQuestionCreated) {
        onQuestionCreated();
      }
      // Reset form
      setTitle('');
      setDesc('');
      setMarks(100);
      setTestCases([{ input: '', output: '', hidden: false }]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Code2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary">Create Coding Question</h2>
          <p className="text-[11px] text-text-muted">Define the problem, test cases, and scoring</p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <Input label="Question Title *" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Two Sum, Reverse Linked List…" />
        <div className="w-32">
          <Input label="Marks" type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} />
        </div>
      </div>

      <Textarea label="Problem Description *" value={desc} onChange={(e) => setDesc(e.target.value)}
        rows={5} placeholder="Describe the problem in detail. Include constraints, input/output format…" />

      {/* Test Cases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> Test Cases ({testCases.length})
          </h3>
          <button type="button" onClick={addTC}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-medium">
            <Plus className="w-3.5 h-3.5" /> Add Test Case
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {testCases.map((tc, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-surface-200/60 border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-text-secondary">Test Case {i + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => updateTC(i, 'hidden', !tc.hidden)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all border ${
                        tc.hidden
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                          : 'bg-surface-100 text-text-muted border-border hover:text-text-secondary'
                      }`}
                    >
                      {tc.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {tc.hidden ? 'Hidden' : 'Visible'}
                    </button>
                    {testCases.length > 1 && (
                      <button type="button" onClick={() => removeTC(i)}
                        className="p-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Input</label>
                    <textarea value={tc.input} onChange={(e) => updateTC(i, 'input', e.target.value)}
                      className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none" rows={2}
                      placeholder="e.g., [2,7,11,15]\n9" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Expected Output</label>
                    <textarea value={tc.output} onChange={(e) => updateTC(i, 'output', e.target.value)}
                      className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none" rows={2}
                      placeholder="e.g., [0,1]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button onClick={handleSubmit} loading={submitting} icon={Send} disabled={!title.trim() || !desc.trim()}>
          Create Question
        </Button>
        <span className="text-xs text-text-muted">
          {testCases.length} test case{testCases.length !== 1 && 's'} • {marks} marks
        </span>
      </div>
    </div>
  );
}
