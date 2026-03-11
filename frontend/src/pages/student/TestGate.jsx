import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";


const TestGate = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Validating test link...");

  useEffect(() => {
    try {
      const decoded = jwtDecode(token);

      const { jobId, userId, endTime } = decoded;

      // ✅ Allowed → redirect to editor
      navigate(`/students/${jobId}/${userId}`, {
        replace: true,
        state: {
          token,
          endTime
        }
      });

    } catch (err) {
      setMessage("❌ Invalid or expired test link");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
      {message}
    </div>
  );
};

export default TestGate;
