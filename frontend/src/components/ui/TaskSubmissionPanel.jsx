import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Github, X, FileText, CheckCircle2, Loader2,
  Target, BarChart3, Link2, Code2, ChevronDown,
  AlertCircle, BookOpen, Zap,
} from 'lucide-react';
import uploadToCloudinary from '../../services/cloudinary.service';
import Input from '../../components/ui/Input';

const DIFF_LABEL = { junior: 'Junior', mid: 'Mid-Level', senior: 'Senior', staff: 'Staff / Lead' };
const DIFF_COLOR = {
  junior: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  mid: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  senior: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  staff: 'text-red-400 bg-red-400/10 border-red-400/20',
};

/* ── Collapsible detail section ── */
const DetailSection = ({ icon: Icon, title, accent = 'text-primary', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border/30 pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <Icon className={`w-3 h-3 ${accent}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted group-hover:text-text-secondary transition-colors">{title}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskSubmissionPanel = ({ task, taskIndex, submission, onUpdate }) => {
  const [files, setFiles] = useState(submission?.submissionFiles || []);
  const [githubLink, setGithubLink] = useState(submission?.githubLink || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Sync local state when parent switches tasks (taskIndex changes)
  useEffect(() => {
    setFiles(submission?.submissionFiles || []);
    setGithubLink(submission?.githubLink || '');
    setUploadError('');
  }, [taskIndex]);

  const processFiles = async (selected) => {
    if (selected.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const urls = await Promise.all(
        selected.map((file) => uploadToCloudinary(file, 'raw'))
      );
      const updated = [...files, ...urls];
      setFiles(updated);
      onUpdate({ taskIndex, submissionFiles: updated, githubLink, taskTitle: task.title });
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => processFiles(Array.from(e.target.files));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onUpdate({ taskIndex, submissionFiles: updated, githubLink, taskTitle: task.title });
  };

  const handleGithubChange = (e) => {
    const val = e.target.value;
    setGithubLink(val);
    onUpdate({ taskIndex, submissionFiles: files, githubLink: val, taskTitle: task.title });
  };

  const getFileName = (url) => {
    try {
      return decodeURIComponent(url.split('/').pop().split('?')[0]);
    } catch {
      return 'Uploaded file';
    }
  };

  const hasSubmission = files.length > 0 || githubLink;

  return (
    <div className="space-y-5">
      {/* ── Task Header ── */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-bold text-text-primary">{task.title}</h3>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {task.difficulty && (
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${DIFF_COLOR[task.difficulty] || ''}`}>
                {DIFF_LABEL[task.difficulty] || task.difficulty}
              </span>
            )}
            <span className="text-xs text-text-muted bg-surface-200 px-2 py-1 rounded-lg">⏱ {task.timeLimit}m</span>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{task.description}</p>
      </div>

      {/* ── Task Details (collapsible sections) ── */}
      <div className="bg-surface-200/50 border border-border rounded-xl p-4 space-y-3">
        {task.context && (
          <DetailSection icon={BookOpen} title="Context" accent="text-cyan-400" defaultOpen={false}>
            <p className="text-xs text-text-secondary leading-relaxed pl-5">{task.context}</p>
          </DetailSection>
        )}

        {task.requirements?.length > 0 && (
          <DetailSection icon={Target} title="Requirements" accent="text-primary">
            <ul className="space-y-1.5 pl-5">
              {task.requirements.map((r, ri) => (
                <li key={ri} className="flex items-start gap-2 text-xs text-text-secondary">
                  <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {task.evaluationCriteria?.length > 0 && (
          <DetailSection icon={BarChart3} title="Evaluation Criteria" accent="text-amber-400" defaultOpen={false}>
            <ul className="space-y-1.5 pl-5">
              {task.evaluationCriteria.map((c, ci) => (
                <li key={ci} className="flex items-start gap-2 text-xs text-text-secondary">
                  <BarChart3 className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {c}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {task.techStack?.length > 0 && (
          <DetailSection icon={Code2} title="Tech Stack" accent="text-purple-400">
            <div className="flex flex-wrap gap-1.5 pl-5">
              {task.techStack.map((t, ti) => (
                <span key={ti} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  <Code2 className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {task.resources?.length > 0 && (
          <DetailSection icon={Link2} title="Resources" accent="text-blue-400" defaultOpen={false}>
            <div className="flex flex-wrap gap-2 pl-5">
              {task.resources.map((r, ri) => (
                <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-100 border border-border text-xs text-primary hover:border-primary/40 transition-colors">
                  <Link2 className="w-3 h-3" /> {r.label || 'Resource'}
                </a>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Deliverable */}
        {task.expectedDeliverable && (
          <div className="border-t border-border/30 pt-3">
            <div className="flex items-center gap-2 py-1.5 px-3 bg-accent/5 border border-accent/20 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs text-accent font-medium">Deliverable: {task.expectedDeliverable}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Submission Area ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text-primary">Your Submission</h4>
          {hasSubmission && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          )}
        </div>

        {/* File Upload — drag & drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <label
            className={`flex flex-col items-center gap-2 px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface-200/50 hover:border-primary/30 hover:bg-surface-200'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-primary font-medium">Uploading files...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Drop files here or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">.zip, .js, .py, .java, .ts, .jsx, .tsx, .html, .css, .json, .md</p>
                </div>
              </>
            )}
            <input
              type="file"
              multiple
              accept=".zip,.rar,.7z,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.json,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Uploaded files list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5"
            >
              {files.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between bg-surface-100 border border-border rounded-lg px-3 py-2.5 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-xs text-text-secondary truncate">{getFileName(url)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-text-muted hover:text-red-400 transition-colors shrink-0 ml-2 opacity-50 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GitHub Link */}
        <Input
          label="GitHub Repository (optional)"
          value={githubLink}
          onChange={handleGithubChange}
          placeholder="https://github.com/username/repo"
          icon={Github}
        />
      </div>
    </div>
  );
};

export default TaskSubmissionPanel;
