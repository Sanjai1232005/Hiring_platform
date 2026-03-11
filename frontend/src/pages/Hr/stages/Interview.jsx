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
        <div className="rounded-lg border border-[#1f1f1f] overflow-hidden">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a] flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
          </div>
          {students.map((student) => (
            <div key={student._id}
              className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f] last:border-b-0 transition-colors hover:bg-[#111111]">
              <div>
                <p className="text-sm font-medium text-gray-300">{student.userId?.name}</p>
                <p className="text-xs text-gray-500">{student.userId?.email}</p>
                <p className="text-xs text-gray-500 mt-1">Score: <span className="text-gray-300">{student.testScore}</span></p>
              </div>
              {student.contacted ? (
                <Badge variant="success" dot>Contacted</Badge>
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
