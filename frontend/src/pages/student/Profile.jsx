import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3, Github, Linkedin, Globe, FileText, GraduationCap,
  Briefcase, Award, MapPin, Mail, Phone, Calendar, ExternalLink,
  TrendingUp, Target, Users, CheckCircle2, XCircle, Clock,
  ChevronRight, ArrowUpRight, Code2, BookOpen, MessageCircle,
} from 'lucide-react';
import API from '../../apiConfig';
import { PageWrapper } from '../../components/animations/pageTransition';
import { SkeletonProfile } from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

/* ── helpers ── */
const STAGE_LABELS = {
  applied: 'Applied', resume_screening: 'Resume', resume: 'Resume',
  coding_test: 'Coding', coding: 'Coding', task_assessment: 'Task',
  hr_review: 'Review', interview: 'Interview', final: 'Selected', rejected: 'Rejected',
};

const STAGE_COLORS = {
  final: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  interview: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) => (
  <div className="bg-surface-100 border border-border rounded-xl p-4 hover:border-border-light transition-colors">
    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2.5`}>
      <Icon className={`w-4.5 h-4.5 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="text-[11px] text-text-muted">{label}</p>
  </div>
);

/* ── Info Row ── */
const InfoItem = ({ icon: Icon, label, value, href }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">{value}</a>
        ) : (
          <p className="text-sm text-text-primary truncate">{value}</p>
        )}
      </div>
    </div>
  );
};

