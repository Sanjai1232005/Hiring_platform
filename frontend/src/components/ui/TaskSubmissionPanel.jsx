import { useState, useEffect } from 'react';
import { Upload, Github, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import uploadToCloudinary from '../../services/cloudinary.service';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const TaskSubmissionPanel = ({ task, taskIndex, submission, onUpdate }) => {
  const [files, setFiles] = useState(submission?.submissionFiles || []);
  const [githubLink, setGithubLink] = useState(submission?.githubLink || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Sync local state when parent switches tasks (taskIndex changes)
  useEffect(() => {
    setFiles(submission?.submissionFiles || []);
    setGithubLink(submission?.githubLink || '');
    setUploadError('');
  }, [taskIndex]);

  const handleFileUpload = async (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      // Upload all files in parallel for speed
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

  return (
    <div className="space-y-4">
      {/* Task Info */}
      <div className="bg-surface-200 border border-border rounded-lg p-4">
        <h3 className="text-base font-semibold text-text-primary mb-1">{task.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">{task.description}</p>
        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            Deliverable: {task.expectedDeliverable}
          </span>
          <span className="flex items-center gap-1">
            ⏱ {task.timeLimit} minutes
          </span>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Upload Files (zip, code files)
        </label>
        <label className="flex items-center gap-2 px-4 py-3 bg-surface-200 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors text-sm text-text-muted">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Choose files (.zip, .js, .py, .java, .ts, .jsx, etc.)
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
        {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((url, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-surface-100 border border-border rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-xs text-text-secondary truncate">
                    {getFileName(url)}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-text-muted hover:text-red-400 transition-colors shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GitHub Link */}
      <div>
        <Input
          label="GitHub Repository Link (optional)"
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
