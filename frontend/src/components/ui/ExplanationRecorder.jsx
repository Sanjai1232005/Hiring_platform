import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Mic, Square, AlertTriangle, MessageCircle } from 'lucide-react';

const MAX_DURATION = 5 * 60; // 5 minutes
const MIN_DURATION = 3 * 60; // 3 minutes
const CHUNK_INTERVAL_MS = 5000;

const ExplanationRecorder = ({ active, onRecordingComplete, mediaStream }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const ownsStreamRef = useRef(false); // true if we created the stream ourselves
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [warning, setWarning] = useState('');

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ── Start recording ──
  const startRecording = useCallback(async () => {
    try {
      setWarning('');

      let stream;
      if (mediaStream) {
        // Reuse existing proctoring stream — do not stop it on cleanup
        stream = mediaStream;
        ownsStreamRef.current = false;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        ownsStreamRef.current = true;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start(CHUNK_INTERVAL_MS);
      setRecording(true);
      setElapsed(0);

      // Elapsed counter
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Explanation recorder: media access error', err);
      setWarning(
        err.name === 'NotAllowedError'
          ? 'Camera/microphone access denied. Please grant permission.'
          : 'Unable to access camera or microphone.'
      );
    }
  }, []);

  // ── Stop recording & assemble blob ──
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      clearInterval(timerRef.current);
      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          resolve(blob);
        };
        recorder.stop();
      } else {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        resolve(blob);
      }

      // Only release tracks if we created the stream ourselves
      if (ownsStreamRef.current && streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      setRecording(false);
      setFinished(true);
    });
  }, []);

  // Auto-start when active
  useEffect(() => {
    if (active && !recording && !finished) {
      startRecording();
    }
    return () => {
      clearInterval(timerRef.current);
      if (ownsStreamRef.current && streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-stop at MAX_DURATION
  useEffect(() => {
    if (recording && elapsed >= MAX_DURATION) {
      stopRecording().then((blob) => {
        if (onRecordingComplete) onRecordingComplete(blob);
      });
    }
  }, [elapsed, recording, stopRecording, onRecordingComplete]);

  const handleManualStop = async () => {
    if (elapsed < MIN_DURATION) {
      setWarning(`Please record for at least ${Math.ceil((MIN_DURATION - elapsed) / 60)} more minute(s).`);
      return;
    }
    setWarning('');
    const blob = await stopRecording();
    if (onRecordingComplete) onRecordingComplete(blob);
  };

  if (!active && !finished) return null;

  if (finished) {
    return (
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-center">
        <MessageCircle className="w-6 h-6 text-accent mx-auto mb-2" />
        <p className="text-sm font-medium text-accent">Explanation recorded successfully!</p>
        <p className="text-xs text-text-muted mt-1">Your video will be uploaded with your submission.</p>
      </div>
    );
  }

  const remaining = MAX_DURATION - elapsed;
  const canStop = elapsed >= MIN_DURATION;
  const progressPct = Math.min((elapsed / MAX_DURATION) * 100, 100);

  return (
    <div className="bg-surface-200 border border-primary/30 rounded-xl overflow-hidden">
      {/* Banner */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary">Explanation Recording</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Please explain the work you have completed — your approach, tools used, key decisions, and any challenges faced.
        </p>
      </div>

      {/* Video preview */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Recording badge */}
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1.5 bg-red-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full animate-pulse">
            <Video className="w-3 h-3" />
            REC {formatTime(elapsed)}
          </span>
        </div>

        {/* Remaining */}
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-mono text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
            {formatTime(remaining)} left
          </span>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-600/80 text-white">
            <Video className="w-3 h-3" /> Camera
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-600/80 text-white">
            <Mic className="w-3 h-3" /> Mic
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-300">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-text-muted">
          Min: 3 min &middot; Max: 5 min
        </div>
        <button
          onClick={handleManualStop}
          disabled={!canStop}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            canStop
              ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
              : 'bg-surface-300 border border-border text-text-muted cursor-not-allowed'
          }`}
        >
          <Square className="w-3 h-3" />
          Stop Recording
        </button>
      </div>

      {/* Warning */}
      {warning && (
        <div className="flex items-start gap-2 bg-yellow-500/10 border-t border-yellow-500/20 px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">{warning}</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationRecorder;
