import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle2, Phone } from 'lucide-react';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export default function Interview({ job, onStageUpdate }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!job) return;
    const fetchInterviewStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/students/' + job._id, {
          headers: { Authorization: 'Bearer ' + token },
        });
        setStudents((res.data || []).filter((s) => s.currentStage === 'interview'));
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewStudents();
  }, [job]);

  const markAsContacted = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/students/' + studentId + '/mark-contacted', { jobId: job._id }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setStudents((prev) =>
        prev.map((s) => s._id === studentId ? { ...s, contacted: true } : s)
      );
    } catch (err) {
      console.error('Error marking student as contacted:', err);
      alert('Failed to mark as contacted.');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Interview Stage</h3>

      {loading ? (
        <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
      ) : students.length === 0 ? (
        <p className="text-text-muted text-sm">No students at interview stage.</p>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <div key={student._id}
              className="flex items-center justify-between p-4 bg-surface-200 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-text-primary">{student.userId?.name}</p>
                <p className="text-xs text-text-muted">{student.userId?.email}</p>
                <p className="text-xs text-text-muted mt-1">Score: <span className="text-text-secondary">{student.testScore}</span></p>
              </div>
              {student.contacted ? (
                <Badge variant="success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Contacted</Badge>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => markAsContacted(student._id)} icon={Phone}>
                  Mark Contacted
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
