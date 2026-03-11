import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Mail, Loader2, AlertTriangle } from 'lucide-react';
import CreateQuestion from '../CreateQuestions';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';
import Input, { Textarea } from '../../../components/ui/Input';

const CodingTest = ({ job, onStageUpdate }) => {
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [email, setEmail] = useState('');
  const [emailDescription, setEmailDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!job) return;
    fetchQuestions();
  }, [job]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(BASE_URL + '/questions/' + job._id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setQuestions(res.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !emailDescription) { alert('Please fill in email and description.'); return; }
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/email/send-test-email/' + job._id,
        { email, description: emailDescription, startTime, endTime },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      alert('Email sent successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalizeTest = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChange', { stage: 'evaluation' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Test finalized and stage updated!');
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error('Error finalizing test:', err);
      alert('Failed to finalize test.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Coding Test</h3>

      {/* Questions */}
      <div>
        <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Questions ({questions.length})</h4>
        {loadingQuestions ? (
          <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : questions.length === 0 ? (
          <p className="text-text-muted text-sm mb-3">No questions added yet.</p>
        ) : (
          <div className="space-y-2 mb-3">
            {questions.map((q, index) => (
              <div key={q._id} className="p-3 bg-surface-200 border border-border rounded-lg">
                <span className="text-xs text-text-muted">Q{index + 1}</span>
                <p className="text-sm text-text-primary font-medium">{q.title}</p>
              </div>
            ))}
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={() => setShowCreateQuestion(!showCreateQuestion)} icon={Plus}>
          {showCreateQuestion ? 'Hide Form' : 'Add Question'}
        </Button>
      </div>

      {showCreateQuestion && (
        <div className="bg-surface-200 border border-border rounded-lg p-4">
          <CreateQuestion jobId={job._id} onQuestionCreated={() => { setShowCreateQuestion(false); fetchQuestions(); }} />
        </div>
      )}

      {/* Send Email */}
      <div className="border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4" /> Send Test Link
        </h4>
        <div className="space-y-3">
          <Input type="email" placeholder="student@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Textarea placeholder="Test description..." value={emailDescription} onChange={(e) => setEmailDescription(e.target.value)} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Start Time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">End Time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>
          <Button onClick={handleSendEmail} loading={processing} variant="secondary" icon={Mail}>Send Email</Button>
        </div>
      </div>

      {/* Finalize */}
      <div className="border-t border-border pt-5">
        <Button variant="danger" onClick={handleFinalizeTest} loading={processing} icon={AlertTriangle}>
          Finalize Test
        </Button>
      </div>
    </div>
  );
};

export default CodingTest;
