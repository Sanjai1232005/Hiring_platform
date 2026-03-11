import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit3, Github, Linkedin, Globe, FileText, GraduationCap, Briefcase, Award } from 'lucide-react';
import API from '../../apiConfig';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';
import { SkeletonProfile } from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API + '/students/getProfile', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setStudent(res.data);
      } catch (err) {
        console.error('Profile fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <PageWrapper><SkeletonProfile /></PageWrapper>;
  if (!student) return <PageWrapper><p className="text-text-secondary">No profile data found.</p></PageWrapper>;

  const Section = ({ icon: Icon, title, children }) => (
    <Card hover={false} className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </Card>
  );

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar src={student.profilePhoto} name={student.name} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{student.name}</h1>
              <p className="text-sm text-text-secondary">{student.email}</p>
              <p className="text-sm text-text-muted">{student.location}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={Edit3} onClick={() => navigate('/student/edit-profile')}>
            Edit
          </Button>
        </div>

        <StaggerList className="space-y-0">
          <StaggerItem>
            <Section icon={GraduationCap} title="Education">
              <p className="text-text-primary font-medium">{student.degree} - {student.branch}</p>
              <p className="text-sm text-text-secondary">{student.college} ({student.graduationYear})</p>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section icon={Award} title="Skills">
              <div className="flex flex-wrap gap-2">
                {student.skills?.length > 0 ? student.skills.map((skill, i) => (
                  <Badge key={i} variant="primary">{skill}</Badge>
                )) : <p className="text-sm text-text-muted">No skills added.</p>}
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section icon={FileText} title="About">
              <p className="text-sm text-text-secondary leading-relaxed">
                {student.about || 'No information provided.'}
              </p>
            </Section>
          </StaggerItem>

          {student.projects?.length > 0 && (
            <StaggerItem>
              <Section icon={Briefcase} title="Projects">
                <div className="space-y-3">
                  {student.projects.map((proj, i) => (
                    <div key={i} className="p-3 bg-surface-200/50 rounded-lg border border-border">
                      <p className="font-medium text-text-primary text-sm">{proj.title}</p>
                      <p className="text-xs text-text-secondary mt-1">{proj.description}</p>
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                          <Github className="w-3 h-3" /> View on GitHub
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </StaggerItem>
          )}

          {student.experience?.length > 0 && (
            <StaggerItem>
              <Section icon={Briefcase} title="Experience">
                <div className="space-y-3">
                  {student.experience.map((exp, i) => (
                    <div key={i} className="p-3 bg-surface-200/50 rounded-lg border border-border">
                      <p className="font-medium text-text-primary text-sm">{exp.role}</p>
                      <p className="text-xs text-text-secondary">{exp.company} | {exp.duration}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </StaggerItem>
          )}

          {student.certifications?.length > 0 && (
            <StaggerItem>
              <Section icon={Award} title="Certifications">
                <div className="space-y-2">
                  {student.certifications.map((cert, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-surface-200/50 rounded-lg border border-border">
                      <p className="font-medium text-text-primary text-sm">{cert.title}</p>
                      <p className="text-xs text-text-muted">{cert.issuer} | {cert.year}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </StaggerItem>
          )}

          <StaggerItem>
            <Section icon={Globe} title="Links">
              <div className="flex flex-wrap gap-3">
                {student.socialLinks?.linkedin && (
                  <a href={student.socialLinks.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {student.socialLinks?.github && (
                  <a href={student.socialLinks.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {student.socialLinks?.portfolio && (
                  <a href={student.socialLinks.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
                    <Globe className="w-4 h-4" /> Portfolio
                  </a>
                )}
                {student.resume && (
                  <a href={student.resume} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                    <FileText className="w-4 h-4" /> Resume
                  </a>
                )}
                {!student.socialLinks?.linkedin && !student.socialLinks?.github && !student.socialLinks?.portfolio && !student.resume && (
                  <p className="text-sm text-text-muted">No links added.</p>
                )}
              </div>
            </Section>
          </StaggerItem>
        </StaggerList>
      </div>
    </PageWrapper>
  );
};

export default Profile;
