import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Loader2, Users, BarChart3, Briefcase, Search,
  ArrowRight, Brain, Filter, Sparkles, CheckCircle, Clock,
  AlertCircle, Zap, Activity, Shield, Eye,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import EmptyState from '../../components/ui/EmptyState';
import CandidateEvaluationCard from '../../components/ui/CandidateEvaluationCard';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, accent = 'text-primary' }) => (
  <div className="bg-surface-100 border border-border rounded-xl p-4 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
      <Icon className={`w-4 h-4 ${accent}`} />
    </div>
    <div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const HRTaskDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [results, setResults] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [analysisFilter, setAnalysisFilter] = useState('all'); // 'all' | 'analyzed' | 'pending'
  const [analyzingId, setAnalyzingId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(BASE_URL + '/job/getjobs', { headers });
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = useCallback(async (jobId) => {
    if (!jobId) { setResults(null); return; }
    try {
      setLoadingResults(true);
      const res = await axios.get(BASE_URL + '/tasks/results/' + jobId, { headers });
      setResults(res.data?.data || null);
    } catch (err) {
      console.error('Error fetching task results:', err);
      setResults(null);
    } finally {
      setLoadingResults(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchResults(selectedJobId); }, [selectedJobId, fetchResults]);

  const handleAnalyze = async (candidateId, assessmentId) => {
    try {
      setAnalyzingId(candidateId);
      await axios.post(
        BASE_URL + '/tasks/analyzeExplanation',
        { candidateId, jobId: selectedJobId, assessmentId },
        { headers }
      );
      await fetchResults(selectedJobId);
    } catch (err) {
      console.error('Error running analysis:', err);
      alert('Analysis failed. Make sure the ML service is running.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = jobSearch.toLowerCase();
    return !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q);
  });

  const candidates = results?.candidates || [];
  const assessmentCount = results?.assessments?.length || 0;
  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  /* Derived stats */
  const analyzedCount = candidates.filter((c) => c.aiAnalysis?.overall_score != null).length;
  const pendingAnalysis = candidates.length - analyzedCount;
  const avgScore = analyzedCount > 0
    ? Math.round(candidates.reduce((s, c) => s + (c.aiAnalysis?.overall_score || 0), 0) / analyzedCount)
    : 0;

  /* Filtered candidates */
  const filteredCandidates = candidates.filter((c) => {
    const q = candidateSearch.toLowerCase();
    const nameMatch = !q || c.candidateName?.toLowerCase().includes(q) || c.candidateEmail?.toLowerCase().includes(q);
    if (analysisFilter === 'analyzed') return nameMatch && c.aiAnalysis?.overall_score != null;
    if (analysisFilter === 'pending') return nameMatch && c.aiAnalysis?.overall_score == null;
    return nameMatch;
  });

  if (loadingJobs) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-violet-400/20 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Task Results</h1>
              <p className="text-sm text-text-muted">Review candidate submissions, scores & AI analysis</p>
            </div>
          </div>
          {selectedJob && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-text-muted">Current Job</p>
              <p className="text-sm font-semibold text-primary">{selectedJob.title}</p>
            </div>
          )}
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Create a job first to view task assessment results."
            icon={ClipboardList}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* ── Left sidebar: Job selector + stats ── */}
            <div className="space-y-4">
              <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      placeholder="Search jobs..."
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-200/50 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredJobs.map((j) => (
                    <button
                      key={j._id}
                      onClick={() => setSelectedJobId(j._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                        selectedJobId === j._id
                          ? 'bg-primary/10 border-l-2 border-l-primary'
                          : 'hover:bg-surface-200/50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center shrink-0">
                        <Briefcase className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${selectedJobId === j._id ? 'text-primary' : 'text-text-primary'}`}>
                          {j.title}
                        </p>
                        <p className="text-[10px] text-text-muted truncate">{j.company}</p>
                      </div>
                      {selectedJobId === j._id && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  ))}
                  {filteredJobs.length === 0 && (
                    <p className="px-4 py-6 text-xs text-text-muted text-center">No matching jobs.</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              {selectedJobId && !loadingResults && candidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard icon={Users} label="Candidates" value={candidates.length} accent="text-primary" />
                    <StatCard icon={ClipboardList} label="Assessments" value={assessmentCount} accent="text-accent" />
                    <StatCard icon={Brain} label="Analyzed" value={analyzedCount} accent="text-violet-400" />
                    <StatCard icon={Activity} label="Avg Score" value={avgScore || '—'} accent="text-emerald-400" />
                  </div>

                  {/* Score distribution */}
                  {analyzedCount > 0 && (
                    <div className="bg-surface-100 border border-border rounded-xl p-4">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Score Distribution</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Excellent (80+)', color: 'bg-emerald-400', count: candidates.filter((c) => (c.aiAnalysis?.overall_score || 0) >= 80).length },
                          { label: 'Good (60-79)', color: 'bg-primary', count: candidates.filter((c) => { const s = c.aiAnalysis?.overall_score || 0; return s >= 60 && s < 80; }).length },
                          { label: 'Average (40-59)', color: 'bg-amber-400', count: candidates.filter((c) => { const s = c.aiAnalysis?.overall_score || 0; return s >= 40 && s < 60; }).length },
                          { label: 'Below (<40)', color: 'bg-red-400', count: candidates.filter((c) => { const s = c.aiAnalysis?.overall_score || 0; return s > 0 && s < 40; }).length },
                        ].map((tier) => {
                          const pct = analyzedCount > 0 ? (tier.count / analyzedCount) * 100 : 0;
                          return (
                            <div key={tier.label}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-text-muted">{tier.label}</span>
                                <span className="font-bold text-text-primary">{tier.count}</span>
                              </div>
                              <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${tier.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* ── Right: Main content ── */}
            <div className="space-y-4">
              {!selectedJobId ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border flex items-center justify-center mb-4">
                    <BarChart3 className="w-7 h-7 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Select a Job</h3>
                  <p className="text-sm text-text-muted max-w-sm">Choose a job from the sidebar to view candidate task submissions and AI-powered analysis results.</p>
                </div>
              ) : loadingResults ? (
                <div className="flex items-center gap-2 text-text-muted text-sm py-16 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading results...
                </div>
              ) : (
                <>
                  {/* Search + filter bar */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        placeholder="Search candidates..."
                        className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="flex bg-surface-100 border border-border rounded-xl overflow-hidden">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'analyzed', label: 'Analyzed' },
                        { key: 'pending', label: 'Pending' },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setAnalysisFilter(f.key)}
                          className={`px-3 py-2 text-xs font-medium transition-colors ${
                            analysisFilter === f.key
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Candidates */}
                  {filteredCandidates.length === 0 ? (
                    <EmptyState
                      title={candidates.length === 0 ? 'No submissions yet' : 'No matching candidates'}
                      description={candidates.length === 0 ? 'No candidates have submitted task assessments for this job.' : 'Try a different search or filter.'}
                      icon={Users}
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredCandidates.map((c, idx) => (
                        <CandidateEvaluationCard
                          key={c.candidateId}
                          candidate={c}
                          onAnalyze={handleAnalyze}
                          index={idx}
                          analyzing={analyzingId === c.candidateId}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default HRTaskDashboard;
