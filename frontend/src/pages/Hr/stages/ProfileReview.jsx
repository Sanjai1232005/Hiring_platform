import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, CheckSquare } from 'lucide-react';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const ProfileReview = ({ job }) => {
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectCount, setSelectCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!job) return;
    const fetchApplicants = async () => {
      try {
        setLoadingApplicants(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/job/students/' + job._id, {
          headers: { Authorization: 'Bearer ' + token },
        });
        const sorted = (res.data || []).sort((a, b) => b.resumeScore - a.resumeScore);
        setApplicants(sorted);
      } catch (err) {
        console.error('Error fetching applicants:', err);
      } finally {
        setLoadingApplicants(false);
      }
    };
    fetchApplicants();
  }, [job]);

  const handleSelectTopStudents = () => {
    const topStudents = applicants.slice(0, selectCount).map((s) => s._id);
    setSelectedStudents(topStudents);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleConfirmSelection = async () => {
    if (!job || selectedStudents.length === 0) {
      alert('Please select at least one student.');
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChange', { stage: 'coding' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChangeInStudent', { studentIds: selectedStudents, stage: 'coding' }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Selection confirmed and stages updated!');
      setSelectedStudents([]);
    } catch (err) {
      console.error('Error confirming selection:', err);
      alert('Failed to update stages.');
    } finally {
      setProcessing(false);
    }
  };

  if (!job) return <p className="text-text-muted">No job selected.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Profile Review</h3>
      <p className="text-text-muted text-sm mb-4">Total Applicants: {applicants.length}</p>

      {/* Quick select */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="number" min="1" max={applicants.length} value={selectCount}
          onChange={(e) => setSelectCount(Number(e.target.value))}
          placeholder="Top N"
          className="w-24 px-3 py-2 bg-surface-200 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
        />
        <Button variant="secondary" size="sm" onClick={handleSelectTopStudents}>Select Top</Button>
      </div>

      {/* List */}
      {loadingApplicants ? (
        <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
      ) : applicants.length === 0 ? (
        <p className="text-text-muted text-sm">No applicants found.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {applicants.map((student) => (
            <div key={student._id}
              onClick={() => handleToggleStudent(student._id)}
              className={'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ' +
                (selectedStudents.includes(student._id)
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-surface-200 border-border hover:border-border-light')}>
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
              <div className="flex items-center gap-3">
                <Badge variant={student.resumeScore >= 70 ? 'success' : student.resumeScore >= 40 ? 'warning' : 'danger'}>
                  Score: {student.resumeScore ?? 'N/A'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/student/' + student.userId?._id); }} icon={Eye}>
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStudents.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-text-muted">{selectedStudents.length} selected</span>
          <Button onClick={handleConfirmSelection} loading={processing}>Confirm Selection</Button>
        </div>
      )}
    </div>
  );
};

export default ProfileReview;
