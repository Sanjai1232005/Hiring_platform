import axios from 'axios';
import { useState } from 'react';
import { Plus, Eye, EyeOff, Send } from 'lucide-react';
import API from '../../apiConfig';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CreateQuestion({ jobId }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [marks, setMarks] = useState(100);
  const [testCases, setTestCases] = useState([{ input: '', output: '', hidden: false }]);

  const addTC = () => setTestCases([...testCases, { input: '', output: '', hidden: false }]);

  const updateTC = (i, key, val) => {
    const copy = [...testCases];
    copy[i][key] = val;
    setTestCases(copy);
  };

  const handleSubmit = async () => {
    if (!jobId) return alert('JobId missing!');
    const payload = { jobId, title, description: desc, marks, testCases };
    try {
      const res = await axios.post(API + '/questions/create', payload);
      alert('Question created: ' + res.data._id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-text-primary">Create Question</h2>

      <div className="bg-surface-200 rounded-lg p-3 text-sm">
        <span className="text-text-muted">Job ID:</span>{' '}
        <span className="text-text-secondary font-mono">{jobId || '—'}</span>
      </div>

      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Sum, Reverse String..." />
      <Textarea label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Problem description..." />
      <Input label="Marks" type="number" value={marks} onChange={(e) => setMarks(e.target.value)} />

      <div>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Test Cases</h3>
        <div className="space-y-3">
          {testCases.map((tc, i) => (
            <div key={i} className="bg-surface-200 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Test Case {i + 1}</span>
                <button
                  onClick={() => updateTC(i, 'hidden', !tc.hidden)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  {tc.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {tc.hidden ? 'Hidden' : 'Visible'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Input</label>
                  <textarea value={tc.input} onChange={(e) => updateTC(i, 'input', e.target.value)}
                    className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none" rows={2} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Expected Output</label>
                  <textarea value={tc.output} onChange={(e) => updateTC(i, 'output', e.target.value)}
                    className="w-full px-3 py-2 bg-surface-100 border border-border rounded-lg text-sm text-text-primary font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none" rows={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addTC}
          className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 mt-3 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Test Case
        </button>
      </div>

      <Button onClick={handleSubmit} icon={Send}>Create Question</Button>
    </div>
  );
}
