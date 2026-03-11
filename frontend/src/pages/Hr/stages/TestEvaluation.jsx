import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, CheckSquare, Mail, Send } from 'lucide-react';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input, { Textarea } from '../../../components/ui/Input';

export default function TestEvaluation({ job, onStageUpdate }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectCount, setSelectCount] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sendingLinks, setSendingLinks] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [emailDesc, setEmailDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (!job) return;
    fetchStudents();
  }, [job]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(BASE_URL + '/job/students/' + job._id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      // Sort by score descending, students with scores first
      const sorted = (res.data || []).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      setStudents(sorted);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTop = () => {
    setSelectedStudents(students.slice(0, selectCount).map((s) => s.userId?._id));
  };

  const handleToggleStudent = (userId) => {
    setSelectedStudents((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  /* Send test links to selected students */
  const handleSendTestLinks = async () => {
    if (selectedStudents.length === 0) { alert('Please select at least one student.'); return; }
    try {
      setSendingLinks(true);
      const token = localStorage.getItem('token');
      await axios.post(
        BASE_URL + '/email/send-test-email/' + job._id,
        {
          studentIds: selectedStudents,
          description: emailDesc || `Coding test for ${job.title}`,
          jobTitle: job.title,
          startTime,
          endTime,
        },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      alert('Test links sent successfully!');
      fetchStudents();
    } catch (err) {
      console.error('Error sending test links:', err);
      alert(err.response?.data?.message || 'Failed to send test links.');
    } finally {
      setSendingLinks(false);
    }
  };

  /* Advance selected students & move job to interview stage */
  const handleConfirmSelection = async () => {
    if (selectedStudents.length === 0) { alert('Please select at least one student.'); return; }
    try {
      setAdvancing(true);
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChange', { stage: 'interview' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChangeInStudent', { studentIds: selectedStudents }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Selected students advanced to next stage.');
      if (onStageUpdate) onStageUpdate();
    } catch (err) {
      console.error('Error updating stages:', err);
      alert('Failed to update stages.');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Test Evaluation</h3>

      <p className="text-text-muted text-sm mb-4">Total Students: {students.length}</p>

      {/* Quick-select N */}
      <div className="flex items-center gap-3 mb-5">
        <input type="number" min="1" max={students.length} value={selectCount}
          onChange={(e) => setSelectCount(Number(e.target.value))} placeholder="Top N"
          className="w-24 px-3 py-2 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
        <Button variant="secondary" size="sm" onClick={handleSelectTop}>Select Top</Button>
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
      ) : students.length === 0 ? (
        <p className="text-text-muted text-sm">No students found for this job.</p>
      ) : (
        <div className="rounded-lg border border-[#1f1f1f] overflow-hidden">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a] grid grid-cols-[auto_1fr_1fr] items-center px-4 py-3 border-b border-[#1f1f1f]">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Status</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {students.map((student) => {
              const uid = student.userId?._id;
              const hasScore = student.score != null;
              return (
                <div key={student._id}
                  onClick={() => handleToggleStudent(uid)}
                  className={'grid grid-cols-[auto_1fr_1fr] items-center px-4 py-3 cursor-pointer transition-colors border-b border-[#1f1f1f] last:border-b-0 ' +
                    (selectedStudents.includes(uid) ? 'bg-primary/10' : 'hover:bg-[#111111]')}>
                  <div className={'w-5 h-5 rounded border flex items-center justify-center transition-colors mr-3 ' +
                    (selectedStudents.includes(uid) ? 'bg-primary border-primary text-white' : 'border-[#1f1f1f]')}>
                    {selectedStudents.includes(uid) && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">{student.userId?.name}</p>
                    <p className="text-xs text-gray-500">{student.userId?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    {hasScore ? (
                      <Badge variant={student.score >= 70 ? 'success' : student.score >= 40 ? 'warning' : 'danger'}>
                        Score: {student.score}%
                      </Badge>
                    ) : (
                      <Badge variant="default">Not tested</Badge>
                    )}
                    {student.testCompleted && <Badge variant="success" dot>Submitted</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {selectedStudents.length > 0 && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-text-muted">{selectedStudents.length} student(s) selected</p>

          {/* Send Test Link section */}
          <div className="bg-surface-200/50 border border-border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide flex items-center gap-2">
              <Mail className="w-4 h-4" /> Send Test Link to Selected
            </h4>
            <Textarea placeholder="Test description..." value={emailDesc} onChange={(e) => setEmailDesc(e.target.value)} rows={2} />
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
            <Button onClick={handleSendTestLinks} loading={sendingLinks} variant="secondary" icon={Send}>
              Send Test Link
            </Button>
          </div>

          {/* Advance to next stage */}
          <Button onClick={handleConfirmSelection} loading={advancing}>
            Confirm & Advance Selected
          </Button>
        </div>
      )}
    </div>
  );
}
