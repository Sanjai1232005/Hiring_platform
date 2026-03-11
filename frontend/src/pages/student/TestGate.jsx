import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Loader2, AlertCircle } from 'lucide-react';

const TestGate = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const decoded = jwtDecode(token);
      const { jobId, userId, endTime } = decoded;
      navigate('/students/' + jobId + '/' + userId, {
        replace: true,
        state: { token, endTime },
      });
    } catch (err) {
      setError(true);
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-text-primary font-semibold">Invalid or expired test link</p>
          <p className="text-text-muted text-sm mt-1">Please contact HR for a new link.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          Validating test link...
        </div>
      )}
    </div>
  );
};

export default TestGate;
