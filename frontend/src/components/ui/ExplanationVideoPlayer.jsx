import { useState } from 'react';
import { Video, Play, X } from 'lucide-react';

const ExplanationVideoPlayer = ({ videoUrl }) => {
  const [expanded, setExpanded] = useState(false);

  if (!videoUrl) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-200 rounded-lg px-3 py-2">
        <Video className="w-3.5 h-3.5" />
        No explanation video available
      </div>
    );
  }

  return (
    <div>
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/20 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Watch Explanation Video
        </button>
      ) : (
        <div className="bg-surface-200 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-primary" /> Explanation Recording
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded hover:bg-surface-300 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="aspect-video bg-black">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplanationVideoPlayer;
