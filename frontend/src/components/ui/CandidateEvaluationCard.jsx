import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, CheckCircle2, MessageCircle, Brain, Lightbulb, Shield,
  ChevronDown, ChevronUp, FileText, Github, ExternalLink, Star,
  Eye, Zap, Activity,
} from 'lucide-react';
import ExplanationVideoPlayer from '../../components/ui/ExplanationVideoPlayer';

const ScoreBar = ({ label, score, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: { bar: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
    cyan: { bar: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    amber: { bar: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' },
    rose: { bar: 'bg-rose-400', text: 'text-rose-400', bg: 'bg-rose-400/10' },
    violet: { bar: 'bg-violet-400', text: 'text-violet-400', bg: 'bg-violet-400/10' },
    accent: { bar: 'bg-accent', text: 'text-accent', bg: 'bg-accent/10' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
          {label}
        </span>
        <span className={`text-sm font-bold ${c.text}`}>{score ?? '—'}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${c.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score || 0, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const CandidateEvaluationCard = ({ candidate, onAnalyze }) => {
  const [expanded, setExpanded] = useState(false);

  const ai = candidate.aiAnalysis || {};
  const proc = candidate.proctoring?.analysis || {};

  return (
    <motion.div
      layout
      className="bg-surface-100 border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-200/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 border border-primary/20 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {candidate.candidateName}
            </h3>
            <p className="text-xs text-text-muted truncate">{candidate.candidateEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Quick scores */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Task: {candidate.taskCompletionScore}
            </span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Overall: {ai.overall_score ?? '—'}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-5">
          {/* Score Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScoreBar
              label="Task Completion"
              score={candidate.taskCompletionScore}
              icon={CheckCircle2}
              color="accent"
            />
            <ScoreBar
              label="Communication"
              score={ai.communication_score}
              icon={MessageCircle}
              color="cyan"
            />
            <ScoreBar
              label="Technical Depth"
              score={ai.technical_depth}
              icon={Brain}
              color="violet"
            />
            <ScoreBar
              label="Problem Solving"
              score={ai.problem_solving}
              icon={Lightbulb}
              color="amber"
            />
            <ScoreBar
              label="Confidence Level"
              score={ai.confidence_level}
              icon={Zap}
              color="rose"
            />
            <ScoreBar
              label="Overall Score"
              score={ai.overall_score}
              icon={Activity}
              color="primary"
            />
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ai.strengths?.length > 0 && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-2">
                  <Star className="w-3.5 h-3.5" /> Key Strengths
                </h4>
                <ul className="space-y-1">
                  {ai.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ai.areas_for_improvement?.length > 0 && (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                  <Lightbulb className="w-3.5 h-3.5" /> Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {ai.areas_for_improvement.map((s, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Proctoring Summary */}
          <div className="bg-surface-200 border border-border rounded-lg p-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              <Shield className="w-3.5 h-3.5 text-primary" /> Proctoring Analysis
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{proc.attentionScore ?? '—'}</p>
                <p className="text-[10px] text-text-muted">Attention</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-accent">{proc.faceDetectionRate ? Math.round(proc.faceDetectionRate * 100) + '%' : '—'}</p>
                <p className="text-[10px] text-text-muted">Face Detection</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-cyan-400">{proc.tabSwitchCount ?? '—'}</p>
                <p className="text-[10px] text-text-muted">Tab Switches</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-violet-400">{proc.environmentScore ?? '—'}</p>
                <p className="text-[10px] text-text-muted">Environment</p>
              </div>
            </div>
            {proc.overallVerdict && (
              <p className="text-xs text-text-secondary mt-3 bg-surface-100 rounded-lg px-3 py-2">
                <Eye className="w-3 h-3 inline mr-1 text-text-muted" />
                {proc.overallVerdict}
              </p>
            )}
          </div>

          {/* Explanation Video */}
          <div>
            <ExplanationVideoPlayer videoUrl={candidate.explanation?.videoUrl} />
          </div>

          {/* Task Submissions */}
          {candidate.submissions?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Task Submissions
              </h4>
              <div className="space-y-2">
                {candidate.submissions.map((sub, i) => (
                  <div
                    key={i}
                    className="bg-surface-200 border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Task {sub.taskIndex + 1}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {sub.taskTitle}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sub.submissionFiles?.map((file, fi) => (
                        <a
                          key={fi}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 bg-primary/5 border border-primary/10 rounded px-2 py-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          File {fi + 1}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                      {sub.githubLink && (
                        <a
                          href={sub.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary bg-surface-300 border border-border rounded px-2 py-1 transition-colors"
                        >
                          <Github className="w-3 h-3" />
                          GitHub
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {(!sub.submissionFiles?.length && !sub.githubLink) && (
                        <span className="text-xs text-text-muted">No files submitted</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </motion.div>
  );
};

export default CandidateEvaluationCard;