/* ── Section wrapper ── */
const Section = ({ icon: Icon, title, children, badge }) => (
  <div className="bg-surface-100 border border-border rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h3>
      </div>
      {badge && <span className="text-[10px] font-medium bg-surface-200 text-text-muted px-2 py-0.5 rounded">{badge}</span>}
    </div>
    {children}
  </div>
);

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      const [profileRes, statsRes] = await Promise.all([
        axios.get(API + '/students/getProfile', { headers }),
        axios.get(API + '/students/my-stats', { headers }).catch(() => ({ data: null })),
      ]);
      setStudent(profileRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Profile fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) return <PageWrapper><SkeletonProfile /></PageWrapper>;
  if (!student) return <PageWrapper><p className="text-text-secondary">No profile data found.</p></PageWrapper>;

  const completionFields = ['name', 'email', 'phone', 'location', 'about', 'college', 'degree', 'resume'];
  const completionArrayFields = ['skills', 'projects', 'experience'];
  const filledBasic = completionFields.filter((f) => student[f]).length;
  const filledArrays = completionArrayFields.filter((f) => student[f]?.length > 0).length;
  const completionPct = Math.round(((filledBasic + filledArrays) / (completionFields.length + completionArrayFields.length)) * 100);

  const memberSince = student.joinedAt
    ? new Date(student.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-surface-100 border border-border rounded-2xl overflow-hidden"
        >
          {/* gradient top */}
          <div className="h-28 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(var(--accent-rgb,16,185,129),0.12),transparent_60%)]" />
            <div className="absolute top-3 right-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/edit-profile')} className="bg-surface/60 backdrop-blur-sm">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            </div>
          </div>

          {/* avatar + name */}
          <div className="px-6 pb-6 -mt-10 relative z-10">
            <div className="flex items-end gap-5">
              <div className="ring-4 ring-surface-100 rounded-xl">
                <Avatar src={student.profilePhoto} name={student.name} size="xl" />
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary truncate">{student.name}</h1>
                  <Badge variant="info" dot>Student</Badge>
                </div>
                <p className="text-sm text-text-muted mt-0.5">
                  {student.degree && student.branch
                    ? `${student.degree} in ${student.branch}`
                    : student.email}
                  {student.college && <span className="text-text-muted"> · {student.college}</span>}
                </p>
                {student.about && (
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2 max-w-2xl">{student.about}</p>
                )}
              </div>
            </div>

            {/* quick links row */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {student.location && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MapPin className="w-3.5 h-3.5" /> {student.location}
                </span>
              )}
              {student.email && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Mail className="w-3.5 h-3.5" /> {student.email}
                </span>
              )}
              {student.socialLinks?.github && (
                <a href={student.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {student.socialLinks?.linkedin && (
                <a href={student.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {student.socialLinks?.portfolio && (
                <a href={student.socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Portfolio
                </a>
              )}
              {student.resume && (
                <a href={student.resume} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent hover:underline">
                  <FileText className="w-3.5 h-3.5" /> Resume
                </a>
              )}
            </div>

            {/* profile completion */}
            {completionPct < 100 && (
              <div className="mt-4 bg-surface-200/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-muted">Profile Completion</span>
                  <span className="text-xs font-bold text-primary">{completionPct}%</span>
                </div>
                <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={Briefcase} label="Applied" value={stats.totalApplied} />
            <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="text-blue-400" bg="bg-blue-400/10" />
            <StatCard icon={MessageCircle} label="Interview" value={stats.inInterview} color="text-amber-400" bg="bg-amber-400/10" />
            <StatCard icon={CheckCircle2} label="Selected" value={stats.selected} color="text-emerald-400" bg="bg-emerald-400/10" />
            <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="text-red-400" bg="bg-red-400/10" />
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main content (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            {student.about && (
              <Section icon={BookOpen} title="About">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{student.about}</p>
              </Section>
            )}

            {/* Skills */}
            <Section icon={Code2} title="Skills" badge={student.skills?.length ? `${student.skills.length} skills` : undefined}>
              {student.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No skills added yet. <button onClick={() => navigate('/student/edit-profile')} className="text-primary hover:underline">Add skills</button></p>
              )}
            </Section>

            {/* Projects */}
            <Section icon={Target} title="Projects" badge={student.projects?.length ? `${student.projects.length} projects` : undefined}>
              {student.projects?.length > 0 ? (
                <div className="space-y-3">
                  {student.projects.map((proj, i) => (
                    <div key={i} className="bg-surface-200/50 border border-border rounded-lg p-4 hover:border-border-light transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-text-primary">{proj.title}</h4>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{proj.description}</p>
                        </div>
                        {proj.githubLink && (
                          <a href={proj.githubLink} target="_blank" rel="noreferrer" className="shrink-0 ml-3 w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center text-text-muted hover:text-primary transition-colors">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No projects added yet. <button onClick={() => navigate('/student/edit-profile')} className="text-primary hover:underline">Add projects</button></p>
              )}
            </Section>

            {/* Experience */}
            <Section icon={Briefcase} title="Experience" badge={student.experience?.length ? `${student.experience.length} roles` : undefined}>
              {student.experience?.length > 0 ? (
                <div className="relative pl-4 border-l-2 border-border space-y-4">
                  {student.experience.map((exp, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-100" />
                      <h4 className="text-sm font-semibold text-text-primary">{exp.role}</h4>
                      <p className="text-xs text-text-secondary">{exp.company}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No experience added yet. <button onClick={() => navigate('/student/edit-profile')} className="text-primary hover:underline">Add experience</button></p>
              )}
            </Section>

            {/* Certifications */}
            {student.certifications?.length > 0 && (
              <Section icon={Award} title="Certifications" badge={`${student.certifications.length} certs`}>
                <div className="space-y-2">
                  {student.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface-200/50 border border-border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">{cert.title}</h4>
                        <p className="text-xs text-text-muted">{cert.issuer}</p>
                      </div>
                      <span className="text-[10px] font-medium bg-surface-200 text-text-muted px-2 py-0.5 rounded">{cert.year}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Contact Details */}
            <div className="bg-surface-100 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Contact</h3>
              <div className="space-y-0.5">
                <InfoItem icon={Mail} label="Email" value={student.email} />
                <InfoItem icon={Phone} label="Phone" value={student.phone} />
                <InfoItem icon={MapPin} label="Location" value={student.location} />
              </div>
            </div>

            {/* Education */}
            <div className="bg-surface-100 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Education</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {student.degree || '—'}{student.branch ? ` in ${student.branch}` : ''}
                  </p>
                  <p className="text-xs text-text-secondary">{student.college || '—'}</p>
                  {student.graduationYear && (
                    <p className="text-[10px] text-text-muted mt-0.5">Class of {student.graduationYear}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="bg-surface-100 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Links</h3>
              <div className="space-y-2">
                {student.socialLinks?.linkedin && (
                  <a href={student.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Linkedin className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1 truncate">LinkedIn</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                )}
                {student.socialLinks?.github && (
                  <a href={student.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center">
                      <Github className="w-4 h-4 text-text-secondary" />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1 truncate">GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                )}
                {student.socialLinks?.portfolio && (
                  <a href={student.socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1 truncate">Portfolio</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                )}
                {student.resume && (
                  <a href={student.resume} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1 truncate">Resume</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                )}
                {!student.socialLinks?.linkedin && !student.socialLinks?.github && !student.socialLinks?.portfolio && !student.resume && (
                  <p className="text-xs text-text-muted py-2">No links added yet.</p>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            {stats?.recent?.length > 0 && (
              <div className="bg-surface-100 border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Recent Applications</h3>
                <div className="space-y-2.5">
                  {stats.recent.map((app, i) => {
                    const stageColor = STAGE_COLORS[app.stage] || 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-text-muted" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text-primary truncate">{app.jobTitle}</p>
                          <p className="text-[10px] text-text-muted">{app.company}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${stageColor}`}>
                          {STAGE_LABELS[app.stage] || app.stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
