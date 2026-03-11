import { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, Loader2, CheckCircle, XCircle, ExternalLink, MessageSquare } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';

const MyInterviews = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/interview/my-interviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRounds(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [token]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-2 text-text-muted text-sm p-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading interviews…
        </div>
      </PageWrapper>
    );
  }

  // Group rounds by job
  const byJob = {};
  rounds.forEach((r) => {
    const key = r.jobId?._id || r.jobId;
    if (!byJob[key]) {
      byJob[key] = {
        jobTitle: r.jobId?.title || 'Unknown Job',
        company: r.jobId?.company || '',
        rounds: [],
      };
    }
    byJob[key].rounds.push(r);
  });

  const jobGroups = Object.entries(byJob);

  return (
    <PageWrapper>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/20 to-primary/20 border border-violet-400/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Interviews</h1>
            <p className="text-text-secondary text-sm">Your scheduled interview rounds &amp; results</p>
          </div>
        </div>
      </div>

      {jobGroups.length === 0 ? (
        <EmptyState
          title="No interviews scheduled"
          description="You'll see your interview rounds here once they are scheduled by the recruiter."
          icon={Video}
        />
      ) : (
        <StaggerList className="space-y-5">
          {jobGroups.map(([jobId, group]) => (
            <StaggerItem key={jobId}>
              <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
                {/* Job header */}
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-base font-semibold text-text-primary">{group.jobTitle}</h2>
                  {group.company && <p className="text-xs text-text-secondary">{group.company}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-muted">{group.rounds.length} round{group.rounds.length !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-accent font-medium">
                      {group.rounds.filter((r) => r.result === 'pass').length} passed
                    </span>
                  </div>
                </div>

                {/* Rounds list */}
                <div className="divide-y divide-border">
                  {group.rounds.map((round) => {
                    const d = new Date(round.date);
                    const now = new Date();
                    const isPast = d < now;
                    const hasFeedback = round.feedback && round.feedback.trim() !== '';

                    /* Derive display status:
                       - future date & pending → Scheduled
                       - past date & pending & no feedback → Awaiting Feedback
                       - result is pass/fail (feedback submitted) → show result */
                    let displayResult;
                    let displayVariant;
                    let DisplayIcon;

                    if (round.result === 'pass') {
                      displayResult = 'PASSED';
                      displayVariant = 'success';
                      DisplayIcon = CheckCircle;
                    } else if (round.result === 'fail') {
                      displayResult = 'FAILED';
                      displayVariant = 'danger';
                      DisplayIcon = XCircle;
                    } else if (!isPast) {
                      displayResult = 'SCHEDULED';
                      displayVariant = 'info';
                      DisplayIcon = Calendar;
                    } else {
                      displayResult = 'AWAITING';
                      displayVariant = 'warning';
                      DisplayIcon = Clock;
                    }

                    return (
                      <div key={round._id} className="px-5 py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DisplayIcon className={`w-4 h-4 ${
                              displayVariant === 'success' ? 'text-accent' :
                              displayVariant === 'danger' ? 'text-red-400' :
                              displayVariant === 'info' ? 'text-blue-400' :
                              'text-amber-400'
                            }`} />
                            <span className="text-sm font-semibold text-text-primary">
                              {round.roundType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            <Badge variant={displayVariant} dot>
                              {displayResult}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                          <span>Interviewer: <span className="text-text-primary font-medium">{round.interviewer?.name || '—'}</span></span>

                          {round.result === 'pending' && !isPast && (
                            <a
                              href={round.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
                            >
                              <ExternalLink className="w-3 h-3" /> Join Meeting
                            </a>
                          )}

                          {round.result === 'pending' && isPast && (
                            <span className="text-amber-400 text-xs">Awaiting feedback from interviewer</span>
                          )}

                          {round.result === 'pass' && (
                            <span className="text-accent text-xs">Interview cleared</span>
                          )}

                          {round.result === 'fail' && (
                            <span className="text-red-400 text-xs">Did not advance</span>
                          )}
                        </div>

                        {round.feedback && (
                          <div className="text-xs text-text-secondary bg-surface-200/50 rounded p-2 border border-border/30 mt-1">
                            <MessageSquare className="w-3 h-3 inline mr-1 text-text-muted" />
                            {round.feedback}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageWrapper>
  );
};

export default MyInterviews;
