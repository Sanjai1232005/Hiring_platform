import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, CheckSquare } from 'lucide-react';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export default function TestEvaluation({ job }) {
  const [allSubmitted, setAllSubmitted] = useState(true);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectCount, setSelectCount] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (!job) return;
    setAllSubmitted(job.allStudentTestSubmit || false);
    if (job.allStudentTestSubmit) fetchStudents();
  }, [job]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(BASE_URL + '/job/test/' + job._id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setStudents(res.data.sort((a, b) => b.testScore - a.testScore));
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTop = () => {
    setSelectedStudents(students.slice(0, selectCount).map((s) => s._id));
  };

  const handleToggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleConfirmSelection = async () => {
    if (selectedStudents.length === 0) { alert('Please select at least one student.'); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChange', { stage: 'interview' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChangeInStudent', { studentIds: selectedStudents, stage: 'interview' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Interview stage updated for selected students.');
    } catch (err) {
      console.error('Error updating stages:', err);
      alert('Failed to update stages.');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Test Evaluation</h3>

      {allSubmitted ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400 text-sm">
          Test not completed yet by all students.
        </div>
      ) : (
        <div>
          <p className="text-text-muted text-sm mb-4">Total Students: {students.length}</p>

          <div className="flex items-center gap-3 mb-5">
            <input type="number" min="1" max={students.length} value={selectCount}
              onChange={(e) => setSelectCount(Number(e.target.value))} placeholder="Top N"
              className="w-24 px-3 py-2 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
            <Button variant="secondary" size="sm" onClick={handleSelectTop}>Select Top</Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.map((student) => (
                <div key={student._id}
                  onClick={() => handleToggleStudent(student._id)}
                  className={'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ' +
                    (selectedStudents.includes(student._id) ? 'bg-primary/10 border-primary/30' : 'bg-surface-200 border-border hover:border-border-light')}>
                  <div className="flex items-center gap-3">
                    <div className={'w-5 h-5 rounded border flex items-center justify-center transition-colors ' +
                      (selectedStudents.includes(student._id) ? 'bg-primary border-primary text-white' : 'border-border')}>
                      {selectedStudents.includes(student._id) && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{student.userId?.name}</p>
                      <p className="text-xs text-text-muted">{student.userId?.email}</p>
                    </div>
                  </div>
                  <Badge variant={student.testScore >= 70 ? 'success' : student.testScore >= 40 ? 'warning' : 'danger'}>
                    Score: {student.testScore}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {selectedStudents.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-text-muted">{selectedStudents.length} selected</span>
              <Button onClick={handleConfirmSelection}>Confirm & Move to Interview</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
