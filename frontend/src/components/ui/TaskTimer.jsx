import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const TaskTimer = ({ totalMinutes, onTimeUp, onLastFiveMinutes, startedAt }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const firedRef = useRef(false);

  const calculateTimeLeft = useCallback(() => {
    if (!startedAt || !totalMinutes) return null;
    const endTime = new Date(startedAt).getTime() + totalMinutes * 60 * 1000;
    const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return diff;
  }, [startedAt, totalMinutes]);

  useEffect(() => {
    if (!startedAt) return;

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 300 && !firedRef.current) {
        firedRef.current = true;
        if (onLastFiveMinutes) onLastFiveMinutes();
      }
      if (remaining <= 0) {
        clearInterval(timer);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, calculateTimeLeft, onTimeUp, onLastFiveMinutes]);

  if (timeLeft === null) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft <= 60;
  const isWarning = timeLeft <= 300 && !isUrgent;

  const formatUnit = (val) => String(val).padStart(2, '0');

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm font-bold transition-colors ${
        isUrgent
          ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
          : isWarning
          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          : 'bg-surface-200 border-border text-text-primary'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span>
        {hours > 0 && `${formatUnit(hours)}:`}
        {formatUnit(minutes)}:{formatUnit(seconds)}
      </span>
    </div>
  );
};

export default TaskTimer;
