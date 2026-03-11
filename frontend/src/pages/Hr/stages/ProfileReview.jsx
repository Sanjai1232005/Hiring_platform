import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, CheckSquare } from 'lucide-react';
import BASE_URL from '../../../apiConfig';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const ProfileReview = ({ job, onStageUpdate }) => {
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
    const topStudents = applicants.slice(0, selectCount).map((s) => s.userId?._id);
    setSelectedStudents(topStudents);
  };

  const handleToggleStudent = (userId) => {
    setSelectedStudents((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
      // Determine the next job stage based on assessmentStrategy
      const strategy = job.assessmentStrategy || 'coding_only';
      const nextJobStage =
        strategy === 'task_only' || strategy === 'task_then_coding' ? 'task' :
        strategy === 'none' ? 'evaluation' : 'coding';

      await axios.post(BASE_URL + '/job/' + job._id + '/stageChange', { stage: nextJobStage }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      // Advance selected candidates to their next pipeline stage
      await axios.post(BASE_URL + '/job/' + job._id + '/stageChangeInStudent', { studentIds: selectedStudents }, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('Selection confirmed and stages updated!');
      setSelectedStudents([]);
      if (onStageUpdate) onStageUpdate();
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
        <>
        <div className="rounded-lg border border-[#1f1f1f] overflow-hidden">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a] grid grid-cols-[auto_1fr_auto_auto] items-center px-4 py-3 border-b border-[#1f1f1f]">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Score</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right ml-4">Action</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {applicants.map((student) => {
              const uid = student.userId?._id;
              return (
                <div key={student._id}
                  onClick={() => handleToggleStudent(uid)}
                  className={'grid grid-cols-[auto_1fr_auto_auto] items-center px-4 py-3 cursor-pointer transition-colors border-b border-[#1f1f1f] last:border-b-0 ' +
                    (selectedStudents.includes(uid) ? 'bg-primary/10' : 'hover:bg-[#111111]')}>
                  <div className={'w-5 h-5 rounded border flex items-center justify-center transition-colors mr-3 ' +
                    (selectedStudents.includes(uid) ? 'bg-primary border-primary text-white' : 'border-[#1f1f1f]')}>
                    {selectedStudents.includes(uid) && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">{student.userId?.name}</p>
                    <p className="text-xs text-gray-500">{student.userId?.email}</p>
                  </div>
                  <Badge variant={student.resumeScore >= 70 ? 'success' : student.resumeScore >= 40 ? 'warning' : 'danger'}>
                    Score: {student.resumeScore ?? 'N/A'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="ml-4" onClick={(e) => { e.stopPropagation(); navigate('/student/' + student.userId?._id); }} icon={Eye}>
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {selectedStudents.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-text-muted">{selectedStudents.length} selected</span>
            <Button onClick={handleConfirmSelection} loading={processing}>Confirm Selection</Button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default ProfileReview;
