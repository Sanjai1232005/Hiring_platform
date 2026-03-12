import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  MapPin, Mail, Phone, GraduationCap, Linkedin, Github, Globe,
  ExternalLink, Briefcase, Award, Code2, FileText, User, Calendar,
} from 'lucide-react';
import API from '../../apiConfig';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { PageWrapper } from '../../components/animations/pageTransition';

/* ── Section wrapper ── */
const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-surface-100 border border-border rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h2>
    </div>
    {children}
  </div>
);

/* ── Info row ── */
const InfoRow = ({ icon: Icon, label, value, href }) => {
  if (!value) return null;
  const content = (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" className="block hover:bg-surface-200/50 rounded-lg px-2 -mx-2 transition-colors">{content}</a>;
  return <div className="px-2 -mx-2">{content}</div>;
};

const PublicStudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await axios.get(API + '/students/getProfile/' + id);
        setStudent(res.data);
      } catch (err) {
        console.error('Public profile fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [id]);

  if (loading) return <Loader />;
  if (!student) return <div className="flex items-center justify-center min-h-[60vh] text-text-muted text-sm">Profile not found.</div>;

  const hasLinks = student.socialLinks?.linkedin || student.socialLinks?.github || student.socialLinks?.portfolio;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-surface-100 border border-border rounded-xl overflow-hidden"
        >
          {/* gradient bar */}
          <div className="h-28 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />

          <div className="px-6 pb-6">
            {/* avatar + name row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <div className="ring-4 ring-surface-100 rounded-xl">
                <Avatar src={student.profilePhoto} name={student.name} size="xl" />
              </div>
              <div className="flex-1 sm:pb-1">
                <h1 className="text-2xl font-bold text-text-primary">{student.name}</h1>
                <p className="text-sm text-text-muted mt-0.5">
                  {[student.degree, student.branch].filter(Boolean).join(' — ')}
                  {student.college && <span className="text-text-muted"> · {student.college}</span>}
                </p>
              </div>
              {/* Quick actions */}
              <div className="flex items-center gap-2">
                {student.resume && (
                  <a
                    href={student.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Resume
                  </a>
                )}
                {student.socialLinks?.linkedin && (
                  <a href={student.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-surface-200 border border-border rounded-lg hover:border-primary/30 transition-colors">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                  </a>
                )}
                {student.socialLinks?.github && (
                  <a href={student.socialLinks.github} target="_blank" rel="noreferrer" className="p-2 bg-surface-200 border border-border rounded-lg hover:border-primary/30 transition-colors">
                    <Github className="w-4 h-4 text-text-primary" />
                  </a>
                )}
                {student.socialLinks?.portfolio && (
                  <a href={student.socialLinks.portfolio} target="_blank" rel="noreferrer" className="p-2 bg-surface-200 border border-border rounded-lg hover:border-primary/30 transition-colors">
                    <Globe className="w-4 h-4 text-green-400" />
                  </a>
                )}
              </div>
            </div>

            {/* location & contact strip */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-text-muted">
              {student.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {student.location}</span>}
              {student.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {student.email}</span>}
              {student.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {student.phone}</span>}
            </div>
          </div>
        </motion.div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            {student.about && (
              <Section icon={User} title="About">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{student.about}</p>
              </Section>
            )}

            {/* Skills */}
            {student.skills?.length > 0 && (
              <Section icon={Code2} title="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Projects */}
            {student.projects?.length > 0 && (
              <Section icon={Briefcase} title="Projects">
                <div className="space-y-3">
                  {student.projects.map((p, i) => (
                    <div key={i} className="bg-surface-200/50 border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-text-primary">{p.title}</h3>
                        {p.githubLink && (
                          <a href={p.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0 ml-3">
                            <ExternalLink className="w-3 h-3" /> GitHub
                          </a>
                        )}
                      </div>
                      {p.description && <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{p.description}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Experience */}
            {student.experience?.length > 0 && (
              <Section icon={Briefcase} title="Experience">
                <div className="space-y-3">
                  {student.experience.map((e, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{e.role}</p>
                        <p className="text-xs text-text-muted">{e.company}{e.duration && ` · ${e.duration}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Certifications */}
            {student.certifications?.length > 0 && (
              <Section icon={Award} title="Certifications">
                <div className="space-y-2">
                  {student.certifications.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{c.title}</p>
                        <p className="text-xs text-text-muted">{c.issuer}{c.year && ` · ${c.year}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Right column (1/3) sidebar */}
          <div className="space-y-5">
            {/* Contact Card */}
            <Section icon={User} title="Contact">
              <div className="space-y-1">
                <InfoRow icon={Mail} label="Email" value={student.email} href={student.email ? `mailto:${student.email}` : null} />
                <InfoRow icon={Phone} label="Phone" value={student.phone} />
                <InfoRow icon={MapPin} label="Location" value={student.location} />
              </div>
            </Section>

            {/* Education Card */}
            <Section icon={GraduationCap} title="Education">
              <div className="space-y-2">
                {student.college && <p className="text-sm font-medium text-text-primary">{student.college}</p>}
                <p className="text-xs text-text-muted">
                  {[student.degree, student.branch].filter(Boolean).join(' — ')}
                </p>
                {student.graduationYear && (
                  <p className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="w-3 h-3" /> Class of {student.graduationYear}
                  </p>
                )}
              </div>
            </Section>

            {/* Links Card */}
            {hasLinks && (
              <Section icon={Globe} title="Links">
                <div className="space-y-2">
                  {student.socialLinks.linkedin && (
                    <a href={student.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-blue-400 transition-colors">
                      <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn
                    </a>
                  )}
                  {student.socialLinks.github && (
                    <a href={student.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {student.socialLinks.portfolio && (
                    <a href={student.socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-green-400 transition-colors">
                      <Globe className="w-4 h-4 text-green-400" /> Portfolio
                    </a>
                  )}
                </div>
              </Section>
            )}

            {/* Resume Card */}
            {student.resume && (
              <Section icon={FileText} title="Resume">
                <a
                  href={student.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 bg-accent/10 border border-accent/20 rounded-lg text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                  <FileText className="w-4 h-4" /> View Resume
                </a>
              </Section>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PublicStudentProfile;
