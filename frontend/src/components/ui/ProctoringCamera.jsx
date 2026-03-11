import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, AlertTriangle, Video } from 'lucide-react';

const CHUNK_INTERVAL_MS = 5000; // record in 5-second chunks

const ProctoringCamera = ({ active, onRecordingReady }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [warning, setWarning] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ── Start media stream ──
  const startStream = useCallback(async () => {
    try {
      setWarning('');
      setPermissionDenied(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      setCameraOn(!!videoTrack && videoTrack.readyState === 'live');
      setMicOn(!!audioTrack && audioTrack.readyState === 'live');

      // Listen for track ending (user revokes permission / unplugs camera)
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          setCameraOn(false);
          setWarning('Webcam was disconnected. Please re-enable your camera.');
        });
      }

      // ── Start MediaRecorder ──
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
    } catch (err) {
      console.error('Proctoring: media access error', err);
      setPermissionDenied(true);
      setWarning(
        err.name === 'NotAllowedError'
          ? 'Camera/microphone access denied. Please grant permission in your browser settings.'
          : 'Unable to access camera or microphone.'
      );
    }
  }, []);

  // ── Stop everything & assemble final blob ──
  const stopStream = useCallback(() => {
    return new Promise((resolve) => {
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

      // Release all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      setCameraOn(false);
      setMicOn(false);
    });
  }, []);

  // Start when `active` becomes true
  useEffect(() => {
    if (active) {
      startStream();
    }

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [active, startStream]);

  // Expose stop + blob + stream via callback so the parent can trigger upload
  useEffect(() => {
    if (onRecordingReady) {
      onRecordingReady({ stop: stopStream, getStream: () => streamRef.current });
    }
  }, [onRecordingReady, stopStream]);

  if (!active) return null;

  return (
    <div className="bg-surface-200 border border-border rounded-xl overflow-hidden">
      {/* Video preview */}
      <div className="relative w-full aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Video className="w-3 h-3" />
            Recording Active
          </span>
        </div>

        {/* Bottom indicators */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          {/* Camera indicator */}
          <span
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              cameraOn
                ? 'bg-green-600/80 text-white'
                : 'bg-red-600/80 text-white'
            }`}
          >
            <Camera className="w-3 h-3" />
            {cameraOn ? 'Camera On' : 'Camera Off'}
          </span>

          {/* Mic indicator */}
          <span
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              micOn
                ? 'bg-green-600/80 text-white'
                : 'bg-red-600/80 text-white'
            }`}
          >
            <Mic className="w-3 h-3" />
            {micOn ? 'Mic Active' : 'Mic Off'}
          </span>
        </div>
      </div>

      {/* Warning banner */}
      {warning && (
        <div className="flex items-start gap-2 bg-yellow-500/10 border-t border-yellow-500/20 px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300 leading-relaxed">{warning}</p>
        </div>
      )}

      {permissionDenied && !warning && (
        <div className="flex items-start gap-2 bg-red-500/10 border-t border-red-500/20 px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">
            Permission denied. The proctoring camera requires webcam &amp; microphone access.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProctoringCamera;
